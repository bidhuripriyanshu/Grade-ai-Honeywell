# -*- coding: utf-8 -*-
"""
test_explain_api.py
===================
Verification script for Phase 6 Explainable AI (SHAP) API
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "api"))
sys.path.append(os.path.join(os.path.dirname(__file__), "explainability"))
sys.path.append(os.path.join(os.path.dirname(__file__), "recommendation"))
sys.path.append(os.path.join(os.path.dirname(__file__), "models"))
sys.path.append(os.path.join(os.path.dirname(__file__), "similarity"))

from fastapi.testclient import TestClient
from api.main import app as fastapi_app

client = TestClient(fastapi_app)

def test_explainability_endpoint():
    print("=" * 60)
    print("  Testing POST /explain Endpoint (SHAP)")
    print("=" * 60)

    payload = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0,
        "generate_plots": True
    }

    res = client.post("/explain", json=payload)
    print(f"Status Code: {res.status_code}")
    assert res.status_code == 200, f"Error: {res.text}"

    data = res.json()
    print("Response JSON Structure:")
    print(f"Prediction : {data.get('prediction')}")
    print(f"Risk       : {data.get('risk')}%")
    print(f"Base Risk  : {data.get('base_risk')}%")
    print("\nFeature Importance (SHAP Contributions):")
    for item in data.get("feature_importance", []):
        print(f"  - {item['feature']:<15} : {item['impact']:>5.1f}% (Value: {item['value']})")

    assert "prediction" in data
    assert "risk" in data
    assert "feature_importance" in data
    assert "plots" in data
    assert len(data["feature_importance"]) == 7

    print("\n[OK] POST /explain passed!")

    # Test retrieving plots
    print("\n" + "=" * 60)
    print("  Testing GET /explain/plots/bar.png")
    print("=" * 60)
    res_bar = client.get("/explain/plots/bar.png")
    print(f"Status Code: {res_bar.status_code}")
    assert res_bar.status_code == 200
    assert len(res_bar.content) > 1000, "Image size too small"
    print(f"Image Byte Size: {len(res_bar.content)} bytes")
    print("[OK] GET /explain/plots/bar.png passed!")

if __name__ == "__main__":
    test_explainability_endpoint()
