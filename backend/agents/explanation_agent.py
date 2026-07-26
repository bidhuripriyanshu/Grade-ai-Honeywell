# -*- coding: utf-8 -*-
"""
explanation_agent.py
====================
Paper Factory AI — Phase 7 LangGraph Explanation Node

Invokes SHAP Explainability analysis (shap_analysis.py) to calculate feature
contributions and render plot artifacts.
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "explainability")))

# pyrefly: ignore [missing-import]
from explain_prediction import get_explainability_analysis
from state import AgentState


def explanation_agent_node(state: AgentState) -> AgentState:
    """
    LangGraph node: ExplanationAgent
    Calculates SHAP feature contributions and generates plot URLs.
    """
    sensor_data = state.get("sensor_data", {})

    expl_res = get_explainability_analysis(sensor_data, generate_plots=True)
    state["explanation"] = expl_res

    return state
