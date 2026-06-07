def compute_ewma(daily_amounts: list[float], alpha: float = 0.3) -> list[float]:
    if not daily_amounts:
        return []

    ewma = [daily_amounts[0]]
    for i in range(1, len(daily_amounts)):
        ewma_val = alpha * daily_amounts[i] + (1 - alpha) * ewma[i - 1]
        ewma.append(round(ewma_val, 2))
    return ewma


def get_trend_direction(ewma_values: list[float]) -> dict:
    if len(ewma_values) < 14:
        return {"direction": "insufficient_data", "change_pct": 0}

    recent_avg = sum(ewma_values[-7:]) / 7
    previous_avg = sum(ewma_values[-14:-7]) / 7

    if previous_avg == 0:
        return {"direction": "stable", "change_pct": 0}

    change_pct = ((recent_avg - previous_avg) / previous_avg) * 100

    if change_pct > 10:
        direction = "increasing"
    elif change_pct < -10:
        direction = "decreasing"
    else:
        direction = "stable"

    return {"direction": direction, "change_pct": round(change_pct, 1)}
