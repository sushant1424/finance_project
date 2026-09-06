from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.transaction import Transaction

ACCOUNT_TYPES = ("cash", "bank", "credit_card")


def _serialize(a: Account, balance: float) -> dict:
    return {
        "id": str(a.id),
        "name": a.name,
        "type": a.type,
        "color": a.color,
        "is_default": a.is_default or False,
        "opening_balance": float(a.opening_balance or 0),
        "balance": round(balance, 2),
    }


def _sum_type(user_id, account_id, tx_type: str, db: Session) -> float:
    return float(
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.account_id == account_id,
            Transaction.type == tx_type,
            Transaction.deleted_at.is_(None),
        )
        .scalar()
        or 0
    )


def _sum_transfers_in(user_id, account_id, db: Session) -> float:
    return float(
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.to_account_id == account_id,
            Transaction.type == "transfer",
            Transaction.deleted_at.is_(None),
        )
        .scalar()
        or 0
    )


def _balance(user_id, account_id, db: Session, opening: float = 0) -> float:
    income = _sum_type(user_id, account_id, "income", db)
    expense = _sum_type(user_id, account_id, "expense", db)
    transfers_out = _sum_type(user_id, account_id, "transfer", db)
    transfers_in = _sum_transfers_in(user_id, account_id, db)
    return opening + income - expense - transfers_out + transfers_in


def ensure_default_account(user_id, db: Session) -> Account:
    default = (
        db.query(Account)
        .filter(Account.user_id == user_id, Account.is_default.is_(True))
        .first()
    )
    if default:
        return default

    existing = (
        db.query(Account)
        .filter(Account.user_id == user_id, Account.name != "Goal savings")
        .order_by(Account.created_at.asc())
        .first()
    )
    if existing:
        existing.is_default = True
        db.commit()
        db.refresh(existing)
        return existing

    account = Account(user_id=user_id, name="Cash", type="cash", is_default=True, opening_balance=0)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def get_default_account_id(user_id, db: Session) -> UUID:
    return ensure_default_account(user_id, db).id


def set_default_account(user_id, account_id: UUID, db: Session) -> dict:
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == user_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.name == "Goal savings":
        raise HTTPException(status_code=400, detail="Cannot set Goal savings as default")

    db.query(Account).filter(Account.user_id == user_id, Account.is_default.is_(True)).update(
        {"is_default": False},
        synchronize_session=False,
    )
    account.is_default = True
    db.commit()
    db.refresh(account)
    opening = float(account.opening_balance or 0)
    return _serialize(account, _balance(user_id, account.id, db, opening))


def get_account(user_id, account_id, db: Session) -> dict | None:
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == user_id)
        .first()
    )
    if not account:
        return None
    opening = float(account.opening_balance or 0)
    return _serialize(account, _balance(user_id, account.id, db, opening))


def list_accounts(user_id, db: Session) -> list:
    ensure_default_account(user_id, db)
    accounts = (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .order_by(Account.is_default.desc(), Account.name.asc())
        .all()
    )
    return [
        _serialize(a, _balance(user_id, a.id, db, float(a.opening_balance or 0)))
        for a in accounts
    ]


def net_worth(user_id, db: Session) -> float:
    return round(sum(a["balance"] for a in list_accounts(user_id, db)), 2)


def create_account(user_id, data: dict, db: Session) -> dict:
    if data.get("type") not in ACCOUNT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid account type")
    payload = {k: v for k, v in data.items() if v is not None}
    opening = float(payload.get("opening_balance") or 0)
    payload["opening_balance"] = opening
    account = Account(user_id=user_id, **payload)
    db.add(account)
    db.commit()
    db.refresh(account)
    return _serialize(account, opening)


def update_account(account: Account, data: dict, db: Session) -> dict:
    for field, value in data.items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    opening = float(account.opening_balance or 0)
    return _serialize(account, _balance(account.user_id, account.id, db, opening))


def delete_account(account: Account, db: Session) -> None:
    if account.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default account — set another default first")
    if account.name == "Goal savings":
        raise HTTPException(status_code=400, detail="Cannot delete the Goal savings account")

    default = (
        db.query(Account)
        .filter(
            Account.user_id == account.user_id,
            Account.is_default.is_(True),
            Account.id != account.id,
        )
        .first()
    )
    if not default:
        raise HTTPException(status_code=400, detail="Must keep a default account")

    db.query(Transaction).filter(Transaction.account_id == account.id).update(
        {"account_id": default.id}, synchronize_session=False
    )
    db.query(Transaction).filter(Transaction.to_account_id == account.id).update(
        {"to_account_id": default.id}, synchronize_session=False
    )
    db.delete(account)
    db.commit()
