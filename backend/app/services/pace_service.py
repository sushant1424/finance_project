import math


def compute_budget_pace(
    spent: float, budget_limit: float, current_day: int, days_in_month: int
) -> dict:
    if current_day <= 0 or days_in_month <= 0 or budget_limit <= 0:
        return {
            "status": "on_track",
            "projected_spend": 0,
            "pace_pct": 0,
            "days_until_exceeded": None,
        }

    daily_rate = spent / current_day
    projected_spend = daily_rate * days_in_month
    pace_pct = (projected_spend / budget_limit) * 100

    if spent >= budget_limit:
        status = "exceeded"
        days_until = None
    elif projected_spend > budget_limit:
        status = "will_exceed"
        days_until = math.ceil((budget_limit - spent) / daily_rate) if daily_rate > 0 else None
    elif pace_pct > 80:
        status = "at_risk"
        days_until = None
    else:
        status = "on_track"
        days_until = None

    return {
        "status": status,
        "projected_spend": round(projected_spend, 2),
        "pace_pct": round(pace_pct, 1),
        "days_until_exceeded": days_until,
    }
