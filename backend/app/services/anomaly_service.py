"""Z-score anomaly detection for expense amounts, per category.

Deliberate design choices:
- Skip categories with fewer than 5 past expenses. With so little history a
  z-score is statistically meaningless and will falsely flag normal variation.
- Floor sigma at max(sigma, mean * 0.05) so near-identical past amounts do not
  produce unstable extreme z-scores on tiny deviations.
- Income and transfers are never flagged; anomalies matter most for expenses.
"""

from calendar import monthrange
from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.transaction import Transaction

MIN_SAMPLES = 5
EPSILON_FRAC = 0.05


def _category_label(category: str) -> str:
    return (category or "other").replace("_", " ").title()


def _format_rs(amount: float) -> str:
    return f"Rs. {amount:,.0f}"


def _get_category_amounts(
    user_id,
    category: str,
    db: Session,
    exclude_id: UUID | None = None,
) -> list[float]:
    q = (
        db.query(Transaction.amount)
        .filter(
            Transaction.user_id == user_id,
            Transaction.category == category,
            Transaction.type == "expense",
            Transaction.deleted_at.is_(None),
        )
    )
    if exclude_id is not None:
        q = q.filter(Transaction.id != exclude_id)
    return [float(row[0]) for row in q.all()]


def _mean_std(history: list[float]) -> tuple[float, float]:
    mean = sum(history) / len(history)
    variance = sum((x - mean) ** 2 for x in history) / len(history)
    std_dev = variance ** 0.5
    # Epsilon floor: avoid division by ~0 when amounts are nearly identical
    floor = abs(mean) * EPSILON_FRAC
    std_dev = max(std_dev, floor if floor > 0 else 1.0)
    return mean, std_dev


def _severity(z: float) -> str | None:
    az = abs(z)
    if az >= 3:
        return "high"
    if az >= 2:
        return "moderate"
    return None


def _reason(category: str, amount: float, mean: float, multiplier: float | None) -> str:
    label = _category_label(category)
    avg = _format_rs(mean)
    this = _format_rs(amount)
    if mean > 0 and amount > mean and multiplier is not None:
        return (
            f"This looks unusually high for {label} "
            f"(avg {avg}, this is {this} - {multiplier}x higher). Is that right?"
        )
    if mean > 0 and amount < mean:
        return (
            f"This looks unusually low for {label} "
            f"(avg {avg}, this is {this}). Is that right?"
        )
    return f"This looks unusual for {label} (avg {avg}, this is {this}). Is that right?"


def detect_anomaly(
    user_id,
    category: str,
    amount: float,
    db: Session,
    tx_type: str = "expense",
    exclude_id: UUID | None = None,
) -> dict:
    """Score a single amount against the user's history in that category."""
    if tx_type in ("income", "transfer"):
        return {"status": "skipped"}

    history = _get_category_amounts(user_id, category, db, exclude_id=exclude_id)
    if len(history) < MIN_SAMPLES:
        return {"status": "not_enough_data"}

    mean, std_dev = _mean_std(history)
    z = (float(amount) - mean) / std_dev
    severity = _severity(z)

    if severity is None:
        return {"status": "normal", "z_score": round(z, 2)}

    multiplier = round(float(amount) / mean, 1) if mean > 0 else None
    return {
        "status": "anomaly",
        "severity": severity,
        "z_score": round(z, 2),
        "category_avg": round(mean, 2),
        "multiplier": multiplier,
        "reason": _reason(category, float(amount), mean, multiplier),
    }


def _period_bounds(period: str, today: date | None = None) -> tuple[date, date]:
    today = today or date.today()
    if period == "last_month":
        if today.month == 1:
            start = date(today.year - 1, 12, 1)
        else:
            start = date(today.year, today.month - 1, 1)
        end = date(start.year, start.month, monthrange(start.year, start.month)[1])
        return start, end
    if period == "last_3_months":
        month = today.month - 2
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        return date(year, month, 1), today
    # this_month (default)
    return date(today.year, today.month, 1), today


def _load_expense_rows(user_id, db: Session) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.deleted_at.is_(None),
        )
        .all()
    )


def _score_amount_against_peers(
    amount: float,
    peer_amounts: list[float],
    category: str,
) -> dict | None:
    """Leave-one-out style score given peer amounts (already excluding current)."""
    if len(peer_amounts) < MIN_SAMPLES:
        return None
    mean, std_dev = _mean_std(peer_amounts)
    z = (amount - mean) / std_dev
    severity = _severity(z)
    if severity is None:
        return None
    multiplier = round(amount / mean, 1) if mean > 0 else None
    return {
        "status": "anomaly",
        "severity": severity,
        "z_score": round(z, 2),
        "category_avg": round(mean, 2),
        "multiplier": multiplier,
        "reason": _reason(category, amount, mean, multiplier),
    }


def annotate_expense(
    tx: Transaction,
    amounts_by_category: dict[str, list[tuple]],
) -> dict | None:
    """Return anomaly dict for a transaction, or None if normal / not enough data.

    amounts_by_category maps category -> list of (id, amount) for all expenses.
    Acknowledged flags are still scored (caller decides whether to surface them).
    """
    if tx.type != "expense":
        return None
    peers = [
        amt
        for tid, amt in amounts_by_category.get(tx.category, [])
        if tid != tx.id
    ]
    return _score_amount_against_peers(float(tx.amount), peers, tx.category)


def build_category_amount_index(user_id, db: Session) -> dict[str, list[tuple]]:
    index: dict[str, list[tuple]] = {}
    for t in _load_expense_rows(user_id, db):
        index.setdefault(t.category, []).append((t.id, float(t.amount)))
    return index


def get_anomalies(
    user_id,
    db: Session,
    period: str = "this_month",
    include_acknowledged: bool = False,
) -> dict:
    """Scan expenses in a period and return flagged anomalies."""
    start, end = _period_bounds(period)
    index = build_category_amount_index(user_id, db)

    period_txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.deleted_at.is_(None),
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .order_by(Transaction.date.desc())
        .all()
    )

    items = []
    for t in period_txs:
        if getattr(t, "anomaly_acknowledged", False) and not include_acknowledged:
            continue
        result = annotate_expense(t, index)
        if not result:
            continue
        items.append({
            "id": str(t.id),
            "description": t.description,
            "category": t.category,
            "amount": float(t.amount),
            "date": t.date.isoformat(),
            "acknowledged": bool(getattr(t, "anomaly_acknowledged", False)),
            **result,
        })

    items.sort(key=lambda x: abs(x.get("z_score") or 0), reverse=True)
    return {
        "period": period,
        "date_from": start.isoformat(),
        "date_to": end.isoformat(),
        "count": len(items),
        "items": items,
    }


def acknowledge_anomaly(tx: Transaction, db: Session) -> dict:
    tx.anomaly_acknowledged = True
    db.commit()
    db.refresh(tx)
    try:
        from app.services.notification_read_service import mark_read
        mark_read(tx.user_id, f"anomaly-{tx.id}", db)
    except Exception:
        pass
    return {"id": str(tx.id), "anomaly_acknowledged": True}


def anomaly_payload_for_tx(
    tx: Transaction,
    amounts_by_category: dict[str, list[tuple]],
) -> dict | None:
    """Surfaceable anomaly for lists/UI (hides acknowledged)."""
    if getattr(tx, "anomaly_acknowledged", False):
        return None
    return annotate_expense(tx, amounts_by_category)
