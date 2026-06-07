import calendar
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.pace_service import compute_budget_pace


def _get_spent(user_id, category: str, month: int, year: int, db: Session) -> float:
    result = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.category == category,
            Transaction.type == "expense",
            func.extract("month", Transaction.date) == month,
            func.extract("year", Transaction.date) == year,
        )
        .scalar()
    )
    return float(result or 0)


def _serialize_budget(b: Budget, user_id, db: Session) -> dict:
    spent = _get_spent(user_id, b.category, b.month, b.year, db)
    limit = float(b.monthly_limit)
    today = date.today()
    days_in_month = calendar.monthrange(b.year, b.month)[1]
    current_day = today.day if today.month == b.month and today.year == b.year else days_in_month
    pace = compute_budget_pace(spent, limit, current_day, days_in_month)
    return {
        "id": str(b.id),
        "category": b.category,
        "monthly_limit": limit,
        "month": b.month,
        "year": b.year,
        "spent": spent,
        "remaining": limit - spent,
        "utilization_pct": round((spent / limit) * 100, 1) if limit else 0,
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
    b = Budget(user_id=user_id, **data.model_dump())
    db.add(b)
    db.commit()
    db.refresh(b)
    return _serialize_budget(b, user_id, db)


def update_budget(b: Budget, data: BudgetUpdate, user_id, db: Session) -> dict:
    if data.monthly_limit is not None:
        b.monthly_limit = data.monthly_limit
    db.commit()
    db.refresh(b)
    return _serialize_budget(b, user_id, db)


def delete_budget(b: Budget, db: Session) -> None:
    db.delete(b)
    db.commit()


def get_budget_summary(user_id, month: int, year: int, db: Session) -> dict:
    budgets = get_budgets(user_id, month, year, db)
    total_budgeted = sum(b["monthly_limit"] for b in budgets)
    total_spent = sum(b["spent"] for b in budgets)
    on_track = sum(1 for b in budgets if b["pace"]["status"] == "on_track")
    over = sum(1 for b in budgets if b["pace"]["status"] in ("at_risk", "will_exceed", "exceeded"))
    return {
        "total_budgeted": total_budgeted,
        "total_spent": total_spent,
        "remaining": total_budgeted - total_spent,
        "on_track_count": on_track,
        "over_budget_count": over,
        "budgets": budgets,
    }
