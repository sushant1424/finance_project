from collections import defaultdict
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import BulkDeleteRequest, TransactionCreate, TransactionUpdate
from app.services import transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])


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
    sort_by: str = "date",
    sort_order: str = "desc",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    params = {
        "page": page, "limit": limit, "type": type, "category": category,
        "date_from": date_from, "date_to": date_to, "amount_min": amount_min,
        "amount_max": amount_max, "search": search, "sort_by": sort_by, "sort_order": sort_order,
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
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    params = {"type": type, "category": category, "date_from": date_from, "date_to": date_to, "search": search}
    csv = transaction_service.export_csv(user.id, db, params)
    return PlainTextResponse(csv, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=transactions.csv"})


@router.get("/recurring")
def recurring_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Detect recurring transactions by grouping expenses with the same description across 2+ months."""
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id, Transaction.type == "expense")
        .order_by(Transaction.date.desc())
        .all()
    )
    groups = defaultdict(list)
    for t in txs:
        groups[t.description.lower().strip()].append(t)

    result = []
    for desc, items in groups.items():
        months = {(t.date.year, t.date.month) for t in items}
        if len(months) < 2:
            continue
        amounts = [float(t.amount) for t in items]
        latest = max(items, key=lambda t: t.date)
        result.append({
            "description": latest.description,
            "category": latest.category,
            "avg_amount": round(sum(amounts) / len(amounts), 2),
            "count": len(items),
            "months_seen": len(months),
            "last_date": latest.date.isoformat(),
        })

    result.sort(key=lambda x: x["avg_amount"], reverse=True)
    return result


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
    t = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user.id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction_service.update_transaction(t, data, db)


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user.id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    transaction_service.delete_transaction(t, db)
    return {"message": "Deleted"}
