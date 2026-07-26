# -*- coding: utf-8 -*-
"""
workflow.py
===========
Paper Factory AI — Phase 7 LangGraph Workflow Orchestrator

Builds and executes the LangGraph DAG pipeline connecting:
  START -> PredictionAgent -> HistoryAgent -> RecommendationAgent -> ExplanationAgent -> END
"""

import sys
import os
from typing import Dict, Any

# pyrefly: ignore [missing-import]
from state import AgentState
# pyrefly: ignore [missing-import]
from prediction_agent import prediction_agent_node
# pyrefly: ignore [missing-import]
from history_agent import history_agent_node
# pyrefly: ignore [missing-import]
from recommendation_agent import recommendation_agent_node
# pyrefly: ignore [missing-import]
from explanation_agent import explanation_agent_node

# Attempt to import LangGraph StateGraph
try:
    # pyrefly: ignore [missing-import]
    from langgraph.graph import StateGraph, START, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False


def _build_langgraph_workflow():
    """Construct and compile the LangGraph StateGraph pipeline."""
    if not LANGGRAPH_AVAILABLE:
        return None

    builder = StateGraph(AgentState)

    # 1. Register nodes
    builder.add_node("PredictionAgent", prediction_agent_node)
    builder.add_node("HistoryAgent", history_agent_node)
    builder.add_node("RecommendationAgent", recommendation_agent_node)
    builder.add_node("ExplanationAgent", explanation_agent_node)

    # 2. Add sequential edges
    builder.add_edge(START, "PredictionAgent")
    builder.add_edge("PredictionAgent", "HistoryAgent")
    builder.add_edge("HistoryAgent", "RecommendationAgent")
    builder.add_edge("RecommendationAgent", "ExplanationAgent")
    builder.add_edge("ExplanationAgent", END)

    # 3. Compile workflow graph
    return builder.compile()


# Compiled LangGraph instance
compiled_graph = _build_langgraph_workflow()


def _fallback_pipeline_execution(sensor_data: Dict[str, Any]) -> AgentState:
    """Sequential DAG runner used if LangGraph runtime is unavailable."""
    state: AgentState = {"sensor_data": sensor_data}
    state = prediction_agent_node(state)
    state = history_agent_node(state)
    state = recommendation_agent_node(state)
    state = explanation_agent_node(state)
    return state


# Import Phase 9 AI explanation service
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ai")))
try:
    # pyrefly: ignore [missing-import]
    from explanation_service import generate_copilot_explanation
except ImportError:
    def generate_copilot_explanation(state: Dict[str, Any]) -> str:
        """Offline fallback when ai/ module is not available (e.g. Vercel)."""
        pred = state.get("prediction", {})
        risk = float(pred.get("risk", 50.0))
        recs = state.get("recommendations", {}).get("recommendations", [])
        actions_str = ", ".join([r["action"].lower() for r in recs]) if recs else "maintaining current setpoints"
        if risk >= 70.0:
            return (
                f"High off-spec risk ({risk:.1f}%) detected. Recommended corrective actions: "
                f"{actions_str}. These adjustments will normalize process conditions and "
                f"reduce grade transition defects."
            )
        return (
            f"Current grade transition operating with low off-spec risk ({risk:.1f}%). "
            f"Continue {actions_str} to preserve sheet uniformity."
        )


def run_workflow(sensor_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for Phase 7/9 AI Agent Workflow.

    Parameters
    ----------
    sensor_data : dict
        Keys: machine_speed, steam_pressure, stock_flow, moisture, ash, basis_weight, recipe, grade.

    Returns
    -------
    dict
        Unified JSON payload containing:
          - risk
          - prediction
          - llm_explanation
          - similar_cases
          - recommendations
          - explanation
    """
    initial_state: AgentState = {"sensor_data": sensor_data}

    if compiled_graph is not None:
        final_state = compiled_graph.invoke(initial_state)
    else:
        final_state = _fallback_pipeline_execution(sensor_data)

    pred_info = final_state.get("prediction", {})
    llm_text  = generate_copilot_explanation(final_state)

    return {
        "risk": pred_info.get("risk", 0.0),
        "prediction": pred_info.get("label", "Unknown"),
        "llm_explanation": llm_text,
        "sensor_data": sensor_data,
        "similar_cases": final_state.get("similar_cases", []),
        "recommendations": final_state.get("recommendations", {}),
        "explanation": final_state.get("explanation", {}),
        "workflow_engine": "LangGraph StateGraph v1.2.9" if LANGGRAPH_AVAILABLE else "Sequential DAG Runner"
    }


if __name__ == "__main__":
    sample_input = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0,
        "grade": "Standard"
    }

    result = run_workflow(sample_input)
    print("=" * 60)
    print("  Phase 7 LangGraph Workflow — Execution Test")
    print("=" * 60)
    print(f"Workflow Engine : {result['workflow_engine']}")
    print(f"Prediction      : {result['prediction']}")
    print(f"Risk            : {result['risk']}%")
    print(f"Similar Cases   : {len(result['similar_cases'])} cases found")
    print(f"Recommendations : {len(result['recommendations'].get('recommendations', []))} actions")
    print(f"SHAP Features   : {len(result['explanation'].get('feature_importance', []))} parameters analyzed")
    print("=" * 60)
