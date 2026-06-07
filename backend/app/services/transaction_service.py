from datetime import date
from decimal import Decimal

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.anomaly_service import compute_z_score


def _serialize(t: Transaction) -> dict:
    return {
        "id": str(t.id),
        "type": t.type,
        "amount": float(t.amount),
        "description": t.description,
        "category": t.category,
        "date": t.date.isoformat(),
        "notes": t.notes,
        "is_anomaly": t.is_anomaly or False,
        "z_score": t.z_score,
        "anomaly_severity": t.anomaly_severity,
        "anomaly_reviewed": t.anomaly_reviewed or False,
        "created_at": t.created_at.isoformat() if t.created_at else "",
    }


def _apply_anomaly_check(t: Transaction, db: Session) -> None:
    if t.type != "expense":
        return
    exclude = t.id if t.id else None
    z, severity, is_anomaly = compute_z_score(float(t.amount), t.category, t.user_id, db, exclude_id=exclude)
    t.z_score = z
    t.anomaly_severity = severity
    t.is_anomaly = is_anomaly


def get_transactions(user_id, db: Session, params: dict) -> dict:
    q = db.query(Transaction).filter(Transaction.user_id == user_id)
    if params.get("type"):
        q = q.filter(Transaction.type == params["type"])
    if params.get("category"):
        q = q.filter(Transaction.category == params["category"])
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
    return {"items": [_serialize(t) for t in items], "total": total, "page": page, "limit": limit}


def create_transaction(user_id, data: TransactionCreate, db: Session) -> dict:
    t = Transaction(user_id=user_id, **data.model_dump())
    _apply_anomaly_check(t, db)
    db.add(t)
    db.commit()
    db.refresh(t)
    return _serialize(t)


def update_transaction(t: Transaction, data: TransactionUpdate, db: Session) -> dict:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(t, field, value)
    _apply_anomaly_check(t, db)
    db.commit()
    db.refresh(t)
    return _serialize(t)


def delete_transaction(t: Transaction, db: Session) -> None:
    db.delete(t)
    db.commit()


def bulk_delete(user_id, ids: list, db: Session) -> int:
    count = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.id.in_(ids))
        .delete(synchronize_session=False)
    )
    db.commit()
    return count


def export_csv(user_id, db: Session, params: dict) -> str:
    params["limit"] = 10000
    params["page"] = 1
    result = get_transactions(user_id, db, params)
    lines = ["date,type,category,description,amount,notes"]
    for t in result["items"]:
        notes = (t.get("notes") or "").replace(",", " ")
        desc = t["description"].replace(",", " ")
        lines.append(f'{t["date"]},{t["type"]},{t["category"]},{desc},{t["amount"]},{notes}')
    return "\n".join(lines)
