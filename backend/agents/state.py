# -*- coding: utf-8 -*-
"""
state.py
========
Paper Factory AI — LangGraph Shared Agent State

Defines the shared state passed between nodes in the LangGraph workflow DAG.
"""

from typing import TypedDict, Dict, Any, List, Optional


class AgentState(TypedDict, total=False):
    """
    Shared state payload passed sequentially through all agent nodes:
    START -> PredictionAgent -> HistoryAgent -> RecommendationAgent -> ExplanationAgent -> END
    """
    sensor_data:     Dict[str, Any]       # Machine sensor inputs
    prediction:      Dict[str, Any]       # XGBoost prediction outcome & risk %
    similar_cases:   List[Dict[str, Any]] # Top-K historical transition cases
    recommendations: Dict[str, Any]       # Decision engine rules & LLM explanation
    explanation:     Dict[str, Any]       # SHAP feature importance breakdown & plots
    error:           Optional[str]        # Operational error messages (if any)
