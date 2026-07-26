# -*- coding: utf-8 -*-
"""
history.py
==========
FastAPI router for Historical Similarity Search

Endpoints:
    POST /history/similar    -> find top-K similar historical transitions
    GET  /history/grades     -> list all valid grades
    GET  /history/recipes    -> list all valid recipes
"""

import sys
import os

# Make similarity/ importable
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "similarity"))

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
# pyrefly: ignore [missing-import]
from search import find_similar_cases, encoders

router = APIRouter(prefix="/history", tags=["Historical Similarity"])


# ─────────────────────────────────────────────
# Request / Response schemas
# ─────────────────────────────────────────────
class SimilarityRequest(BaseModel):
    machine_speed:  float = Field(..., example=900.0,   description="Machine speed (RPM)")
    steam_pressure: float = Field(..., example=9.8,     description="Steam pressure (bar)")
    stock_flow:     float = Field(..., example=108.0,   description="Stock flow (L/min)")
    moisture:       float = Field(..., example=5.6,     description="Moisture (%)")
    ash:            float = Field(..., example=10.0,    description="Ash content (%)")
    basis_weight:   float = Field(..., example=80.0,    description="Basis weight (g/m2)")
    recipe:         str   = Field(..., example="Recipe A", description="Current recipe name")
    grade:          str   = Field(..., example="Standard",  description="Current paper grade")
    top_k:          int   = Field(5, ge=1, le=20,       description="Number of similar cases to return")


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@router.post("/similar")
def get_similar_cases(req: SimilarityRequest):
    """
    Find the most similar historical process transitions.

    Returns top-K cases ranked by cosine similarity, with:
    - Similarity percentage
    - Historical sensor readings
    - Outcome (Success / Off-Spec)
    - Operator action taken
    - Summary stats (success rate, warning notes)
    """
    valid_recipes = list(encoders["Recipe"].classes_)
    valid_grades  = list(encoders["Grade"].classes_)

    if req.recipe not in valid_recipes:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown recipe '{req.recipe}'. Valid: {valid_recipes}",
        )
    if req.grade not in valid_grades:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown grade '{req.grade}'. Valid: {valid_grades}",
        )

    result = find_similar_cases(
        machine_speed=req.machine_speed,
        steam_pressure=req.steam_pressure,
        stock_flow=req.stock_flow,
        moisture=req.moisture,
        ash=req.ash,
        basis_weight=req.basis_weight,
        recipe=req.recipe,
        grade=req.grade,
        top_k=req.top_k,
    )

    return result


@router.get("/grades")
def list_grades():
    """Return all valid paper grades in the historical dataset."""
    return {"grades": list(encoders["Grade"].classes_)}


@router.get("/recipes")
def list_recipes():
    """Return all valid recipes in the historical dataset."""
    return {"recipes": list(encoders["Recipe"].classes_)}
