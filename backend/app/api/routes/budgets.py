from datetime import date
from dateutil.relativedelta import relativedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.budget import Budget
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services import budget_service

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("")
def list_budgets(
    month: int = Query(...),
    year: int = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return budget_service.get_budgets(user.id, month, year, db)


@router.get("/summary")
def budget_summary(
    month: int = Query(...),
    year: int = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return budget_service.get_budget_summary(user.id, month, year, db)


@router.get("/suggestions")
def budget_suggestions(
    month: int = Query(...),
    year: int = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Suggest budget limits based on avg spending over the 3 months prior to month/year."""
    from app.models.transaction import Transaction
    from sqlalchemy import func

    # Build the 3 prior month ranges
    ref = date(year, month, 1)
    months = [(ref - relativedelta(months=i)) for i in range(1, 4)]

    rows = (
        db.query(Transaction.category, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user.id,
            Transaction.type == "expense",
            func.extract("year", Transaction.date).in_([m.year for m in months]),
            func.extract("month", Transaction.date).in_([m.month for m in months]),
        )
        .group_by(Transaction.category)
        .all()
    )

    suggestions = []
    for cat, total in rows:
        avg = float(total) / 3
        suggestions.append({
            "category": cat,
            "avg_3m": round(avg, 2),
            "suggested_limit": round(avg * 1.1, 2),
        })
    suggestions.sort(key=lambda x: x["avg_3m"], reverse=True)
    return suggestions


@router.post("")
def create_budget(
    data: BudgetCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return budget_service.create_budget(user.id, data, db)


@router.put("/{budget_id}")
def update_budget(
    budget_id: UUID,
    data: BudgetUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget_service.update_budget(b, data, user.id, db)


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget_service.delete_budget(b, db)
    return {"message": "Deleted"}
