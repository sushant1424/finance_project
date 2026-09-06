#!/usr/bin/env python3
"""Quick sanity checks for FinSight algorithms."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.categorizer_service import _phrase_hits, _tokenize, _fuzzy_seed_hits, SEED_WORDS
from app.services.clustering_service import _assign_to_centroids
from app.services.pace_service import compute_budget_pace
from app.services.trend_service import compute_ewma, get_trend_direction


def test_naive_bayes_tokens():
    tokens = _tokenize("coffee at cafe lunch")
    assert "coffee" in tokens and "cafe" in tokens
    print("✓ Naive Bayes tokenization")


def test_phrase_hints():
    assert "transport" in _phrase_hits("pathao")
    assert "transport" in _phrase_hits("Pathao ride to office")
    assert "entertainment" in _phrase_hits("go kart")
    assert "entertainment" in _phrase_hits("gokart sunday")
    print("✓ Phrase hints (pathao / go kart)")


def test_fuzzy_brands():
    vocab = {w for words in SEED_WORDS.values() for w in words}
    hits = dict(_fuzzy_seed_hits(["pathaoo", "karting"], vocab))
    assert hits.get("pathaoo") == "pathao"
    assert hits.get("karting") == "kart" or "kart" in hits.get("karting", "")
    print("✓ Fuzzy brand matching")


def test_kmeans_assignment():
    amounts = [100, 150, 5000, 5200, 200, 180]
    centroids = [150.0, 5100.0, 200.0]
    assignments = _assign_to_centroids(amounts, centroids)
    assert len(assignments) == 6
    assert assignments[0] == assignments[1]
    print("✓ K-Means assignment")


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
    print("✓ EWMA trend direction")


def test_pace():
    on_track = compute_budget_pace(2000, 10000, 10, 30)
    assert on_track["status"] == "on_track"
    print("✓ Budget pace (non-ML)")


if __name__ == "__main__":
    test_naive_bayes_tokens()
    test_phrase_hints()
    test_fuzzy_brands()
    test_kmeans_assignment()
    test_ewma()
    test_trend()
    test_pace()
    print("\nAll algorithm checks passed.")
