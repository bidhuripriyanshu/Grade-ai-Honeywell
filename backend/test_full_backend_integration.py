# -*- coding: utf-8 -*-
"""
test_full_backend_integration.py
=================================
End-to-End Integration Test Suite for Paper Factory AI Backend
Tests all 14 endpoints across 6 core AI capabilities.
"""

import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def run_all_checks():
    print("=" * 70)
    print("  Paper Factory AI — Full Backend Integration & Deployment Test")
    print("=" * 70)
    
    passed = 0
    failed = 0

    def check(name, status_code, condition=True, err_msg=""):
        nonlocal passed, failed
        if status_code == 200 and condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name} (Status: {status_code}) -- {err_msg}")
            failed += 1

    # 1. Health check
    res = client.get("/")
    check("GET / (Health Check)", res.status_code, res.json().get("status") == "online")

    # 2. Predict endpoint
    payload_predict = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0
    }
    res = client.post("/predict", json=payload_predict)
    check("POST /predict (Risk Prediction)", res.status_code, "prediction" in res.json())

    # 3. Model info endpoint
    res = client.get("/model-info")
    check("GET /model-info (Model Metadata)", res.status_code, "features" in res.json())

    # 4. History similar endpoint
    payload_history = {
        "machine_speed": 900.0,
        "steam_pressure": 9.8,
        "stock_flow": 108.0,
        "moisture": 5.6,
        "ash": 10.0,
        "basis_weight": 80.0,
        "recipe": "Recipe A",
        "grade": "Standard",
        "top_k": 3
    }
    res = client.post("/history/similar", json=payload_history)
    check("POST /history/similar (Similarity Search)", res.status_code, "similar_cases" in res.json())

    # 5. History grades endpoint
    res = client.get("/history/grades")
    check("GET /history/grades (Valid Grades)", res.status_code, len(res.json().get("grades", [])) > 0)

    # 6. History recipes endpoint
    res = client.get("/history/recipes")
    check("GET /history/recipes (Valid Recipes)", res.status_code, len(res.json().get("recipes", [])) > 0)

    # 7. Recommend endpoint
    res = client.post("/recommend", json=payload_predict)
    check("POST /recommend (Recommendation Engine)", res.status_code, "recommendations" in res.json())

    # 8. Recommend rules endpoint
    res = client.get("/recommend/rules")
    check("GET /recommend/rules (Business Rules)", res.status_code, res.json().get("total_rules", 0) >= 7)

    # 9. Explain endpoint
    payload_explain = {**payload_predict, "generate_plots": True}
    res = client.post("/explain", json=payload_explain)
    check("POST /explain (SHAP Analysis)", res.status_code, "feature_importance" in res.json())

    # 10. Explain plot image endpoint
    res = client.get("/explain/plots/bar.png")
    check("GET /explain/plots/bar.png (SHAP Plot PNG)", res.status_code, len(res.content) > 100)

    # 11. Agent workflow endpoint
    payload_agent = {**payload_predict, "grade": "Standard"}
    res = client.post("/agent", json=payload_agent)
    check("POST /agent (LangGraph AI Agent)", res.status_code, "workflow_engine" in res.json())

    # 12. Agent graph DAG endpoint
    res = client.get("/agent/graph")
    check("GET /agent/graph (Graph Topology)", res.status_code, "nodes" in res.json())

    # 13. Feedback stats endpoint
    res = client.get("/feedback/stats")
    check("GET /feedback/stats (AI Accuracy Stats)", res.status_code, "ai_accuracy" in res.json())

    # 14. Feedback post endpoint
    payload_fb = {
        "accepted": True,
        "operator": "Integration Tester",
        "prediction": "Off Spec",
        "risk": 99.95,
        "action": "Reduce Steam Pressure by 0.2 bar"
    }
    res = client.post("/feedback", json=payload_fb)
    check("POST /feedback (Save Operator Action)", res.status_code, "total_feedback" in res.json())

    print("=" * 70)
    print(f"  Integration Test Summary: {passed}/{passed+failed} Endpoints PASSED")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_checks()
