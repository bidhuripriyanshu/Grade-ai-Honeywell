# -*- coding: utf-8 -*-
"""
agent.py
========
FastAPI Router for Phase 7 LangGraph AI Agent System

Endpoints:
    POST /agent       -> Run end-to-end LangGraph AI workflow DAG with custom parameters
    GET  /agent       -> Retrieve latest evaluated workflow state & parameters
    GET  /agent/graph -> Expose graph nodes and edges metadata for dashboard visualization
"""

import sys
import os
from typing import Optional, Dict, Any

# Make agents/ importable
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "agents"))

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# pyrefly: ignore [missing-import]
from workflow import run_workflow, LANGGRAPH_AVAILABLE
# pyrefly: ignore [missing-import]
from predict import encoder
# pyrefly: ignore [missing-import]
from search import encoders, HAS_SEARCH_ARTIFACTS

# Fallback lists for serverless mode (when .pkl files are unavailable)
_FALLBACK_RECIPES = ["Recipe A", "Recipe B", "Recipe C"]
_FALLBACK_GRADES  = ["Standard", "Premium", "Export"]

router = APIRouter(prefix="/agent", tags=["AI Agent System (LangGraph)"])

# In-memory store to retain the latest evaluated state across API callers (Swagger UI, Frontend, CLI)
latest_state: Optional[Dict[str, Any]] = None


# ─────────────────────────────────────────────
# Request Schema
# ─────────────────────────────────────────────
class AgentWorkflowRequest(BaseModel):
    machine_speed:  float = Field(..., example=950.0,   description="Machine speed (RPM)")
    steam_pressure: float = Field(..., example=9.8,     description="Steam pressure (bar)")
    stock_flow:     float = Field(..., example=105.0,   description="Stock flow (L/min)")
    moisture:       float = Field(..., example=4.7,     description="Moisture (%)")
    ash:            float = Field(..., example=12.0,    description="Ash content (%)")
    basis_weight:   float = Field(..., example=80.0,    description="Basis weight (g/m²)")
    recipe:         str   = Field(..., example="Recipe A", description="Recipe name")
    grade:          str   = Field("Standard", example="Standard", description="Paper grade")


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@router.post("", summary="Execute Full LangGraph AI Agent Workflow")
@router.post("/", summary="Execute Full LangGraph AI Agent Workflow")
def execute_agent_workflow(req: AgentWorkflowRequest):
    """
    Execute the unified LangGraph AI workflow agent across 4 stages:
    1. **PredictionAgent** (XGBoost Off-Spec Risk Prediction)
    2. **HistoryAgent** (Historical Similarity Search)
    3. **RecommendationAgent** (Decision Engine Rules + LLM Explanation)
    4. **ExplanationAgent** (SHAP Feature Contribution Analysis)
    """
    global latest_state
    valid_recipes = list(encoder.classes_) if encoder is not None and hasattr(encoder, "classes_") else _FALLBACK_RECIPES
    valid_grades  = list(encoders["Grade"].classes_) if encoders is not None and "Grade" in encoders else _FALLBACK_GRADES

    if req.recipe not in valid_recipes:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown recipe '{req.recipe}'. Valid options: {valid_recipes}",
        )
    if req.grade not in valid_grades:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown grade '{req.grade}'. Valid options: {valid_grades}",
        )

    sensor_dict = {
        "machine_speed": req.machine_speed,
        "steam_pressure": req.steam_pressure,
        "stock_flow": req.stock_flow,
        "moisture": req.moisture,
        "ash": req.ash,
        "basis_weight": req.basis_weight,
        "recipe": req.recipe,
        "grade": req.grade,
    }

    output = run_workflow(sensor_dict)
    latest_state = output
    return output


@router.get("", summary="Get Latest Evaluated Agent State")
@router.get("/", summary="Get Latest Evaluated Agent State")
def get_latest_agent_state():
    """
    Retrieve the most recently evaluated agent state & parameters.
    If no custom execution has occurred yet, runs evaluation for baseline parameters.
    """
    global latest_state
    if latest_state is not None:
        return latest_state

    default_sensor = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "basis_weight": 80.0,
        "recipe": "Recipe A",
        "grade": "Standard",
    }
    latest_state = run_workflow(default_sensor)
    return latest_state


@router.get("/graph", summary="Retrieve Graph DAG Architecture Metadata")
def get_graph_metadata():
    """
    Return node and edge topology for rendering the LangGraph workflow in the dashboard UI.
    """
    return {
        "engine": "LangGraph StateGraph v1.2.9" if LANGGRAPH_AVAILABLE else "Sequential DAG",
        "nodes": [
            {
                "id": "PredictionAgent",
                "name": "Prediction Agent",
                "type": "ML Inference",
                "module": "models/model.pkl",
                "description": "Calculates Off-Spec risk probability using trained XGBoost classifier."
            },
            {
                "id": "HistoryAgent",
                "name": "History Agent",
                "type": "Similarity Search",
                "module": "similarity/search.py",
                "description": "Queries historical vector index for Top-5 similar process transitions."
            },
            {
                "id": "RecommendationAgent",
                "name": "Recommendation Agent",
                "type": "Decision Engine",
                "module": "recommendation/recommendation_engine.py",
                "description": "Applies paper mill business rules & generates LLM operator explanation."
            },
            {
                "id": "ExplanationAgent",
                "name": "Explanation Agent",
                "type": "Explainable AI (SHAP)",
                "module": "explainability/shap_analysis.py",
                "description": "Calculates feature risk contribution percentages and renders SHAP charts."
            }
        ],
        "edges": [
            {"from": "__start__", "to": "PredictionAgent"},
            {"from": "PredictionAgent", "to": "HistoryAgent"},
            {"from": "HistoryAgent", "to": "RecommendationAgent"},
            {"from": "RecommendationAgent", "to": "ExplanationAgent"},
            {"from": "ExplanationAgent", "to": "__end__"}
        ]
    }
