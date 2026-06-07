from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.services.anomaly_service import compute_z_score, get_category_stats

router = APIRouter(prefix="/anomalies", tags=["anomalies"])


def _serialize_anomaly(t: Transaction, db: Session) -> dict:
    stats = get_category_stats(t.category, t.user_id, db)
    mean, std = stats["mean"], stats["std_dev"]
    return {
        "id": str(t.id),
        "date": t.date.isoformat(),
        "description": t.description,
        "category": t.category,
        "amount": float(t.amount),
        "z_score": t.z_score,
        "anomaly_severity": t.anomaly_severity,
        "anomaly_reviewed": t.anomaly_reviewed or False,
        "expected_range": {"mean": mean, "low": round(mean - 2 * std, 2), "high": round(mean + 2 * std, 2)},
    }


@router.get("")
def list_anomalies(
    page: int = Query(1, ge=1),
    limit: int = Query(20),
    severity: str | None = None,
    category: str | None = None,
    reviewed: bool | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Transaction).filter(Transaction.user_id == user.id, Transaction.is_anomaly == True)
    if severity:
        q = q.filter(Transaction.anomaly_severity == severity)
    if category:
        q = q.filter(Transaction.category == category)
    if reviewed is not None:
        q = q.filter(Transaction.anomaly_reviewed == reviewed)
    total = q.count()
    items = q.order_by(Transaction.date.desc()).offset((page - 1) * limit).limit(limit).all()
    return {"items": [_serialize_anomaly(t, db) for t in items], "total": total}


@router.put("/{transaction_id}/review")
def review_anomaly(
    transaction_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == user.id
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    t.anomaly_reviewed = True
    db.commit()
    return _serialize_anomaly(t, db)


@router.post("/recalculate")
def recalculate(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter(
        Transaction.user_id == user.id, Transaction.type == "expense"
    ).all()
    count = 0
    for t in txs:
        z, severity, is_anomaly = compute_z_score(float(t.amount), t.category, user.id, db, exclude_id=t.id)
        t.z_score = z
        t.anomaly_severity = severity
        t.is_anomaly = is_anomaly
        if is_anomaly:
            count += 1
    db.commit()
    return {"anomalies_found": count}
