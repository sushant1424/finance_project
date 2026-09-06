from datetime import date

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services import analytics_service
from app.services.clustering_service import get_spending_clusters
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

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


@router.get("/savings-rate")
def savings_rate(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analytics_service.get_savings_rate(user.id, db)


@router.get("/spending-clusters")
def spending_clusters(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_spending_clusters(user.id, db)
