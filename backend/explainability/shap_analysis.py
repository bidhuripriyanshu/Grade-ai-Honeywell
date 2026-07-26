# -*- coding: utf-8 -*-
"""
shap_analysis.py
================
Paper Factory AI — SHAP Feature Contribution Calculation

Loads trained XGBoost model and computes SHAP (SHapley Additive exPlanations)
contributions for sensor parameters to explain off-spec predictions.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd

# Load saved model & encoder from models/
MODEL_DIR    = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
MODEL_PATH   = os.path.join(MODEL_DIR, "model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

model   = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

FEATURE_COLS = [
    "Machine Speed",
    "Steam Pressure",
    "Stock Flow",
    "Moisture",
    "Ash",
    "Recipe",
    "Basis Weight",
]


def calculate_shap_contributions(sensor_data: dict) -> dict:
    """
    Calculate SHAP feature contribution percentages for a given sensor sample.

    Parameters
    ----------
    sensor_data : dict
        Keys: machine_speed, steam_pressure, stock_flow, moisture, ash, basis_weight, recipe.

    Returns
    -------
    dict
        {
            "prediction": "Off Spec" | "Normal",
            "risk_pct": float,
            "base_risk_pct": float,
            "feature_importance": [
                {
                    "feature": str,
                    "impact": float (percentage points contribution),
                    "raw_shap": float,
                    "value": float | str
                }, ...
            ],
            "raw_shap_values": list of float,
            "feature_values": list of float,
            "feature_names": list of str
        }
    """
    # pyrefly: ignore [missing-import]
    import xgboost as xgb

    speed = float(sensor_data.get("machine_speed", 900.0))
    steam = float(sensor_data.get("steam_pressure", 9.5))
    flow  = float(sensor_data.get("stock_flow", 105.0))
    moist = float(sensor_data.get("moisture", 5.5))
    ash   = float(sensor_data.get("ash", 12.0))
    recipe_str = str(sensor_data.get("recipe", "Recipe A"))
    bw    = float(sensor_data.get("basis_weight", 80.0))

    # Validate recipe
    valid_recipes = list(encoder.classes_)
    if recipe_str in valid_recipes:
        recipe_enc = int(encoder.transform([recipe_str])[0])
    else:
        recipe_enc = 0

    df_input = pd.DataFrame([[
        speed,
        steam,
        flow,
        moist,
        ash,
        recipe_enc,
        bw
    ]], columns=FEATURE_COLS)

    # Prediction probability
    proba = model.predict_proba(df_input)[0]
    risk_pct = round(float(proba[1]) * 100, 2)
    pred_label = "Off Spec" if risk_pct >= 50.0 else "Normal"

    # Try SHAP package or XGBoost pred_contribs
    try:
        # pyrefly: ignore [missing-import]
        import shap
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(df_input)
        if isinstance(shap_vals, list):
            # Binary classification list [prob_0, prob_1]
            raw_contribs = np.array(shap_vals[1][0])
            base_val = explainer.expected_value[1] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value
        else:
            if len(shap_vals.shape) == 3:
                raw_contribs = shap_vals[0, :, 1]
                base_val = explainer.expected_value[1]
            else:
                raw_contribs = shap_vals[0]
                base_val = explainer.expected_value
    except Exception:
        # Fallback to XGBoost native pred_contribs
        dmat = xgb.DMatrix(df_input)
        booster = model.get_booster()
        contrib_arr = booster.predict(dmat, pred_contribs=True)[0]
        raw_contribs = contrib_arr[:-1]
        base_val = contrib_arr[-1]

    # Convert base log-odds to probability
    def logit_to_prob(l):
        return 1.0 / (1.0 + np.exp(-l))

    base_risk_pct = round(float(logit_to_prob(base_val) * 100), 2)

    # Normalize contributions into impact percentage points
    total_abs = float(np.sum(np.abs(raw_contribs)))
    delta_risk = risk_pct - base_risk_pct

    feature_importance = []
    actual_values = [speed, steam, flow, moist, ash, recipe_str, bw]

    for idx, name in enumerate(FEATURE_COLS):
        c_val = float(raw_contribs[idx])
        if total_abs > 1e-6:
            # Impact percentage points proportional to SHAP log-odds magnitude & direction
            impact_pct = (c_val / total_abs) * abs(delta_risk) if abs(delta_risk) > 1.0 else (c_val * 20.0)
        else:
            impact_pct = 0.0

        feature_importance.append({
            "feature": name,
            "impact": round(float(impact_pct), 1),
            "raw_shap": round(c_val, 4),
            "value": actual_values[idx]
        })

    # Sort feature importance by absolute impact descending
    feature_importance.sort(key=lambda x: abs(x["impact"]), reverse=True)

    return {
        "prediction": pred_label,
        "risk": risk_pct,
        "base_risk": base_risk_pct,
        "feature_importance": feature_importance,
        "raw_shap_values": [round(float(v), 4) for v in raw_contribs],
        "feature_values": actual_values,
        "feature_names": FEATURE_COLS
    }


if __name__ == "__main__":
    test_data = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0
    }
    res = calculate_shap_contributions(test_data)
    print("=" * 50)
    print("  SHAP Analysis — Direct Test Output")
    print("=" * 50)
    print(f"Prediction : {res['prediction']}")
    print(f"Risk       : {res['risk']}%")
    print(f"Base Risk  : {res['base_risk']}%")
    print("\nFeature Contribution Breakdown:")
    for item in res["feature_importance"]:
        sign = "+" if item["impact"] >= 0 else ""
        print(f"  - {item['feature']:<15} : {sign}{item['impact']}% (Value: {item['value']})")
    print("=" * 50)
