from datetime import date
from uuid import UUID

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import (
    AnomalyCheckRequest,
    BulkDeleteRequest,
    CategorySuggestRequest,
    TransactionCreate,
    TransactionUpdate,
)
from app.services import transaction_service
from app.services.anomaly_service import acknowledge_anomaly, detect_anomaly
from app.services.categorizer_service import suggest_category_nb
from app.services.import_service import import_transactions_csv
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/transactions", tags=["transactions"])

# Thin route layer — business logic lives in services/

@router.get("")
def list_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    amount_min: float | None = None,
    amount_max: float | None = None,
    search: str | None = None,
    trash: bool = False,
    account_id: str | None = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    params = {
        "page": page,
        "limit": limit,
        "type": type,
        "category": category,
        "date_from": date_from,
        "date_to": date_to,
        "amount_min": amount_min,
        "amount_max": amount_max,
        "search": search,
        "trash": trash,
        "account_id": account_id,
        "sort_by": sort_by,
        "sort_order": sort_order,
    }
    return transaction_service.get_transactions(user.id, db, params)


@router.post("")
def create_transaction(
    data: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return transaction_service.create_transaction(user.id, data, db)


@router.get("/export")
def export_transactions(
    type: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    search: str | None = None,
    account_id: str | None = None,
    amount_min: float | None = None,
    amount_max: float | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    params = {
        "type": type,
        "category": category,
        "date_from": date_from,
        "date_to": date_to,
        "search": search,
        "account_id": account_id,
        "amount_min": amount_min,
        "amount_max": amount_max,
    }
    csv_data = transaction_service.export_csv(user.id, db, params)
    return PlainTextResponse(
        csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


@router.post("/import")
async def import_csv(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    return import_transactions_csv(user.id, content, db)


@router.get("/recurring")
def recurring_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Legacy endpoint — returns saved recurring bills."""
    from app.services import recurring_bill_service
    return recurring_bill_service.list_bills(user.id, db, page=1, limit=100)["items"]


@router.delete("/bulk")
def bulk_delete(
    data: BulkDeleteRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = transaction_service.bulk_delete(user.id, data.ids, db)
    return {"deleted": count}


@router.put("/{transaction_id}")
def update_transaction(
    transaction_id: UUID,
    data: TransactionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == user.id)
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction_service.update_transaction(t, data, db)


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == user.id, Transaction.deleted_at.is_(None))
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    transaction_service.delete_transaction(t, db)
    return {"message": "Deleted", "id": str(t.id)}


@router.post("/{transaction_id}/restore")
def restore_transaction(
    transaction_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == user.id, Transaction.deleted_at.isnot(None))
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found in trash")
    return transaction_service.restore_transaction(t, db)


@router.post("/suggest-category")
def suggest_category(
    data: CategorySuggestRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = suggest_category_nb(user.id, data.description, db, tx_type=data.type)
    if not result:
        return {"category": None, "confidence": 0, "is_starter": True}
    return result


@router.post("/check-anomaly")
def check_anomaly(
    data: AnomalyCheckRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return detect_anomaly(
        user.id,
        data.category,
        data.amount,
        db,
        tx_type=data.type,
    )


@router.post("/{transaction_id}/acknowledge-anomaly")
def acknowledge_transaction_anomaly(
    transaction_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == user.id,
            Transaction.deleted_at.is_(None),
        )
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return acknowledge_anomaly(t, db)
