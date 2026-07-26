# -*- coding: utf-8 -*-
"""
recommendation_agent.py
=======================
Paper Factory AI — Phase 7 LangGraph Recommendation Node

Invokes the Decision Engine business rules and LLM operator explanation generator.
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "recommendation")))

# pyrefly: ignore [missing-import]
from recommendation_engine import get_recommendations
from state import AgentState


def recommendation_agent_node(state: AgentState) -> AgentState:
    """
    LangGraph node: RecommendationAgent
    Evaluates paper mill business rules and returns operator recommendations.
    """
    sensor_data = state.get("sensor_data", {})
    prediction = state.get("prediction", {})
    risk_pct = float(prediction.get("risk", 50.0))

    rec_res = get_recommendations(sensor_data, risk_pct, use_llm=True)
    state["recommendations"] = rec_res

    return state
