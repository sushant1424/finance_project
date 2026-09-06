"""Detect recurring bills from transaction history."""

from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def _detect_frequency(months_seen: int, count: int) -> str:
    if months_seen == 0:
        return "unknown"
    avg = count / months_seen
    if avg >= 3.5:
        return "weekly"
    if avg >= 1.8:
        return "bi-weekly"
    if avg >= 0.8:
        return "monthly"
    if avg >= 0.4:
        return "quarterly"
    return "occasional"


def get_recurring_transactions(user_id, db: Session) -> list:
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.type == "expense")
        .order_by(Transaction.date.desc())
        .all()
    )

    manual = {}
    for t in txs:
        if t.is_recurring:
            key = t.description.lower().strip()
            manual.setdefault(key, []).append(t)

    groups = defaultdict(list)
    for t in txs:
        groups[t.description.lower().strip()].append(t)

    result = []
    seen = set()

    def _append(desc_key: str, items: list, source: str) -> None:
        if desc_key in seen:
            return
        seen.add(desc_key)
        amounts = [float(t.amount) for t in items]
        latest = max(items, key=lambda t: t.date)
        months = {(t.date.year, t.date.month) for t in items}
        months_count = max(len(months), 1)
        avg = round(sum(amounts) / len(amounts), 2)
        result.append({
            "description": latest.description,
            "category": latest.category,
            "avg_amount": avg,
            "count": len(items),
            "months_seen": months_count,
            "last_date": latest.date.isoformat(),
            "frequency": _detect_frequency(months_count, len(items)),
            "annual_cost": round(avg * 12, 2) if source == "manual" else round(avg / months_count * 12, 2),
            "source": source,
        })

    for desc_key, items in manual.items():
        _append(desc_key, items, "manual")

    for desc_key, items in groups.items():
        months = {(t.date.year, t.date.month) for t in items}
        if len(months) >= 2:
            _append(desc_key, items, "detected")

    result.sort(key=lambda x: x["avg_amount"], reverse=True)
    return result
