"""Shared query helpers for analytics endpoints."""

from datetime import date

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def _active(q):
    return q.filter(Transaction.deleted_at.is_(None))


def sum_by_type(user_id, tx_type: str, month: int, year: int, db: Session) -> float:
    result = (
        _active(db.query(func.coalesce(func.sum(Transaction.amount), 0)))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == tx_type,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .scalar()
    )
    return float(result or 0)


def effective_reference_date(user_id, db: Session) -> date:
    """Use today if the current month has data; else latest transaction date."""
    today = date.today()
    has_data = (
        _active(db.query(Transaction))
        .filter(
            Transaction.user_id == user_id,
            extract("month", Transaction.date) == today.month,
            extract("year", Transaction.date) == today.year,
        )
        .first()
        is not None
    )
    if has_data:
        return today

    latest = (
        _active(db.query(Transaction))
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc())
        .first()
    )
    return latest.date if latest else today
