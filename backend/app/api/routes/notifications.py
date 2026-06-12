from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.services import notification_service
from app.services.notification_read_service import mark_all_read, mark_read

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return notification_service.get_notifications(user.id, db)


@router.put("/read-all")
def mark_all_notifications_read(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mark_all_read(user.id, db)
    return {"ok": True}


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if notification_id.startswith("anomaly-"):
        tx_id = notification_id.replace("anomaly-", "")
        t = db.query(Transaction).filter(Transaction.id == UUID(tx_id), Transaction.user_id == user.id).first()
        if not t:
            raise HTTPException(status_code=404, detail="Not found")
    mark_read(user.id, notification_id, db)
    return {"ok": True}
