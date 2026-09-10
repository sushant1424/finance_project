from datetime import date
from uuid import UUID

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.recurring_bill import RecurringBill
from app.models.user import User
from app.schemas.recurring_bill import RecurringBillCreate, RecurringBillUpdate
from app.services import recurring_bill_service
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/recurring-bills", tags=["recurring-bills"])


def _get_owned(db: Session, bill_id: UUID, user_id) -> RecurringBill:
    bill = (
        db.query(RecurringBill)
        .filter(RecurringBill.id == bill_id, RecurringBill.user_id == user_id)
        .first()
    )
    if not bill:
        raise HTTPException(status_code=404, detail="Recurring bill not found")
    return bill


@router.get("")
def list_recurring_bills(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    type: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recurring_bill_service.list_bills(user.id, db, page, limit, type)


@router.post("")
def create_recurring_bill(
    data: RecurringBillCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recurring_bill_service.create_bill(user.id, data, db)


@router.put("/{bill_id}")
def update_recurring_bill(
    bill_id: UUID,
    data: RecurringBillUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bill = _get_owned(db, bill_id, user.id)
    return recurring_bill_service.update_bill(bill, data, db)


@router.delete("/{bill_id}")
def delete_recurring_bill(
    bill_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bill = _get_owned(db, bill_id, user.id)
    recurring_bill_service.delete_bill(bill, db)
    return {"message": "Deleted"}


@router.post("/{bill_id}/pay")
def record_payment(
    bill_id: UUID,
    pay_date: date | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bill = _get_owned(db, bill_id, user.id)
    return recurring_bill_service.record_payment(bill, db, pay_date)
