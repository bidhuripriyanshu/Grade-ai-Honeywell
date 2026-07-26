# -*- coding: utf-8 -*-
"""
explain.py
==========
FastAPI Router for Phase 6 Explainable AI (SHAP)

Endpoints:
    POST /explain                 -> SHAP feature contribution breakdown JSON
    GET  /explain/plots/{name}    -> Serve SHAP plot images (bar.png, waterfall.png, summary.png)
"""

import sys
import os
from typing import Optional

# Make explainability/ importable
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "explainability"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "models"))

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException 
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# pyrefly: ignore [missing-import]
from explain_prediction import get_explainability_analysis, PLOTS_DIR
# pyrefly: ignore [missing-import]
from predict import encoder  

router = APIRouter(prefix="/explain", tags=["Explainability Engine (SHAP)"])


# ─────────────────────────────────────────────
# Request Schema
# ─────────────────────────────────────────────
class ExplainRequest(BaseModel):
    machine_speed:  float = Field(..., example=950.0,   description="Machine speed (RPM)")
    steam_pressure: float = Field(..., example=9.8,     description="Steam pressure (bar)")
    stock_flow:     float = Field(..., example=105.0,   description="Stock flow (L/min)")
    moisture:       float = Field(..., example=4.7,     description="Moisture (%)")
    ash:            float = Field(..., example=12.0,    description="Ash content (%)")
    basis_weight:   float = Field(..., example=80.0,    description="Basis weight (g/m²)")
    recipe:         str   = Field(..., example="Recipe A", description="Recipe name")
    generate_plots: Optional[bool] = Field(True, description="Whether to render SHAP plot images")


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@router.post("", summary="Generate SHAP Feature Contribution Analysis")
@router.post("/", summary="Generate SHAP Feature Contribution Analysis")
def explain_prediction_endpoint(req: ExplainRequest):
    """
    Accept sensor parameters and explain WHY the model predicted the off-spec risk.

    Returns:
    - Overall Off-Spec Risk %
    - SHAP Feature Importance (% risk contribution of each parameter)
    - Links to generated SHAP plots (bar, waterfall, summary)
    """
    valid_recipes = list(encoder.classes_)
    if req.recipe not in valid_recipes:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown recipe '{req.recipe}'. Valid recipes: {valid_recipes}",
        )

    sensor_dict = {
        "machine_speed": req.machine_speed,
        "steam_pressure": req.steam_pressure,
        "stock_flow": req.stock_flow,
        "moisture": req.moisture,
        "ash": req.ash,
        "basis_weight": req.basis_weight,
        "recipe": req.recipe,
    }

    result = get_explainability_analysis(sensor_dict, generate_plots=req.generate_plots)
    return result


@router.get("/plots/{plot_name}", summary="Retrieve Generated SHAP Plot Image")
def get_shap_plot(plot_name: str):
    """
    Serve generated SHAP plot PNG images (bar.png, waterfall.png, summary.png).
    """
    # Sanitize plot name
    safe_name = os.path.basename(plot_name)
    if not safe_name.endswith(".png"):
        safe_name += ".png"

    plot_path = os.path.join(PLOTS_DIR, safe_name)
    if not os.path.isfile(plot_path):
        raise HTTPException(
            status_code=404,
            detail=f"Plot image '{safe_name}' not found. Run POST /explain first to generate plots.",
        )

    return FileResponse(plot_path, media_type="image/png")
