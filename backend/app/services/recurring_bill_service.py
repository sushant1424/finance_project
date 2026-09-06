"""CRUD and suggestions for recurring bills."""

from collections import defaultdict
from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.recurring_bill import RecurringBill
from app.models.transaction import Transaction
from app.schemas.recurring_bill import RecurringBillCreate, RecurringBillUpdate
from app.schemas.transaction import TransactionCreate

# Monthly equivalent for summary totals
FREQ_MONTHLY_FACTOR = {
    "weekly": 52 / 12,
    "bi-weekly": 26 / 12,
    "monthly": 1,
    "quarterly": 1 / 3,
    "yearly": 1 / 12,
}


def _monthly_amount(amount: float, frequency: str) -> float:
    return round(amount * FREQ_MONTHLY_FACTOR.get(frequency, 1), 2)


def _serialize(bill: RecurringBill, db: Session) -> dict:
    last_tx = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == bill.user_id,
            Transaction.description == bill.description,
            Transaction.type == bill.type,
        )
        .order_by(Transaction.date.desc())
        .first()
    )
    amt = float(bill.amount)
    return {
        "id": str(bill.id),
        "type": bill.type,
        "description": bill.description,
        "amount": amt,
        "category": bill.category,
        "frequency": bill.frequency,
        "due_day": bill.due_day,
        "notes": bill.notes,
        "is_active": bill.is_active,
        "monthly_amount": _monthly_amount(amt, bill.frequency),
        "annual_cost": round(_monthly_amount(amt, bill.frequency) * 12, 2),
        "last_paid": last_tx.date.isoformat() if last_tx else None,
        "created_at": bill.created_at.isoformat() if bill.created_at else "",
    }


def sync_from_transactions(user_id, db: Session) -> int:
    """Import existing is_recurring transactions into recurring_bills (one-time)."""
    if db.query(RecurringBill).filter(RecurringBill.user_id == user_id).first():
        return 0

    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.is_recurring.is_(True))
        .order_by(Transaction.date.desc())
        .all()
    )
    seen = set()
    created = 0
    for t in txs:
        key = t.description.lower().strip()
        if key in seen:
            continue
        seen.add(key)
        db.add(RecurringBill(
            user_id=user_id,
            type=t.type,
            description=t.description,
            amount=t.amount,
            category=t.category,
            frequency="monthly",
            notes=t.notes,
        ))
        created += 1
    if created:
        db.commit()
    return created


def list_bills(user_id, db: Session, page: int = 1, limit: int = 10, bill_type: str | None = None) -> dict:
    sync_from_transactions(user_id, db)
    q = db.query(RecurringBill).filter(RecurringBill.user_id == user_id, RecurringBill.is_active.is_(True))
    if bill_type in ("income", "expense"):
        q = q.filter(RecurringBill.type == bill_type)

    all_active = q.all()
    total_monthly = sum(_monthly_amount(float(b.amount), b.frequency) for b in all_active)
    total = len(all_active)

    items = (
        q.order_by(RecurringBill.description.asc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return {
        "items": [_serialize(b, db) for b in items],
        "total": total,
        "page": page,
        "limit": limit,
        "summary": {
            "total_monthly": round(total_monthly, 2),
            "count": total,
        },
    }


def create_bill(user_id, data: RecurringBillCreate, db: Session) -> dict:
    bill = RecurringBill(user_id=user_id, **data.model_dump())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return _serialize(bill, db)


def update_bill(bill: RecurringBill, data: RecurringBillUpdate, db: Session) -> dict:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bill, field, value)
    db.commit()
    db.refresh(bill)
    return _serialize(bill, db)


def delete_bill(bill: RecurringBill, db: Session) -> None:
    bill.is_active = False
    db.commit()


def record_payment(bill: RecurringBill, db: Session, pay_date: date | None = None) -> dict:
    from app.services import transaction_service

    tx_data = TransactionCreate(
        type=bill.type,
        amount=bill.amount,
        description=bill.description,
        category=bill.category,
        date=pay_date or date.today(),
        notes=bill.notes,
        is_recurring=True,
    )
    return transaction_service.create_transaction(bill.user_id, tx_data, db)


def upsert_from_transaction(user_id, data: dict, db: Session) -> None:
    """Create or update a bill when a transaction is marked recurring."""
    if not data.get("is_recurring"):
        return

    frequency = data.get("frequency") or "monthly"
    existing = (
        db.query(RecurringBill)
        .filter(
            RecurringBill.user_id == user_id,
            RecurringBill.description == data["description"],
            RecurringBill.is_active.is_(True),
        )
        .first()
    )
    if existing:
        existing.amount = data["amount"]
        existing.category = data["category"]
        existing.type = data["type"]
        existing.frequency = frequency
        if data.get("notes"):
            existing.notes = data["notes"]
    else:
        db.add(RecurringBill(
            user_id=user_id,
            type=data["type"],
            description=data["description"],
            amount=data["amount"],
            category=data["category"],
            frequency=frequency,
            notes=data.get("notes"),
        ))
    db.commit()


def get_suggestions(user_id, db: Session) -> list:
    """Detect recurring patterns from transactions not yet saved as bills."""
    existing_desc = {
        b.description.lower()
        for b in db.query(RecurringBill)
        .filter(RecurringBill.user_id == user_id, RecurringBill.is_active.is_(True))
        .all()
    }

    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc())
        .all()
    )

    groups = defaultdict(list)
    for t in txs:
        groups[t.description.lower().strip()].append(t)

    suggestions = []
    for desc_key, items in groups.items():
        if desc_key in existing_desc:
            continue
        months = {(t.date.year, t.date.month) for t in items}
        if len(months) < 2:
            continue

        amounts = [float(t.amount) for t in items]
        latest = max(items, key=lambda t: t.date)
        months_count = max(len(months), 1)
        avg = round(sum(amounts) / len(amounts), 2)

        from app.services.recurring_service import _detect_frequency

        suggestions.append({
            "description": latest.description,
            "type": latest.type,
            "category": latest.category,
            "amount": avg,
            "frequency": _detect_frequency(months_count, len(items)),
            "last_paid": latest.date.isoformat(),
            "occurrences": len(items),
        })

    suggestions.sort(key=lambda x: x["amount"], reverse=True)
    return suggestions[:10]
