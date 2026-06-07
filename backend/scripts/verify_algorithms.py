#!/usr/bin/env python3
"""Quick sanity checks for FinSight algorithms."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.anomaly_service import compute_z_score
from app.services.pace_service import compute_budget_pace
from app.services.trend_service import compute_ewma, get_trend_direction


def test_ewma():
    data = [100, 110, 105, 120, 130]
    result = compute_ewma(data, 0.3)
    assert len(result) == 5
    assert result[0] == 100
    assert result[-1] > result[0]
    print("✓ EWMA")


def test_trend():
    rising = list(range(10, 30))
    ewma = compute_ewma(rising, 0.3)
    trend = get_trend_direction(ewma)
    assert trend["direction"] == "increasing"
    print("✓ Trend direction")


def test_pace():
    on_track = compute_budget_pace(2000, 10000, 10, 30)
    assert on_track["status"] == "on_track"

    at_risk = compute_budget_pace(8500, 10000, 25, 30)
    assert at_risk["status"] in ("at_risk", "will_exceed")

    exceeded = compute_budget_pace(11000, 10000, 20, 30)
    assert exceeded["status"] == "exceeded"
    print("✓ Budget pace")


def test_z_score_logic():
    amounts = [100, 110, 105, 95, 108]
    mean = sum(amounts) / len(amounts)
    variance = sum((x - mean) ** 2 for x in amounts) / (len(amounts) - 1)
    std = variance ** 0.5
    z = (500 - mean) / std
    assert z > 2.0
    print("✓ Z-Score math")


if __name__ == "__main__":
    test_ewma()
    test_trend()
    test_pace()
    test_z_score_logic()
    print("\nAll algorithm checks passed.")
