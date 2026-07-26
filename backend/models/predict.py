# -*- coding: utf-8 -*-
"""
predict.py
==========
Paper Factory Off-Spec Prediction — Inference Script

Usage:
    Run from  backend/models/  directory:
        python predict.py

    Or import as a module and call predict_sample(...)
"""

import os
import joblib
import numpy as np

# ─────────────────────────────────────────────
# Load saved model & encoder
# ─────────────────────────────────────────────
MODEL_DIR    = os.path.dirname(__file__)
MODEL_PATH   = os.path.join(MODEL_DIR, "model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

model   = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

# ─────────────────────────────────────────────
# Feature order must match training
# ─────────────────────────────────────────────
FEATURE_COLS = [
    "Machine Speed",
    "Steam Pressure",
    "Stock Flow",
    "Moisture",
    "Ash",
    "Recipe",       # will be integer-encoded
    "Basis Weight",
]


def predict_sample(
    machine_speed: float,
    steam_pressure: float,
    stock_flow: float,
    moisture: float,
    ash: float,
    recipe: str,        # e.g. "Recipe A"
    basis_weight: float,
) -> dict:
    """
    Predict Off-Spec status and risk probability for a single sample.

    Returns
    -------
    dict with keys:
        prediction  : 0 (Normal) or 1 (Off-Spec)
        label       : "Normal" or "Off-Spec"
        risk_pct    : float — probability of Off-Spec (0–100)
        normal_pct  : float — probability of Normal  (0–100)
    """
    # Encode recipe label
    recipe_encoded = encoder.transform([recipe])[0]

    sample = np.array([[
        machine_speed,
        steam_pressure,
        stock_flow,
        moisture,
        ash,
        recipe_encoded,
        basis_weight,
    ]])

    prediction = int(model.predict(sample)[0])
    proba      = model.predict_proba(sample)[0]          # [normal_prob, offspec_prob]

    return {
        "prediction": prediction,
        "label":      "Off-Spec" if prediction == 1 else "Normal",
        "risk_pct":   round(float(proba[1]) * 100, 2),
        "normal_pct": round(float(proba[0]) * 100, 2),
    }


# ─────────────────────────────────────────────
# Quick test when run directly
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print("  Off-Spec Predictor — Sample Test")
    print("=" * 50)

    # Sample 1 — expected Normal
    result1 = predict_sample(
        machine_speed=900,
        steam_pressure=9.8,
        stock_flow=108.0,
        moisture=5.6,
        ash=10.0,
        recipe="Recipe A",
        basis_weight=80.0,
    )
    print(f"\n[NORMAL] Sample 1 (should be Normal):")
    print(f"   Prediction : {result1['prediction']} -> {result1['label']}")
    print(f"   Risk       : {result1['risk_pct']}%")
    print(f"   Normal     : {result1['normal_pct']}%")

    # Sample 2 — pushed into off-spec territory
    result2 = predict_sample(
        machine_speed=1200,
        steam_pressure=14.5,
        stock_flow=140.0,
        moisture=9.5,
        ash=18.0,
        recipe="Recipe C",
        basis_weight=92.0,
    )
    print(f"\n[ALERT] Sample 2 (stress test -- likely Off-Spec):")
    print(f"   Prediction : {result2['prediction']} -> {result2['label']}")
    print(f"   Risk       : {result2['risk_pct']}%")
    print(f"   Normal     : {result2['normal_pct']}%")

    print("\n[OK] predict.py working correctly.")
    print("=" * 50)
