# -*- coding: utf-8 -*-
"""
test_agent_api.py
=================
Verification script for Phase 7 LangGraph AI Agent System API
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "api"))
sys.path.append(os.path.join(os.path.dirname(__file__), "agents"))
sys.path.append(os.path.join(os.path.dirname(__file__), "explainability"))
sys.path.append(os.path.join(os.path.dirname(__file__), "recommendation"))
sys.path.append(os.path.join(os.path.dirname(__file__), "models"))
sys.path.append(os.path.join(os.path.dirname(__file__), "similarity"))

from fastapi.testclient import TestClient
from api.main import app as fastapi_app

client = TestClient(fastapi_app)

def test_agent_workflow_endpoint():
    print("=" * 60)
    print("  Testing POST /agent Endpoint (LangGraph Orchestration)")
    print("=" * 60)

    payload = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0,
        "grade": "Standard"
    }

    res = client.post("/agent", json=payload)
    print(f"Status Code: {res.status_code}")
    assert res.status_code == 200, f"Error: {res.text}"

    data = res.json()
    print("Unified LangGraph Output:")
    print(f"Engine          : {data.get('workflow_engine')}")
    print(f"Prediction      : {data.get('prediction')}")
    print(f"Risk            : {data.get('risk')}%")
    print(f"Similar Cases   : {len(data.get('similar_cases', []))} cases")
    print(f"Recommendations : {len(data.get('recommendations', {}).get('recommendations', []))} actions")
    print(f"SHAP Impact     : {len(data.get('explanation', {}).get('feature_importance', []))} parameters")

    assert "prediction" in data
    assert "risk" in data
    assert "similar_cases" in data
    assert "recommendations" in data
    assert "explanation" in data

    print("\n[OK] POST /agent passed!")

    # Test graph topology endpoint
    print("\n" + "=" * 60)
    print("  Testing GET /agent/graph Endpoint")
    print("=" * 60)
    res_graph = client.get("/agent/graph")
    print(f"Status Code: {res_graph.status_code}")
    assert res_graph.status_code == 200
    graph_data = res_graph.json()
    print(f"Engine : {graph_data.get('engine')}")
    print(f"Nodes  : {[n['id'] for n in graph_data.get('nodes', [])]}")
    print(f"Edges  : {len(graph_data.get('edges', []))} directed edges")
    print("[OK] GET /agent/graph passed!")

if __name__ == "__main__":
    test_agent_workflow_endpoint()
