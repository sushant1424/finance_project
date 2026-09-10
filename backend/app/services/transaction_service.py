from datetime import datetime, timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.account_service import get_default_account_id

TRASH_RETENTION_DAYS = 30


def _purge_old_trash(user_id, db: Session) -> None:
    cutoff = datetime.utcnow() - timedelta(days=TRASH_RETENTION_DAYS)
    db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.deleted_at.isnot(None),
        Transaction.deleted_at < cutoff,
    ).delete(synchronize_session=False)
    db.commit()


def _serialize(t: Transaction, anomaly: dict | None = None) -> dict:
    return {
        "id": str(t.id),
        "type": t.type,
        "amount": float(t.amount),
        "description": t.description,
        "category": t.category,
        "date": t.date.isoformat(),
        "notes": t.notes,
        "is_recurring": t.is_recurring or False,
        "anomaly_acknowledged": bool(getattr(t, "anomaly_acknowledged", False)),
        "anomaly": anomaly,
        "account_id": str(t.account_id) if t.account_id else None,
        "to_account_id": str(t.to_account_id) if t.to_account_id else None,
        "deleted_at": t.deleted_at.isoformat() if t.deleted_at else None,
        "created_at": t.created_at.isoformat() if t.created_at else "",
    }


def _annotate_list(user_id, items: list[Transaction], db: Session) -> list[dict]:
    from app.services.anomaly_service import (
        anomaly_payload_for_tx,
        build_category_amount_index,
    )

    index = build_category_amount_index(user_id, db)
    return [_serialize(t, anomaly=anomaly_payload_for_tx(t, index)) for t in items]


def _parse_uuid(value) -> UUID | None:
    if value is None or value == "":
        return None
    return UUID(str(value))


def _owned_account(user_id, account_id: UUID, db: Session) -> Account:
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == user_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=400, detail="Account not found")
    return account


def get_transactions(user_id, db: Session, params: dict) -> dict:
    _purge_old_trash(user_id, db)
    q = db.query(Transaction).filter(Transaction.user_id == user_id)

    if params.get("trash"):
        q = q.filter(Transaction.deleted_at.isnot(None))
    else:
        q = q.filter(Transaction.deleted_at.is_(None))

    if params.get("type"):
        q = q.filter(Transaction.type == params["type"])
    if params.get("category"):
        q = q.filter(Transaction.category == params["category"])
    if params.get("account_id"):
        aid = params["account_id"]
        q = q.filter(
            or_(
                Transaction.account_id == aid,
                Transaction.to_account_id == aid,
            )
        )
    if params.get("date_from"):
        q = q.filter(Transaction.date >= params["date_from"])
    if params.get("date_to"):
        q = q.filter(Transaction.date <= params["date_to"])
    if params.get("amount_min"):
        q = q.filter(Transaction.amount >= params["amount_min"])
    if params.get("amount_max"):
        q = q.filter(Transaction.amount <= params["amount_max"])
    if params.get("search"):
        q = q.filter(Transaction.description.ilike(f"%{params['search']}%"))

    total = q.count()
    sort_col = getattr(Transaction, params.get("sort_by", "date"), Transaction.date)
    order = desc(sort_col) if params.get("sort_order") == "desc" else asc(sort_col)
    page, limit = params.get("page", 1), params.get("limit", 20)
    items = q.order_by(order).offset((page - 1) * limit).limit(limit).all()
    return {
        "items": _annotate_list(user_id, items, db),
        "total": total,
        "page": page,
        "limit": limit,
    }


def create_transaction(user_id, data: TransactionCreate, db: Session) -> dict:
    payload = data.model_dump(exclude={"frequency"})
    payload["account_id"] = _parse_uuid(payload.get("account_id"))
    payload["to_account_id"] = _parse_uuid(payload.get("to_account_id"))

    if data.type == "transfer":
        _owned_account(user_id, payload["account_id"], db)
        _owned_account(user_id, payload["to_account_id"], db)
        payload["is_recurring"] = False
        payload["category"] = payload.get("category") or "transfer"
    else:
        payload["to_account_id"] = None
        if not payload.get("account_id"):
            payload["account_id"] = get_default_account_id(user_id, db)
        else:
            _owned_account(user_id, payload["account_id"], db)

    t = Transaction(user_id=user_id, **payload)
    db.add(t)
    db.commit()
    db.refresh(t)

    if data.is_recurring and data.type != "transfer":
        from app.services.recurring_bill_service import upsert_from_transaction
        upsert_from_transaction(user_id, data.model_dump(), db)

    return _serialize(t)


def update_transaction(t: Transaction, data: TransactionUpdate, db: Session) -> dict:
    dump = data.model_dump(exclude_unset=True)
    frequency = dump.pop("frequency", None)

    if "account_id" in dump:
        dump["account_id"] = _parse_uuid(dump["account_id"])
        if dump["account_id"]:
            _owned_account(t.user_id, dump["account_id"], db)
    if "to_account_id" in dump:
        dump["to_account_id"] = _parse_uuid(dump["to_account_id"])
        if dump["to_account_id"]:
            _owned_account(t.user_id, dump["to_account_id"], db)

    tx_type = dump.get("type", t.type)
    if tx_type == "transfer":
        dump["is_recurring"] = False
        if not dump.get("category"):
            dump["category"] = "transfer"
    elif "type" in dump:
        dump["to_account_id"] = None

    for field, value in dump.items():
        setattr(t, field, value)
    db.commit()
    db.refresh(t)

    if data.is_recurring and t.type != "transfer":
        from app.services.recurring_bill_service import upsert_from_transaction
        upsert_from_transaction(t.user_id, {
            "type": t.type,
            "description": t.description,
            "amount": t.amount,
            "category": t.category,
            "notes": t.notes,
            "is_recurring": True,
            "frequency": frequency or "monthly",
        }, db)

    return _serialize(t)


def delete_transaction(t: Transaction, db: Session) -> None:
    t.deleted_at = datetime.utcnow()
    db.commit()


def restore_transaction(t: Transaction, db: Session) -> dict:
    t.deleted_at = None
    db.commit()
    db.refresh(t)
    return _serialize(t)


def bulk_delete(user_id, ids: list, db: Session) -> int:
    now = datetime.utcnow()
    count = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.id.in_(ids),
            Transaction.deleted_at.is_(None),
        )
        .update({"deleted_at": now}, synchronize_session=False)
    )
    db.commit()
    return count


def export_csv(user_id, db: Session, params: dict) -> str:
    params["limit"] = 10000
    params["page"] = 1
    result = get_transactions(user_id, db, params)
    accounts = {
        str(a.id): a.name
        for a in db.query(Account).filter(Account.user_id == user_id).all()
    }
    lines = ["date,description,category,type,amount,account,notes"]
    for t in result["items"]:
        notes = (t.get("notes") or "").replace(",", " ")
        desc = t["description"].replace(",", " ")
        account = accounts.get(t.get("account_id") or "", "")
        lines.append(
            f'{t["date"]},{desc},{t["category"]},{t["type"]},{t["amount"]},{account},{notes}'
        )
    return "\n".join(lines)
