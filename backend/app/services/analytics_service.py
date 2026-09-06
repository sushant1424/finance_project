from datetime import date

from sqlalchemy import extract, func, or_
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.goal import Goal
from app.models.transaction import Transaction
from app.services.analytics_helpers import (
    effective_reference_date,
    sum_by_type,
)


def get_dashboard(user_id, db: Session) -> dict:
    today = effective_reference_date(user_id, db)

    income = sum_by_type(user_id, "income", today.month, today.year, db)
    expenses = sum_by_type(user_id, "expense", today.month, today.year, db)

    prev_month = today.month - 1 or 12
    prev_year = today.year if today.month > 1 else today.year - 1
    prev_income = sum_by_type(user_id, "income", prev_month, prev_year, db)
    prev_expenses = sum_by_type(user_id, "expense", prev_month, prev_year, db)
    prev_balance = prev_income - prev_expenses
    balance = income - expenses
    if prev_balance != 0:
        change_pct = round(((balance - prev_balance) / abs(prev_balance)) * 100, 1)
    elif balance != 0:
        change_pct = None
    else:
        change_pct = 0

    from app.services.account_service import net_worth as calc_net_worth
    total_net_worth = calc_net_worth(user_id, db)

    recent = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.deleted_at.is_(None))
        .order_by(Transaction.date.desc())
        .limit(5)
        .all()
    )

    total_transactions = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.user_id == user_id, Transaction.deleted_at.is_(None))
        .scalar()
    )
    total_income_all = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.deleted_at.is_(None),
        )
        .scalar()
    )
    total_expenses_all = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.deleted_at.is_(None),
        )
        .scalar()
    )
    goals_count = db.query(func.count(Goal.id)).filter(Goal.user_id == user_id).scalar()
    budgets_count = db.query(func.count(Budget.id)).filter(Budget.user_id == user_id).scalar()

    top_cat_rows = (
        db.query(Transaction.category, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.deleted_at.is_(None),
            extract("month", Transaction.date) == today.month,
            extract("year", Transaction.date) == today.year,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(3)
        .all()
    )
    top_cat_row = top_cat_rows[0] if top_cat_rows else None
    daily_burn = round(expenses / max(today.day, 1), 2) if expenses else 0

    active_goal = (
        db.query(Goal)
        .filter(
            Goal.user_id == user_id,
            or_(Goal.status.is_(None), Goal.status == "active"),
        )
        .order_by(Goal.created_at.desc())
        .first()
    )
    goal_nudge = None
    if active_goal and float(active_goal.target_amount or 0) > 0:
        current = float(active_goal.current_amount or 0)
        target = float(active_goal.target_amount)
        goal_nudge = {
            "id": str(active_goal.id),
            "name": active_goal.name,
            "icon": active_goal.icon or "🎯",
            "progress_pct": round(min((current / target) * 100, 100), 0),
        }

    return {
        "net_balance": balance,
        "net_worth": total_net_worth,
        "balance_change_pct": change_pct,
        "total_income": income,
        "total_expenses": expenses,
        "prev_income": prev_income,
        "prev_expenses": prev_expenses,
        "total_transactions": int(total_transactions or 0),
        "total_income_all": float(total_income_all or 0),
        "total_expenses_all": float(total_expenses_all or 0),
        "goals_count": int(goals_count or 0),
        "budgets_count": int(budgets_count or 0),
        "top_category": top_cat_row.category if top_cat_row else None,
        "top_category_amount": float(top_cat_row.total) if top_cat_row else 0,
        "top_categories": [
            {"category": r.category, "amount": float(r.total)} for r in top_cat_rows
        ],
        "goal_nudge": goal_nudge,
        "daily_burn": daily_burn,
        "recent_transactions": [
            {
                "id": str(t.id),
                "type": t.type,
                "amount": float(t.amount),
                "description": t.description,
                "category": t.category,
                "date": t.date.isoformat(),
            }
            for t in recent[:5]
        ],
    }


def get_cashflow(user_id, months: int, db: Session) -> list:
    today = date.today()
    data = []
    for i in range(months - 1, -1, -1):
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        income = sum_by_type(user_id, "income", month, year, db)
        expenses = sum_by_type(user_id, "expense", month, year, db)
        label = date(year, month, 1).strftime("%b %y")
        data.append({"month": label, "income": income, "expenses": expenses})
    return data


def get_categories(user_id, date_from: date, date_to: date, db: Session) -> list:
    rows = (
        db.query(Transaction.category, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= date_from,
            Transaction.date <= date_to,
        )
        .group_by(Transaction.category)
        .all()
    )
    total = sum(float(r.total) for r in rows) or 1
    return [
        {
            "category": r.category,
            "amount": float(r.total),
            "percentage": round((float(r.total) / total) * 100, 1),
        }
        for r in rows
    ]


def get_monthly_comparison(user_id, year: int, db: Session) -> list:
    data = []
    for month in range(1, 13):
        income = sum_by_type(user_id, "income", month, year, db)
        expenses = sum_by_type(user_id, "expense", month, year, db)
        data.append({"month": date(year, month, 1).strftime("%b"), "income": income, "expenses": expenses})
    return data


def get_savings_rate(user_id, db: Session) -> list:
    today = date.today()
    result = []
    for i in range(11, -1, -1):
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        income = sum_by_type(user_id, "income", month, year, db)
        expenses = sum_by_type(user_id, "expense", month, year, db)
        savings = income - expenses
        rate = round((savings / income) * 100, 1) if income > 0 else 0
        result.append({
            "month": month,
            "year": year,
            "label": date(year, month, 1).strftime("%b %y"),
            "income": income,
            "expenses": expenses,
            "savings": savings,
            "rate": rate,
        })
    return result
