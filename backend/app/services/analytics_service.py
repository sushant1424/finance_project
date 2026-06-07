from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.goal import Goal
from app.models.transaction import Transaction
from app.services.trend_service import compute_ewma, get_trend_direction


def _sum_by_type(user_id, tx_type: str, month: int, year: int, db: Session) -> float:
    result = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == tx_type,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .scalar()
    )
    return float(result or 0)


def get_dashboard(user_id, db: Session) -> dict:
    today = date.today()
    income = _sum_by_type(user_id, "income", today.month, today.year, db)
    expenses = _sum_by_type(user_id, "expense", today.month, today.year, db)

    prev_month = today.month - 1 or 12
    prev_year = today.year if today.month > 1 else today.year - 1
    prev_income = _sum_by_type(user_id, "income", prev_month, prev_year, db)
    prev_expenses = _sum_by_type(user_id, "expense", prev_month, prev_year, db)
    prev_balance = prev_income - prev_expenses
    balance = income - expenses
    change_pct = (
        round(((balance - prev_balance) / abs(prev_balance)) * 100, 1)
        if prev_balance != 0
        else 0
    )

    anomalies = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.user_id == user_id,
            Transaction.is_anomaly == True,
            extract("month", Transaction.date) == today.month,
            extract("year", Transaction.date) == today.year,
        )
        .scalar()
    )

    recent = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc())
        .limit(15)
        .all()
    )

    total_transactions = db.query(func.count(Transaction.id)).filter(Transaction.user_id == user_id).scalar()
    total_income_all = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id, Transaction.type == "income")
        .scalar()
    )
    total_expenses_all = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == user_id, Transaction.type == "expense")
        .scalar()
    )
    total_anomalies = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.user_id == user_id, Transaction.is_anomaly == True)
        .scalar()
    )
    goals_count = db.query(func.count(Goal.id)).filter(Goal.user_id == user_id).scalar()
    budgets_count = db.query(func.count(Budget.id)).filter(Budget.user_id == user_id).scalar()

    top_cat_row = (
        db.query(Transaction.category, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            extract("month", Transaction.date) == today.month,
            extract("year", Transaction.date) == today.year,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .first()
    )
    daily_burn = round(expenses / max(today.day, 1), 2) if expenses else 0

    return {
        "net_balance": balance,
        "balance_change_pct": change_pct,
        "total_income": income,
        "total_expenses": expenses,
        "prev_income": prev_income,
        "prev_expenses": prev_expenses,
        "active_anomalies": int(anomalies or 0),
        "total_transactions": int(total_transactions or 0),
        "total_income_all": float(total_income_all or 0),
        "total_expenses_all": float(total_expenses_all or 0),
        "total_anomalies": int(total_anomalies or 0),
        "goals_count": int(goals_count or 0),
        "budgets_count": int(budgets_count or 0),
        "top_category": top_cat_row.category if top_cat_row else None,
        "top_category_amount": float(top_cat_row.total) if top_cat_row else 0,
        "daily_burn": daily_burn,
        "recent_transactions": [
            {
                "id": str(t.id),
                "type": t.type,
                "amount": float(t.amount),
                "description": t.description,
                "category": t.category,
                "date": t.date.isoformat(),
                "is_anomaly": t.is_anomaly or False,
                "anomaly_severity": t.anomaly_severity,
            }
            for t in recent
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
        income = _sum_by_type(user_id, "income", month, year, db)
        expenses = _sum_by_type(user_id, "expense", month, year, db)
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
        income = _sum_by_type(user_id, "income", month, year, db)
        expenses = _sum_by_type(user_id, "expense", month, year, db)
        data.append({"month": date(year, month, 1).strftime("%b"), "income": income, "expenses": expenses})
    return data


def get_spending_trend(user_id, date_from: date, date_to: date, alpha: float, db: Session) -> dict:
    rows = (
        db.query(Transaction.date, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= date_from,
            Transaction.date <= date_to,
        )
        .group_by(Transaction.date)
        .order_by(Transaction.date)
        .all()
    )
    daily = [{"date": r.date.isoformat(), "amount": float(r.total)} for r in rows]
    amounts = [d["amount"] for d in daily]
    ewma = compute_ewma(amounts, alpha)
    trend = get_trend_direction(ewma)
    for i, d in enumerate(daily):
        d["ewma"] = ewma[i] if i < len(ewma) else 0
    return {"daily": daily, "trend": trend}


def get_day_of_week(user_id, date_from: date, date_to: date, db: Session) -> list:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    totals = defaultdict(float)
    rows = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= date_from,
            Transaction.date <= date_to,
        )
        .all()
    )
    for t in rows:
        totals[days[t.date.weekday()]] += float(t.amount)
    return [{"day": d, "amount": totals[d]} for d in days]


DAY_NAMES = {
    "Mon": "Mondays", "Tue": "Tuesdays", "Wed": "Wednesdays",
    "Thu": "Thursdays", "Fri": "Fridays", "Sat": "Saturdays", "Sun": "Sundays",
}


def _health_grade(score: int) -> str:
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 55:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def _detect_recurring(user_id, db: Session, days: int = 90) -> list:
    since = date.today() - timedelta(days=days)
    rows = (
        db.query(
            Transaction.description,
            func.count(Transaction.id).label("cnt"),
            func.avg(Transaction.amount).label("avg"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= since,
        )
        .group_by(Transaction.description)
        .having(func.count(Transaction.id) >= 2)
        .all()
    )
    return [
        {"description": r.description, "count": int(r.cnt), "avg_amount": round(float(r.avg), 2)}
        for r in sorted(rows, key=lambda x: -float(x.avg))[:5]
    ]


def get_insights(user_id, db: Session) -> dict:
    from app.services.budget_service import get_budgets

    today = date.today()
    income = _sum_by_type(user_id, "income", today.month, today.year, db)
    expenses = _sum_by_type(user_id, "expense", today.month, today.year, db)
    balance = income - expenses
    savings_rate = round((balance / income) * 100, 1) if income > 0 else 0

    last_30 = today - timedelta(days=30)
    expense_30 = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= last_30,
        )
        .scalar()
    )
    avg_daily = float(expense_30 or 0) / 30
    runway_days = round(balance / avg_daily, 1) if avg_daily > 0 and balance > 0 else 0

    dow = get_day_of_week(user_id, today - timedelta(days=90), today, db)
    top_day = max(dow, key=lambda x: x["amount"]) if dow else {"day": None, "amount": 0}
    quiet_day = min(dow, key=lambda x: x["amount"]) if dow else {"day": None, "amount": 0}

    budgets = get_budgets(user_id, today.month, today.year, db)
    at_risk = sum(1 for b in budgets if b["pace"]["status"] in ("at_risk", "will_exceed", "exceeded"))
    on_track = sum(1 for b in budgets if b["pace"]["status"] == "on_track")

    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    goal_avg = 0.0
    if goals:
        goal_avg = round(
            sum(min(100, float(g.current_amount) / float(g.target_amount) * 100) for g in goals if g.target_amount)
            / len(goals),
            1,
        )

    anomalies = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.user_id == user_id,
            Transaction.is_anomaly == True,
            extract("month", Transaction.date) == today.month,
            extract("year", Transaction.date) == today.year,
        )
        .scalar()
    ) or 0

    components, weights = [], []
    if income > 0:
        components.append(min(100, savings_rate * 2.5))
        weights.append(0.35)
    if budgets:
        components.append((on_track / len(budgets)) * 100)
        weights.append(0.3)
    if goals:
        components.append(goal_avg)
        weights.append(0.2)
    components.append(max(0, 100 - int(anomalies) * 15))
    weights.append(0.15)

    total_w = sum(weights) or 1
    health_score = round(sum(c * w for c, w in zip(components, weights)) / total_w)

    recurring = _detect_recurring(user_id, db)
    tips = []
    if top_day["amount"] > 0:
        day_label = DAY_NAMES.get(top_day["day"], top_day["day"])
        tips.append(f"You spend most on {day_label} — that's where small cuts have the biggest impact.")
    if at_risk:
        tips.append(f"{at_risk} budget{'s' if at_risk > 1 else ''} may exceed limit before month-end.")
    if runway_days > 0:
        tips.append(f"Your monthly surplus covers ~{runway_days} days at your current daily spend rate.")
    if savings_rate >= 20:
        tips.append(f"Saving {savings_rate}% of income this month — well above the 20% benchmark.")
    elif income > 0 and savings_rate < 10:
        tips.append(f"Only saving {savings_rate}% this month — aim for at least 10–20% of income.")
    if recurring:
        names = ", ".join(r["description"] for r in recurring[:2])
        tips.append(f"Recurring charges spotted: {names}. Cancel what you no longer use.")

    return {
        "health_score": health_score,
        "health_grade": _health_grade(health_score),
        "savings_rate": savings_rate,
        "runway_days": runway_days,
        "top_spending_day": top_day,
        "quietest_day": quiet_day,
        "budgets_at_risk": at_risk,
        "goal_progress_avg": goal_avg,
        "day_of_week": dow,
        "recurring_expenses": recurring,
        "tips": tips[:5],
    }
