import calendar
from datetime import date

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.transaction import Transaction
from app.services.budget_service import get_budgets
from app.services.notification_read_service import _get_dismissed_ids, filter_dismissed


def _anomaly_notifications(user_id, db: Session) -> list:
    rows = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.is_anomaly == True,
            Transaction.anomaly_reviewed == False,
        )
        .order_by(Transaction.date.desc())
        .limit(20)
        .all()
    )
    items = []
    for t in rows:
        z = abs(t.z_score or 0)
        items.append({
            "id": f"anomaly-{t.id}",
            "type": "anomaly",
            "severity": t.anomaly_severity or "low",
            "title": "Unusual expense detected",
            "message": f"{t.description} — NPR {float(t.amount):,.0f} ({z:.1f}σ above your {t.category} average)",
            "date": t.date.isoformat(),
            "read": False,
            "action_path": "/anomalies",
            "entity_id": str(t.id),
        })
    return items


def _budget_notifications(user_id, month: int, year: int, db: Session) -> list:
    today = date.today()
    days_in_month = calendar.monthrange(year, month)[1]
    current_day = today.day if today.month == month and today.year == year else days_in_month
    items = []

    for b in get_budgets(user_id, month, year, db):
        pct = b["utilization_pct"]
        cat = b["category"].replace("_", " ").title()
        pace = b["pace"]

        # Threshold alerts (50 / 75 / 90 %)
        if pct >= 90:
            items.append({
                "id": f"budget-thresh-90-{b['id']}",
                "type": "budget",
                "severity": "high",
                "title": "Budget almost exhausted",
                "message": f"{cat} at {pct}% — only NPR {b['remaining']:,.0f} left",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/budgets",
                "entity_id": b["id"],
            })
        elif pct >= 75:
            items.append({
                "id": f"budget-thresh-75-{b['id']}",
                "type": "budget",
                "severity": "medium",
                "title": "Budget 75% used",
                "message": f"{cat} at {pct}% — NPR {b['remaining']:,.0f} remaining this month",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/budgets",
                "entity_id": b["id"],
            })
        elif pct >= 50:
            items.append({
                "id": f"budget-thresh-50-{b['id']}",
                "type": "budget",
                "severity": "low",
                "title": "Budget halfway",
                "message": f"{cat} at {pct}% — NPR {b['remaining']:,.0f} remaining this month",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/budgets",
                "entity_id": b["id"],
            })

        # Existing pace alerts (exceeded / will_exceed)
        if pace["status"] in ("will_exceed", "exceeded"):
            if pace["status"] == "exceeded":
                msg = f"{cat} budget already exceeded (NPR {b['spent']:,.0f} of {b['monthly_limit']:,.0f})"
            else:
                days = pace.get("days_until_exceeded")
                msg = f"{cat} on track to exceed limit" + (f" in ~{int(days)} days" if days else "")
            items.append({
                "id": f"budget-{b['id']}",
                "type": "budget",
                "severity": "high" if pace["status"] == "exceeded" else "medium",
                "title": "Budget warning",
                "message": msg,
                "date": today.isoformat(),
                "read": False,
                "action_path": "/budgets",
                "entity_id": b["id"],
            })
    return items


def _goal_notifications(user_id, db: Session) -> list:
    today = date.today()
    items = []
    for g in db.query(Goal).filter(Goal.user_id == user_id).all():
        if not g.target_date or not g.target_amount:
            continue
        days_left = (g.target_date - today).days
        if days_left <= 0 or days_left > 120:
            continue
        remaining = float(g.target_amount) - float(g.current_amount)
        if remaining <= 0:
            continue
        monthly_needed = remaining / max(days_left / 30, 1)
        progress = float(g.current_amount) / float(g.target_amount) * 100
        if progress < 70 or days_left < 60:
            items.append({
                "id": f"goal-{g.id}",
                "type": "goal",
                "severity": "low" if days_left > 30 else "medium",
                "title": "Goal needs attention",
                "message": f"{g.name}: save ~NPR {monthly_needed:,.0f}/month to hit your target ({days_left} days left)",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/goals",
                "entity_id": str(g.id),
            })
    return items


def get_notifications(user_id, db: Session, include_dismissed: bool = False) -> dict:
    today = date.today()
    dismissed = _get_dismissed_ids(user_id, db)
    items = (
        _anomaly_notifications(user_id, db)
        + _budget_notifications(user_id, today.month, today.year, db)
        + _goal_notifications(user_id, db)
    )

    if not include_dismissed:
        items = filter_dismissed(items, dismissed)
    else:
        for n in items:
            if n["id"] in dismissed:
                n["read"] = True

    severity_order = {"high": 0, "medium": 1, "low": 2}
    items.sort(key=lambda n: (severity_order.get(n["severity"], 3), n["date"]), reverse=True)
    unread = sum(1 for n in items if not n["read"])
    return {"items": items, "unread_count": unread, "total": len(items)}
