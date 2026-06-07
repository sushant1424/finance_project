import statistics
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def compute_z_score(new_amount: float, category: str, user_id, db: Session, exclude_id=None):
    q = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.category == category,
        Transaction.type == "expense",
    )
    if exclude_id is not None:
        q = q.filter(Transaction.id != exclude_id)
    history = q.all()

    if len(history) < 5:
        return None, None, False

    amounts = [float(t.amount) for t in history]
    mean = statistics.mean(amounts)
    std_dev = statistics.stdev(amounts)

    if std_dev == 0:
        return 0.0, None, False

    z_score = (new_amount - mean) / std_dev
    abs_z = abs(z_score)

    if abs_z > 3.0:
        severity = "high"
    elif abs_z > 2.5:
        severity = "medium"
    elif abs_z > 2.0:
        severity = "low"
    else:
        severity = None

    is_anomaly = abs_z > 2.0
    return round(z_score, 4), severity, is_anomaly


def get_category_stats(category: str, user_id, db: Session) -> dict:
    history = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.category == category,
            Transaction.type == "expense",
        )
        .all()
    )
    if not history:
        return {"mean": 0, "std_dev": 0}
    amounts = [float(t.amount) for t in history]
    mean = statistics.mean(amounts)
    std_dev = statistics.stdev(amounts) if len(amounts) > 1 else 0
    return {"mean": round(mean, 2), "std_dev": round(std_dev, 2)}
