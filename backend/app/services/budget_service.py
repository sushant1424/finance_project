import calendar
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.pace_service import compute_budget_pace


def _prev_month(month: int, year: int) -> tuple[int, int]:
    if month == 1:
        return 12, year - 1
    return month - 1, year


def _get_spent(user_id, category: str, month: int, year: int, db: Session) -> float:
    result = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.category == category,
            Transaction.type == "expense",
            Transaction.deleted_at.is_(None),
            func.extract("month", Transaction.date) == month,
            func.extract("year", Transaction.date) == year,
        )
        .scalar()
    )
    return float(result or 0)


def _rollover_amount(user_id, category: str, month: int, year: int, db: Session, depth: int = 0) -> float:
    """Unspent from previous month when that budget has rollover enabled."""
    if depth > 24:
        return 0.0
    pm, py = _prev_month(month, year)
    prev = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.category == category,
            Budget.month == pm,
            Budget.year == py,
            Budget.rollover.is_(True),
        )
        .first()
    )
    if not prev:
        return 0.0
    prev_limit = float(prev.monthly_limit)
    prev_carried = _rollover_amount(user_id, category, pm, py, db, depth + 1)
    prev_effective = prev_limit + prev_carried
    prev_spent = _get_spent(user_id, category, pm, py, db)
    return max(0.0, round(prev_effective - prev_spent, 2))


def _serialize_budget(b: Budget, user_id, db: Session) -> dict:
    spent = _get_spent(user_id, b.category, b.month, b.year, db)
    base_limit = float(b.monthly_limit)
    rollover = bool(b.rollover)
    carried = _rollover_amount(user_id, b.category, b.month, b.year, db) if rollover else 0.0
    limit = base_limit + carried
    today = date.today()
    days_in_month = calendar.monthrange(b.year, b.month)[1]
    is_current = today.month == b.month and today.year == b.year
    if is_current:
        current_day = today.day
        days_left = max(0, days_in_month - today.day)
    elif (b.year, b.month) > (today.year, today.month):
        current_day = 0
        days_left = days_in_month
    else:
        current_day = days_in_month
        days_left = 0
    period_elapsed_pct = round((current_day / days_in_month) * 100, 1) if days_in_month else 0
    pace = compute_budget_pace(spent, limit, max(current_day, 1) if current_day else 1, days_in_month)
    return {
        "id": str(b.id),
        "category": b.category,
        "monthly_limit": base_limit,
        "month": b.month,
        "year": b.year,
        "rollover": rollover,
        "rollover_amount": carried,
        "effective_limit": limit,
        "spent": spent,
        "remaining": limit - spent,
        "utilization_pct": round((spent / limit) * 100, 1) if limit else 0,
        "days_left": days_left,
        "days_in_month": days_in_month,
        "period_elapsed_pct": period_elapsed_pct,
        "pace": pace,
    }


def get_budgets(user_id, month: int, year: int, db: Session) -> list:
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.month == month, Budget.year == year)
        .all()
    )
    return [_serialize_budget(b, user_id, db) for b in budgets]


def create_budget(user_id, data: BudgetCreate, db: Session) -> dict:
    payload = data.model_dump()
    b = Budget(user_id=user_id, **payload)
    db.add(b)
    db.commit()
    db.refresh(b)
    return _serialize_budget(b, user_id, db)


def update_budget(b: Budget, data: BudgetUpdate, user_id, db: Session) -> dict:
    dump = data.model_dump(exclude_unset=True)
    for field, value in dump.items():
        setattr(b, field, value)
    db.commit()
    db.refresh(b)
    return _serialize_budget(b, user_id, db)


def delete_budget(b: Budget, db: Session) -> None:
    db.delete(b)
    db.commit()


def get_budget_summary(user_id, month: int, year: int, db: Session) -> dict:
    budgets = get_budgets(user_id, month, year, db)
    total_budgeted = sum(b["effective_limit"] for b in budgets)
    total_spent = sum(b["spent"] for b in budgets)
    on_track = sum(1 for b in budgets if b["pace"]["status"] == "on_track")
    over = sum(1 for b in budgets if b["pace"]["status"] in ("at_risk", "will_exceed", "exceeded"))
    today = date.today()
    days_in_month = calendar.monthrange(year, month)[1]
    is_current = today.month == month and today.year == year
    current_day = today.day if is_current else (days_in_month if (year, month) < (today.year, today.month) else 0)
    days_left = max(0, days_in_month - today.day) if is_current else (days_in_month if (year, month) > (today.year, today.month) else 0)
    period_elapsed_pct = round((current_day / days_in_month) * 100, 1) if days_in_month and current_day else 0
    utilization_pct = round((total_spent / total_budgeted) * 100, 1) if total_budgeted else 0
    return {
        "total_budgeted": total_budgeted,
        "total_spent": total_spent,
        "remaining": total_budgeted - total_spent,
        "utilization_pct": utilization_pct,
        "days_left": days_left,
        "period_elapsed_pct": period_elapsed_pct,
        "on_track_count": on_track,
        "over_budget_count": over,
        "budgets": budgets,
    }
