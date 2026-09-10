#!/usr/bin/env python3
"""Quick sanity checks for FinSight algorithms."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.anomaly_service import MIN_SAMPLES, detect_anomaly, _mean_std, _severity
from app.services.categorizer_service import _phrase_hits, _tokenize, _fuzzy_seed_hits, SEED_WORDS
from app.services.clustering_service import _assign_to_centroids
from app.services.pace_service import compute_budget_pace


class _FakeQuery:
    def __init__(self, amounts):
        self._amounts = amounts

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return [(a,) for a in self._amounts]


class _FakeDB:
    def __init__(self, amounts):
        self._amounts = amounts

    def query(self, *args, **kwargs):
        return _FakeQuery(self._amounts)


def test_naive_bayes_tokens():
    tokens = _tokenize("coffee at cafe lunch")
    assert "coffee" in tokens and "cafe" in tokens
    print("OK Naive Bayes tokenization")


def test_phrase_hints():
    assert "transport" in _phrase_hits("pathao")
    assert "transport" in _phrase_hits("Pathao ride to office")
    assert "entertainment" in _phrase_hits("go kart")
    assert "entertainment" in _phrase_hits("gokart sunday")
    print("OK Phrase hints (pathao / go kart)")


def test_fuzzy_brands():
    vocab = {w for words in SEED_WORDS.values() for w in words}
    hits = dict(_fuzzy_seed_hits(["pathaoo", "karting"], vocab))
    assert hits.get("pathaoo") == "pathao"
    assert hits.get("karting") == "kart" or "kart" in hits.get("karting", "")
    print("OK Fuzzy brand matching")


def test_kmeans_assignment():
    amounts = [100, 150, 5000, 5200, 200, 180]
    centroids = [150.0, 5100.0, 200.0]
    assignments = _assign_to_centroids(amounts, centroids)
    assert len(assignments) == 6
    assert assignments[0] == assignments[1]
    print("OK K-Means assignment")


def test_zscore_guards():
    assert MIN_SAMPLES == 5
    mean, std = _mean_std([100.0, 100.0, 100.0, 100.0, 100.0])
    assert std == mean * 0.05
    assert _severity(1.5) is None
    assert _severity(2.1) == "moderate"
    assert _severity(3.0) == "high"

    # Not enough history
    db = _FakeDB([100, 110, 105, 120])
    result = detect_anomaly("u", "food", 500, db, tx_type="expense")
    assert result["status"] == "not_enough_data"

    # Income skipped
    db = _FakeDB([100, 110, 105, 120, 115, 108])
    result = detect_anomaly("u", "salary", 50000, db, tx_type="income")
    assert result["status"] == "skipped"

    # Clear high anomaly
    history = [800, 850, 900, 820, 880, 870]
    db = _FakeDB(history)
    result = detect_anomaly("u", "food", 8500, db, tx_type="expense")
    assert result["status"] == "anomaly"
    assert result["severity"] == "high"
    assert "reason" in result
    print("OK Z-score anomaly detection")


def test_pace():
    on_track = compute_budget_pace(2000, 10000, 10, 30)
    assert on_track["status"] == "on_track"
    print("OK Budget pace (non-ML)")


if __name__ == "__main__":
    test_naive_bayes_tokens()
    test_phrase_hints()
    test_fuzzy_brands()
    test_kmeans_assignment()
    test_zscore_guards()
    test_pace()
    print("\nAll algorithm checks passed.")
