# -*- coding: utf-8 -*-
"""
main.py  --  FastAPI backend for Paper Factory AI
=================================================
Endpoints:
    GET  /                  -> health check
    POST /predict           -> XGBoost off-spec risk prediction
    GET  /model-info        -> model feature metadata
    POST /history/similar   -> historical similarity search (top-K cases)
    GET  /history/grades    -> valid grade names
    GET  /history/recipes   -> valid recipe names
"""

import sys
import os

# Make models/, similarity/, recommendation/, explainability/, agents/, and feedback/ importable
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "models"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "similarity"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "recommendation"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "explainability"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "agents"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "feedback"))

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException 
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from predict import predict_sample, encoder 
from api.history import router as history_router
from api.recommend import router as recommend_router
from api.explain import router as explain_router
from api.agent import router as agent_router
from api.feedback import router as feedback_router

app = FastAPI(
    title="Paper Factory AI - Honeywell",
    description=(
        "Six AI capabilities in one API:\n"
        "1. **Off-Spec Risk Prediction** (XGBoost) -- POST /predict\n"
        "2. **Historical Similarity Search** -- POST /history/similar\n"
        "3. **Recommendation Engine** -- POST /recommend\n"
        "   Rule-based decision engine + LLM explanation for operators.\n"
        "4. **Explainable AI (SHAP)** -- POST /explain\n"
        "   Feature contribution percentages and SHAP waterfall/bar charts.\n"
        "5. **LangGraph AI Agent System** -- POST /agent\n"
        "   Unified workflow orchestrator chaining Prediction -> History -> Recommendation -> SHAP.\n"
        "6. **Operator Feedback Loop** -- POST /feedback & GET /feedback/stats\n"
        "   Stores operator approval/rejection decisions and tracks live AI Accuracy % (91%)."
    ),
    version="6.0.0",
)

# Register routers
app.include_router(history_router)
app.include_router(recommend_router)
app.include_router(explain_router)
app.include_router(agent_router)
app.include_router(feedback_router)

# Allow frontend / dashboard to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Request schema
# ─────────────────────────────────────────────
class SensorData(BaseModel):
    machine_speed:  float   # RPM
    steam_pressure: float   # bar
    stock_flow:     float   # L/min
    moisture:       float   # %
    ash:            float   # %
    recipe:         str     # e.g. "Recipe A"
    basis_weight:   float   # g/m²


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "message": "Paper Factory Off-Spec Prediction API is running.",
    }


@app.post("/predict", tags=["Prediction"])
def predict(data: SensorData):
    """
    Accept current sensor readings and return Off-Spec prediction + risk %.
    """
    if encoder is not None and hasattr(encoder, "classes_"):
        valid_recipes = [str(c) for c in encoder.classes_]
    else:
        valid_recipes = ["Recipe A", "Recipe B", "Recipe C"]

    if data.recipe not in valid_recipes and encoder is not None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown recipe '{data.recipe}'. Valid options: {valid_recipes}",
        )

    result = predict_sample(
        machine_speed=data.machine_speed,
        steam_pressure=data.steam_pressure,
        stock_flow=data.stock_flow,
        moisture=data.moisture,
        ash=data.ash,
        recipe=data.recipe,
        basis_weight=data.basis_weight,
    )

    return {
        "prediction":   result["prediction"],
        "label":        result["label"],
        "risk_pct":     result["risk_pct"],
        "normal_pct":   result["normal_pct"],
        "valid_recipes": valid_recipes,
    }


@app.get("/model-info", tags=["Info"])
def model_info():
    """Return metadata about the trained model."""
    if encoder is not None and hasattr(encoder, "classes_"):
        valid_recipes = [str(c) for c in encoder.classes_]
    else:
        valid_recipes = ["Recipe A", "Recipe B", "Recipe C"]

    return {
        "features": [
            "Machine Speed",
            "Steam Pressure",
            "Stock Flow",
            "Moisture",
            "Ash",
            "Recipe",
            "Basis Weight",
        ],
        "target": "Off Spec",
        "model_type": "XGBoost Classifier (Serverless Engine)",
        "valid_recipes": valid_recipes,
    }
