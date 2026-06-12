from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.services import analytics_service
from app.services.anomaly_service import compute_z_score, get_category_stats

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analytics_service.get_dashboard(user.id, db)


@router.get("/cashflow")
def cashflow(
    months: int = Query(6),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_cashflow(user.id, months, db)


@router.get("/categories")
def categories(
    date_from: date = Query(...),
    date_to: date = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_categories(user.id, date_from, date_to, db)


@router.get("/monthly")
def monthly(
    year: int = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_monthly_comparison(user.id, year, db)


@router.get("/trend")
def trend(
    date_from: date = Query(...),
    date_to: date = Query(...),
    alpha: float = Query(0.3),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_spending_trend(user.id, date_from, date_to, alpha, db)


@router.get("/day-of-week")
def day_of_week(
    date_from: date = Query(...),
    date_to: date = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.get_day_of_week(user.id, date_from, date_to, db)


@router.get("/insights")
def insights(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analytics_service.get_insights(user.id, db)


@router.get("/digest")
def digest(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Daily/weekly spending digest."""
    today = date.today()
    # week: Monday to today
    week_start = today - __import__('datetime').timedelta(days=today.weekday())
    last_week_start = week_start - __import__('datetime').timedelta(days=7)
    last_week_end = week_start - __import__('datetime').timedelta(days=1)

    def sum_expenses(d_from, d_to):
        result = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "expense",
                Transaction.date >= d_from,
                Transaction.date <= d_to,
            )
            .scalar()
        )
        return float(result or 0)

    def count_expenses(d_from, d_to):
        return (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "expense",
                Transaction.date >= d_from,
                Transaction.date <= d_to,
            )
            .count()
        )

    today_total = sum_expenses(today, today)
    today_count = count_expenses(today, today)
    week_total = sum_expenses(week_start, today)
    week_count = count_expenses(week_start, today)
    last_week_total = sum_expenses(last_week_start, last_week_end)

    # Top category this week
    top_cat_row = (
        db.query(Transaction.category, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user.id,
            Transaction.type == "expense",
            Transaction.date >= week_start,
            Transaction.date <= today,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .first()
    )
    top_category = top_cat_row[0] if top_cat_row else None
    top_category_amount = float(top_cat_row[1]) if top_cat_row else 0

    week_change_pct = None
    if last_week_total > 0:
        week_change_pct = round((week_total - last_week_total) / last_week_total * 100, 1)

    return {
        "today_total": today_total,
        "today_count": today_count,
        "week_total": week_total,
        "week_count": week_count,
        "last_week_total": last_week_total,
        "week_change_pct": week_change_pct,
        "top_category": top_category,
        "top_category_amount": top_category_amount,
        "week_start": week_start.isoformat(),
    }
