# -*- coding: utf-8 -*-
"""
feedback.py
===========
FastAPI Router for Phase 10 Operator Feedback Loop

Endpoints:
    POST /feedback       -> Save operator recommendation approval/rejection
    GET  /feedback/stats -> Retrieve live AI Accuracy % and audit log history
"""

import sys
import os
from typing import Optional

# Make feedback/ importable
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "feedback"))

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# pyrefly: ignore [missing-import]
from feedback_store import save_operator_feedback, get_feedback_statistics

router = APIRouter(prefix="/feedback", tags=["Operator Feedback Loop"])


# ─────────────────────────────────────────────
# Request Schema
# ─────────────────────────────────────────────
class FeedbackRequest(BaseModel):
    accepted:   bool            = Field(..., example=True, description="Whether operator accepted recommendation")
    operator:   Optional[str]   = Field("Operator J. Miller", example="Operator J. Miller", description="Operator name")
    prediction: Optional[str]   = Field("Off Spec", example="Off Spec", description="Model predicted label")
    risk:       Optional[float] = Field(99.95, example=99.95, description="Model predicted risk %")
    action:     Optional[str]   = Field("Reduce Steam Pressure by 0.2 bar", example="Reduce Steam Pressure by 0.2 bar", description="Action taken")


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@router.post("", summary="Save Operator Feedback")
@router.post("/", summary="Save Operator Feedback")
def post_operator_feedback(req: FeedbackRequest):
    """
    Save operator Accept or Reject decision and update live AI Accuracy score.
    """
    feedback_dict = {
        "accepted": req.accepted,
        "operator": req.operator,
        "prediction": req.prediction,
        "risk": req.risk,
        "action": req.action,
    }
    updated_stats = save_operator_feedback(feedback_dict)
    return updated_stats


@router.get("/stats", summary="Get Live AI Accuracy Stats")
def get_feedback_stats_endpoint():
    """
    Return live AI Accuracy %, acceptance count, rejection count, and audit history.
    """
    return get_feedback_statistics()
