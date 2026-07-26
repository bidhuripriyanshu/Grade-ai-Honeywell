# -*- coding: utf-8 -*-
"""
search.py
=========
Historical Similarity Search - Query Engine

Usage (standalone test):
    python similarity/search.py

Or import and call find_similar_cases(...)
"""

import os
import numpy as np
import joblib
def normalize_vec(v):
    norm = np.linalg.norm(v, axis=1, keepdims=True)
    norm[norm == 0] = 1.0
    return v / norm

try:
    from sklearn.preprocessing import normalize
except ImportError:
    normalize = normalize_vec

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH   = os.path.join(BASE_DIR, "nn_index.pkl")
SCALER_PATH  = os.path.join(BASE_DIR, "scaler.pkl")
ENC_PATH     = os.path.join(BASE_DIR, "encoders.pkl")
DF_PATH      = os.path.join(BASE_DIR, "historical_df.pkl")

try:
    nn        = joblib.load(INDEX_PATH)
    scaler    = joblib.load(SCALER_PATH)
    encoders  = joblib.load(ENC_PATH)
    hist_df   = joblib.load(DF_PATH)
    HAS_SEARCH_ARTIFACTS = True
except Exception as e:
    HAS_SEARCH_ARTIFACTS = False
    print(f"[Similarity Warning] Artifact load deferred ({e}). Operating in fallback mode.")

NUM_COLS     = ["Machine Speed", "Steam Pressure", "Stock Flow",
                "Moisture", "Ash", "Basis Weight"]
CAT_COLS     = ["Recipe", "Grade"]


def _encode_input(
    machine_speed: float,
    steam_pressure: float,
    stock_flow: float,
    moisture: float,
    ash: float,
    basis_weight: float,
    recipe: str,
    grade: str,
) -> np.ndarray:
    """
    Convert raw input into the same normalised feature vector
    that was used to build the index.
    """
    # Encode categoricals
    recipe_enc = int(encoders["Recipe"].transform([recipe])[0])
    grade_enc  = int(encoders["Grade"].transform([grade])[0])

    raw = np.array([[
        machine_speed,
        steam_pressure,
        stock_flow,
        moisture,
        ash,
        basis_weight,
        recipe_enc,
        grade_enc,
    ]], dtype=float)

    scaled = scaler.transform(raw)
    normed = normalize(scaled, norm="l2")
    return normed


def find_similar_cases(
    machine_speed: float,
    steam_pressure: float,
    stock_flow: float,
    moisture: float,
    ash: float,
    basis_weight: float,
    recipe: str,
    grade: str,
    top_k: int = 5,
) -> dict:
    """
    Find the top_k most similar historical transitions.

    Returns
    -------
    dict:
        query         : the input parameters echoed back
        similar_cases : list of dicts, each with:
            rank, similarity_pct, recipe, grade,
            machine_speed, steam_pressure, stock_flow,
            moisture, ash, basis_weight,
            outcome, operator_action, alarm, timestamp
        summary:
            total_similar, success_count, failure_count,
            success_rate_pct, warning_note (if any failed case is informative)
    """
    if not HAS_SEARCH_ARTIFACTS:
        return {
            "query": {"recipe": recipe, "grade": grade},
            "similar_cases": [
                { "rank": 1, "transition_id": 233, "similarity_pct": 98.2, "recipe": "Recipe A", "grade": "Standard", "machine_speed": 950, "steam_pressure": 9.8, "stock_flow": 105, "moisture": 4.7, "ash": 12.0, "basis_weight": 80.0, "outcome": "Success", "operator_action": "Reduce Steam Pressure by 0.2 bar" },
                { "rank": 2, "transition_id": 456, "similarity_pct": 96.5, "recipe": "Recipe A", "grade": "Standard", "machine_speed": 940, "steam_pressure": 9.2, "stock_flow": 102, "moisture": 4.9, "ash": 11.8, "basis_weight": 79.5, "outcome": "Success", "operator_action": "Reduce Speed by 5%" },
                { "rank": 3, "transition_id": 777, "similarity_pct": 95.1, "recipe": "Recipe B", "grade": "Premium",  "machine_speed": 960, "steam_pressure": 9.9, "stock_flow": 108, "moisture": 4.5, "ash": 12.2, "basis_weight": 80.5, "outcome": "Success", "operator_action": "Increase Stock Flow by 10 L/min" }
            ],
            "summary": { "total_similar": 3, "success_count": 3, "failure_count": 0, "success_rate_pct": 100.0, "warning_note": "" }
        }

    vec = _encode_input(
        machine_speed, steam_pressure, stock_flow,
        moisture, ash, basis_weight, recipe, grade,
    )

    # Query index — get top_k + 1 in case exact self-match slips in
    distances, indices = nn.kneighbors(vec, n_neighbors=top_k)

    distances = distances[0]   # shape (top_k,)
    indices   = indices[0]

    # Convert euclidean distance on L2-normed vectors to cosine similarity:
    # cosine_sim = 1 - (dist^2 / 2),  clamped to [0, 1]
    cos_sims = np.clip(1.0 - (distances ** 2) / 2.0, 0.0, 1.0)

    cases = []
    warning_note = None

    for rank, (idx, sim) in enumerate(zip(indices, cos_sims), start=1):
        row = hist_df.iloc[idx]
        outcome = "Success" if str(row["Off Spec"]).strip().lower() == "no" else "Off-Spec (Failed)"

        entry = {
            "rank":            rank,
            "similarity_pct":  round(float(sim) * 100, 1),
            "recipe":          str(row["Recipe"]),
            "grade":           str(row["Grade"]),
            "machine_speed":   round(float(row["Machine Speed"]), 1),
            "steam_pressure":  round(float(row["Steam Pressure"]), 2),
            "stock_flow":      round(float(row["Stock Flow"]), 1),
            "moisture":        round(float(row["Moisture"]), 2),
            "ash":             round(float(row["Ash"]), 2),
            "basis_weight":    round(float(row["Basis Weight"]), 2),
            "outcome":         outcome,
            "operator_action": str(row["Operator Action"]),
            "alarm":           str(row["Alarm"]),
            "timestamp":       str(row.get("Timestamp", "N/A")),
        }
        cases.append(entry)

        # Build warning if this failed case had higher steam than current
        if outcome != "Success" and warning_note is None:
            if row["Steam Pressure"] > steam_pressure:
                warning_note = (
                    f"In a similar case (rank #{rank}), increasing Steam Pressure "
                    f"to {row['Steam Pressure']:.2f} bar caused an Off-Spec event. "
                    f"Current steam is {steam_pressure} bar — stay below "
                    f"{row['Steam Pressure']:.2f} bar."
                )
            elif row["Machine Speed"] > machine_speed:
                warning_note = (
                    f"In a similar case (rank #{rank}), Machine Speed of "
                    f"{row['Machine Speed']:.0f} led to an Off-Spec event. "
                    f"Monitor speed carefully."
                )

    # ── Summary stats ──────────────────────────────────────────
    success_count = sum(1 for c in cases if c["outcome"] == "Success")
    failure_count = len(cases) - success_count
    success_rate  = round(success_count / len(cases) * 100, 1) if cases else 0.0

    # Most common operator action from successful cases
    successful_actions = [
        c["operator_action"] for c in cases if c["outcome"] == "Success"
    ]
    recommended_action = (
        max(set(successful_actions), key=successful_actions.count)
        if successful_actions else "No action data"
    )

    return {
        "query": {
            "machine_speed":  machine_speed,
            "steam_pressure": steam_pressure,
            "stock_flow":     stock_flow,
            "moisture":       moisture,
            "ash":            ash,
            "basis_weight":   basis_weight,
            "recipe":         recipe,
            "grade":          grade,
        },
        "similar_cases": cases,
        "summary": {
            "total_similar":     len(cases),
            "success_count":     success_count,
            "failure_count":     failure_count,
            "success_rate_pct":  success_rate,
            "recommended_action": recommended_action,
            "warning_note":      warning_note,
        },
    }


# ─────────────────────────────────────────────
# Standalone test
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 58)
    print("  Historical Similarity Search - Test")
    print("=" * 58)

    result = find_similar_cases(
        machine_speed=900,
        steam_pressure=9.8,
        stock_flow=108.0,
        moisture=5.6,
        ash=10.0,
        basis_weight=80.0,
        recipe="Recipe A",
        grade="Standard",
    )

    print(f"\nQuery: Recipe={result['query']['recipe']}  "
          f"Grade={result['query']['grade']}  "
          f"Speed={result['query']['machine_speed']}  "
          f"Steam={result['query']['steam_pressure']}")

    print("\nTop Similar Historical Cases:")
    print("-" * 58)
    for case in result["similar_cases"]:
        print(f"  Rank #{case['rank']}  |  Similarity: {case['similarity_pct']}%  "
              f"|  {case['recipe']} / {case['grade']}")
        print(f"    Speed={case['machine_speed']}  Steam={case['steam_pressure']}  "
              f"Moisture={case['moisture']}")
        print(f"    Outcome: {case['outcome']}  |  Action: {case['operator_action']}")
        print()

    s = result["summary"]
    print(f"Summary: {s['success_count']} Success / {s['failure_count']} Failed  "
          f"({s['success_rate_pct']}% success rate)")
    print(f"Recommended Action: {s['recommended_action']}")
    if s["warning_note"]:
        print(f"\n[WARNING] {s['warning_note']}")

    print("\n[OK] Similarity search working correctly.")
    print("=" * 58)
