# -*- coding: utf-8 -*-
"""
test_feedback_api.py
====================
Verification script for Phase 10 Operator Feedback & AI Accuracy API
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "api"))
sys.path.append(os.path.join(os.path.dirname(__file__), "feedback"))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_feedback_endpoints():
    print("=" * 60)
    print("  Testing GET /feedback/stats Endpoint")
    print("=" * 60)

    res_stats = client.get("/feedback/stats")
    print(f"Status Code: {res_stats.status_code}")
    assert res_stats.status_code == 200

    data = res_stats.json()
    print("Baseline Statistics:")
    print(f"  - AI Accuracy     : {data.get('ai_accuracy')}%")
    print(f"  - Total Feedback  : {data.get('total_feedback')}")
    print(f"  - Accepted Count  : {data.get('accepted_count')}")
    print(f"  - Rejected Count  : {data.get('rejected_count')}")

    assert "ai_accuracy" in data
    assert data["total_feedback"] >= 23
    assert data["ai_accuracy"] >= 90.0

    print("\n[OK] GET /feedback/stats passed!")

    print("\n" + "=" * 60)
    print("  Testing POST /feedback Endpoint (Submitting Operator Approval)")
    print("=" * 60)

    payload = {
        "accepted": True,
        "operator": "Operator J. Miller",
        "prediction": "Off Spec",
        "risk": 99.95,
        "action": "Reduce Steam Pressure by 0.2 bar"
    }

    res_post = client.post("/feedback", json=payload)
    print(f"Status Code: {res_post.status_code}")
    assert res_post.status_code == 200

    updated_data = res_post.json()
    print("Updated Statistics after Feedback:")
    print(f"  - AI Accuracy     : {updated_data.get('ai_accuracy')}%")
    print(f"  - Total Feedback  : {updated_data.get('total_feedback')}")
    print(f"  - Accepted Count  : {updated_data.get('accepted_count')}")

    assert updated_data["total_feedback"] == data["total_feedback"] + 1
    assert updated_data["accepted_count"] == data["accepted_count"] + 1

    print("\n[OK] POST /feedback passed!")

if __name__ == "__main__":
    test_feedback_endpoints()
