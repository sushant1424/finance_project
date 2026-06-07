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
