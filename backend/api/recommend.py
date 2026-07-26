# -*- coding: utf-8 -*-
"""
recommend.py
============
FastAPI Router for Phase 5 Recommendation Engine

Endpoints:
    POST /recommend       -> Evaluate business rules & generate LLM explanation
    GET  /recommend/rules -> List all defined business rules in the recommendation engine
"""

import sys
import os
from typing import Optional, List, Dict, Any

# Ensure recommendation/ and models/ are importable
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "recommendation"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "models"))

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException    
from pydantic import BaseModel, Field

# pyrefly: ignore [missing-import]
from recommendation_engine import get_recommendations 
# pyrefly: ignore [missing-import]
from rules import get_all_rules_metadata
# pyrefly: ignore [missing-import]
from predict import predict_sample, encoder

router = APIRouter(prefix="/recommend", tags=["Recommendation Engine"])


# ─────────────────────────────────────────────
# Request Schema
# ─────────────────────────────────────────────
class RecommendationRequest(BaseModel):
    machine_speed:  float           = Field(..., example=950.0,   description="Machine speed (RPM)")
    steam_pressure: float           = Field(..., example=9.8,     description="Steam pressure (bar)")
    stock_flow:     float           = Field(..., example=105.0,   description="Stock flow (L/min)")
    moisture:       float           = Field(..., example=4.7,     description="Moisture (%)")
    ash:            float           = Field(..., example=12.0,    description="Ash content (%)")
    basis_weight:   float           = Field(..., example=80.0,    description="Basis weight (g/m²)")
    recipe:         str             = Field(..., example="Recipe A", description="Recipe name")
    risk_pct:       Optional[float] = Field(None, example=92.5,   description="Optional Off-Spec Risk % (Auto-computed via XGBoost if omitted)")


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@router.post("", summary="Generate Recommendations & LLM Explanation")
@router.post("/", summary="Generate Recommendations & LLM Explanation")
def recommend_actions(req: RecommendationRequest):
    """
    Accept sensor parameters and generate operator recommendations.

    If `risk_pct` is not provided in the payload, the endpoint automatically runs the
    XGBoost model (`predict_sample`) to calculate the off-spec risk.
    """
    valid_recipes = list(encoder.classes_) if encoder is not None and hasattr(encoder, "classes_") else ["Recipe A", "Recipe B", "Recipe C"]
    if req.recipe not in valid_recipes and encoder is not None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown recipe '{req.recipe}'. Valid recipes: {valid_recipes}",
        )

    # 1. Compute off-spec risk if not provided
    if req.risk_pct is None:
        pred_res = predict_sample(
            machine_speed=req.machine_speed,
            steam_pressure=req.steam_pressure,
            stock_flow=req.stock_flow,
            moisture=req.moisture,
            ash=req.ash,
            recipe=req.recipe,
            basis_weight=req.basis_weight,
        )
        calculated_risk = pred_res["risk_pct"]
    else:
        calculated_risk = req.risk_pct

    sensor_dict = {
        "machine_speed": req.machine_speed,
        "steam_pressure": req.steam_pressure,
        "stock_flow": req.stock_flow,
        "moisture": req.moisture,
        "ash": req.ash,
        "basis_weight": req.basis_weight,
        "recipe": req.recipe,
    }

    # 2. Generate decision engine recommendations + LLM synthesis
    output = get_recommendations(sensor_dict, calculated_risk, use_llm=True)

    return output


@router.get("/rules", summary="List All Decision Engine Rules")
def list_rules():
    """
    Return all configured domain business rules used by the recommendation engine.
    """
    return {
        "total_rules": len(get_all_rules_metadata()),
        "rules": get_all_rules_metadata()
    }
