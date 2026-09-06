from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.recurring_bill import RecurringBill
from app.models.transaction import Transaction
from app.services.recurring_bill_service import _serialize


def _next_due(bill: RecurringBill, last_paid: date | None, today: date) -> date | None:
    if bill.frequency == "weekly":
        base = last_paid or today
        nxt = base + timedelta(days=7)
        return nxt if nxt >= today else today
    if bill.frequency == "bi-weekly":
        base = last_paid or today
        nxt = base + timedelta(days=14)
        return nxt if nxt >= today else today

    due_day = bill.due_day or (last_paid.day if last_paid else today.day)
    due_day = max(1, min(due_day, 28))

    if bill.frequency == "monthly":
        candidate = _safe_date(today.year, today.month, due_day)
        if candidate >= today:
            return candidate
        month, year = today.month + 1, today.year
        if month > 12:
            month, year = 1, year + 1
        return _safe_date(year, month, due_day)

    if bill.frequency == "quarterly":
        months = [1, 4, 7, 10]
        for m in months:
            candidate = _safe_date(today.year, m, due_day)
            if candidate >= today:
                return candidate
        return _safe_date(today.year + 1, 1, due_day)

    if bill.frequency == "yearly":
        candidate = _safe_date(today.year, today.month if bill.due_day else 1, due_day)
        if candidate >= today:
            return candidate
        return _safe_date(today.year + 1, candidate.month, due_day)

    return None


def _safe_date(year: int, month: int, day: int) -> date:
    import calendar
    day = min(day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def get_upcoming_due(user_id, db: Session, days: int = 3) -> list:
    today = date.today()
    cutoff = today + timedelta(days=days)
    bills = (
        db.query(RecurringBill)
        .filter(RecurringBill.user_id == user_id, RecurringBill.is_active.is_(True))
        .all()
    )
    upcoming = []
    for bill in bills:
        last_tx = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.description == bill.description,
                Transaction.type == bill.type,
                Transaction.deleted_at.is_(None),
            )
            .order_by(Transaction.date.desc())
            .first()
        )
        last_paid = last_tx.date if last_tx else None
        nxt = _next_due(bill, last_paid, today)
        if nxt and nxt <= cutoff:
            item = _serialize(bill, db)
            item["next_due"] = nxt.isoformat()
            item["days_until"] = (nxt - today).days
            upcoming.append(item)
    upcoming.sort(key=lambda x: x["days_until"])
    return upcoming
