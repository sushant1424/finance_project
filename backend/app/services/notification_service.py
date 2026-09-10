import calendar
from datetime import date

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.services.account_service import list_accounts
from app.services.budget_service import get_budgets
from app.services.due_reminder_service import get_upcoming_due
from app.services.notification_read_service import _get_dismissed_ids, filter_dismissed

# Soft floor for cash/bank accounts — below this (or negative) triggers a warning.
LOW_BALANCE_THRESHOLD = 1000


def _budget_notifications(user_id, month: int, year: int, db: Session) -> list:
    today = date.today()
    days_in_month = calendar.monthrange(year, month)[1]
    items = []

    for b in get_budgets(user_id, month, year, db):
        pct = b["utilization_pct"]
        cat = b["category"].replace("_", " ").title()
        pace = b["pace"]

        if pct >= 90:
            items.append({
                "id": f"budget-thresh-90-{b['id']}",
                "type": "budget",
                "severity": "medium",
                "title": f"You're close to your {cat} limit",
                "message": f"{cat} is at {pct}%. Rs. {max(b['remaining'], 0):,.0f} left this month. You can still log spending.",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/budgets",
                "entity_id": b["id"],
            })
        elif pct >= 75:
            items.append({
                "id": f"budget-thresh-75-{b['id']}",
                "type": "budget",
                "severity": "low",
                "title": f"Approaching {cat} budget",
                "message": f"{cat} at {pct}%. Rs. {b['remaining']:,.0f} remaining this month",
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
                "title": f"{cat} budget halfway",
                "message": f"{cat} at {pct}%. Rs. {b['remaining']:,.0f} remaining this month",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/budgets",
                "entity_id": b["id"],
            })

        if pace["status"] in ("will_exceed", "exceeded"):
            if pace["status"] == "exceeded":
                msg = f"{cat} budget already exceeded (Rs. {b['spent']:,.0f} of {b['monthly_limit']:,.0f})"
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
        goal_status = getattr(g, "status", None) or "active"
        if goal_status in ("completed", "withdrawn"):
            continue
        if not g.target_date or not g.target_amount:
            continue
        current = float(g.current_amount or 0)
        target = float(g.target_amount)
        if current >= target:
            items.append({
                "id": f"goal-done-{g.id}",
                "type": "goal",
                "severity": "low",
                "title": "Goal reached!",
                "message": f"{g.name} is fully funded. Withdraw it or convert it into a new goal.",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/goals",
                "entity_id": str(g.id),
            })
            continue
        days_left = (g.target_date - today).days
        if days_left <= 0 or days_left > 120:
            continue
        remaining = target - current
        monthly_needed = remaining / max(days_left / 30, 1)
        progress = current / target * 100
        if progress < 70 or days_left < 60:
            items.append({
                "id": f"goal-{g.id}",
                "type": "goal",
                "severity": "low" if days_left > 30 else "medium",
                "title": "Goal needs attention",
                "message": f"{g.name}: save ~Rs. {monthly_needed:,.0f}/month to hit your target ({days_left} days left)",
                "date": today.isoformat(),
                "read": False,
                "action_path": "/goals",
                "entity_id": str(g.id),
            })
    return items


def _bill_notifications(user_id, db: Session) -> list:
    today = date.today()
    items = []
    for b in get_upcoming_due(user_id, db, days=10):
        days = b.get("days_until", 0)
        overdue = days <= 0
        items.append({
            "id": f"bill-{b['id']}",
            "type": "bill",
            "severity": "high" if overdue else ("medium" if days <= 2 else "low"),
            "title": "Bill overdue" if overdue else "Bill due soon",
            "message": (
                f"{b['description']} is overdue"
                if overdue
                else f"{b['description']} due in {days} day{'s' if days != 1 else ''}"
            ),
            "date": today.isoformat(),
            "read": False,
            "action_path": "/bills",
            "entity_id": str(b["id"]),
            "amount": float(b.get("amount") or 0),
        })
    return items


def _balance_notifications(user_id, db: Session) -> list:
    """Warn when a non-credit account is negative or below a soft threshold."""
    today = date.today()
    items = []
    for a in list_accounts(user_id, db):
        if a.get("type") == "credit_card":
            continue
        if a.get("name") == "Goal savings":
            continue
        balance = float(a.get("balance") or 0)
        name = a["name"]
        if balance < 0:
            items.append({
                "id": f"balance-neg-{a['id']}",
                "type": "balance",
                "severity": "high",
                "title": f"{name} is overdrawn",
                "message": f"Balance is Rs. {balance:,.0f}. Review recent spending or transfer funds in.",
                "date": today.isoformat(),
                "read": False,
                "action_path": f"/accounts/{a['id']}",
                "entity_id": a["id"],
            })
        elif balance < LOW_BALANCE_THRESHOLD:
            items.append({
                "id": f"balance-low-{a['id']}",
                "type": "balance",
                "severity": "medium",
                "title": f"{name} balance is low",
                "message": f"Only Rs. {balance:,.0f} left — below the Rs. {LOW_BALANCE_THRESHOLD:,.0f} comfort threshold.",
                "date": today.isoformat(),
                "read": False,
                "action_path": f"/accounts/{a['id']}",
                "entity_id": a["id"],
            })
    return items


def _anomaly_notifications(user_id, db: Session) -> list:
    from app.services.anomaly_service import get_anomalies

    today = date.today()
    data = get_anomalies(user_id, db, period="this_month")
    items = []
    for a in data["items"][:8]:
        cat = a["category"].replace("_", " ").title()
        sev = "high" if a.get("severity") == "high" else "medium"
        items.append({
            "id": f"anomaly-{a['id']}",
            "type": "anomaly",
            "severity": sev,
            "title": "Unusual expense spotted",
            "message": a.get("reason") or (
                f"{a['description']}: Rs. {a['amount']:,.0f} looks unusual for {cat}"
            ),
            "date": a.get("date") or today.isoformat(),
            "read": False,
            "action_path": "/transactions",
            "entity_id": a["id"],
            "amount": float(a["amount"]),
        })
    return items


def get_notifications(user_id, db: Session, include_dismissed: bool = False) -> dict:
    today = date.today()
    dismissed = _get_dismissed_ids(user_id, db)
    items = (
        _budget_notifications(user_id, today.month, today.year, db)
        + _goal_notifications(user_id, db)
        + _bill_notifications(user_id, db)
        + _balance_notifications(user_id, db)
        + _anomaly_notifications(user_id, db)
    )

    if not include_dismissed:
        items = filter_dismissed(items, dismissed)
    else:
        for n in items:
            if n["id"] in dismissed:
                n["read"] = True

    severity_order = {"high": 0, "medium": 1, "low": 2}
    items.sort(key=lambda n: (severity_order.get(n["severity"], 3), n["date"]))
    unread = sum(1 for n in items if not n["read"])
    return {"items": items, "unread_count": unread, "total": len(items)}
