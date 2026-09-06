from sqlalchemy.orm import Session

from app.models.transaction import Transaction

# Tier labels only — centroids are learned from real transaction data
TIER_META = [
    {"key": "micro", "label": "Small buys", "desc": "Snacks, coffee, small rides"},
    {"key": "regular", "label": "Regular spending", "desc": "Groceries, bills, daily needs"},
    {"key": "major", "label": "Big expenses", "desc": "Rent, tuition, large purchases"},
]


def _assign_to_centroids(amounts: list[float], centroids: list[float]) -> list[int]:
    assignments = []
    for amt in amounts:
        distances = [abs(amt - c) for c in centroids]
        assignments.append(distances.index(min(distances)))
    return assignments


def _build_cluster_results(txs, amounts, assignments, centroids, total_spent: float) -> list[dict]:
    cluster_indices = sorted(range(3), key=lambda k: centroids[k])
    results = []

    for rank, orig_idx in enumerate(cluster_indices):
        assigned_txs = [txs[i] for i in range(len(txs)) if assignments[i] == orig_idx]
        cluster_sum = sum(float(t.amount) for t in assigned_txs)
        pct = round((cluster_sum / total_spent) * 100, 1) if total_spent > 0 else 0

        results.append({
            "key": TIER_META[rank]["key"],
            "label": TIER_META[rank]["label"],
            "description": TIER_META[rank]["desc"],
            "centroid": round(centroids[orig_idx], 2),
            "count": len(assigned_txs),
            "total_amount": round(cluster_sum, 2),
            "percentage": pct,
            "sample_items": [
                {
                    "description": t.description,
                    "amount": float(t.amount),
                    "category": t.category,
                    "date": t.date.isoformat(),
                }
                for t in sorted(assigned_txs, key=lambda x: x.amount, reverse=True)[:3]
            ],
        })

    return results


def get_spending_clusters(user_id, db: Session) -> dict:
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.type == "expense")
        .all()
    )

    if not txs:
        return {
            "insufficient_data": True,
            "clusters": [],
            "total_spent": 0,
            "k_value": 3,
            "iterations": 0,
        }

    amounts = [float(t.amount) for t in txs]
    total_spent = sum(amounts)

    if len(txs) < 3:
        sorted_amounts = sorted(amounts)
        centroids = [sorted_amounts[0], sorted_amounts[-1], (sorted_amounts[0] + sorted_amounts[-1]) / 2]
        assignments = _assign_to_centroids(amounts, centroids)
        iterations = 0
    else:
        sorted_amounts = sorted(amounts)
        n = len(sorted_amounts)
        centroids = [sorted_amounts[0], sorted_amounts[n // 2], sorted_amounts[-1]]
        if centroids[0] == centroids[1]:
            centroids[1] += 1.0
        if centroids[1] == centroids[2]:
            centroids[2] += 1.0

        assignments = [0] * len(txs)
        iterations = 0
        max_iterations = 100

        for it in range(max_iterations):
            iterations += 1
            new_assignments = _assign_to_centroids(amounts, centroids)
            if new_assignments == assignments and it > 0:
                break
            assignments = new_assignments

            new_centroids = []
            for k in range(3):
                pts = [amounts[i] for i in range(len(amounts)) if assignments[i] == k]
                new_centroids.append(sum(pts) / len(pts) if pts else centroids[k])
            centroids = new_centroids

    return {
        "insufficient_data": len(txs) < 3,
        "clusters": _build_cluster_results(txs, amounts, assignments, centroids, total_spent),
        "total_spent": round(total_spent, 2),
        "k_value": 3,
        "iterations": iterations,
    }
