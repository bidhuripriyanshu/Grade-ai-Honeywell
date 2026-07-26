# -*- coding: utf-8 -*-
"""
test_recommend_api.py
=====================
Verification script for Phase 5 Recommendation Engine API
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "api"))
sys.path.append(os.path.join(os.path.dirname(__file__), "recommendation"))
sys.path.append(os.path.join(os.path.dirname(__file__), "models"))
sys.path.append(os.path.join(os.path.dirname(__file__), "similarity"))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_recommendation_endpoint():
    print("=" * 60)
    print("  Testing POST /recommend endpoint")
    print("=" * 60)

    # Test Payload 1: High risk scenario
    payload = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0
    }

    res = client.post("/recommend", json=payload)
    print(f"Status Code: {res.status_code}")
    assert res.status_code == 200, f"Error: {res.text}"

    data = res.json()
    print("Response JSON:")
    print(data)

    assert "risk" in data
    assert "recommendations" in data
    assert "summary" in data
    assert len(data["recommendations"]) > 0

    print("\n[OK] POST /recommend passed!")

    # Test Payload 2: Rules endpoint
    print("\n" + "=" * 60)
    print("  Testing GET /recommend/rules endpoint")
    print("=" * 60)
    res_rules = client.get("/recommend/rules")
    print(f"Status Code: {res_rules.status_code}")
    assert res_rules.status_code == 200
    print(res_rules.json())
    print("\n[OK] GET /recommend/rules passed!")

if __name__ == "__main__":
    test_recommendation_endpoint()
