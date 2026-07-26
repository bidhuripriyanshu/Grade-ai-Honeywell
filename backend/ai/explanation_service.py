# -*- coding: utf-8 -*-
"""
explanation_service.py
======================
Paper Factory AI — Phase 9 Explanation Service

Coordinates prompt building and LLM client execution to produce the final
`llm_explanation` narrative for the operator copilot system.
"""

from typing import Dict, Any
from prompt_builder import build_copilot_prompt
from llm_client import generate_llm_explanation


def generate_copilot_explanation(state: Dict[str, Any]) -> str:
    """
    Main entry point for Phase 9 Conversational AI Copilot.

    Parameters
    ----------
    state : dict
        Unified agent state containing sensor_data, prediction, similar_cases,
        recommendations, and explanation (SHAP).

    Returns
    -------
    str
        Human-friendly narrative from Honeywell Paper Mill Engineer LLM.
    """
    sensor_data = state.get("sensor_data", {})
    prediction = state.get("prediction", {})
    similar_cases = state.get("similar_cases", [])
    recommendations = state.get("recommendations", {})
    explanation = state.get("explanation", {})

    shap_importance = explanation.get("feature_importance", [])

    prompt = build_copilot_prompt(
        sensor_data=sensor_data,
        prediction=prediction,
        similar_cases=similar_cases,
        recommendations=recommendations,
        shap_importance=shap_importance,
    )

    narrative = generate_llm_explanation(prompt, state)
    return narrative


if __name__ == "__main__":
    test_state = {
        "sensor_data": {
            "machine_speed": 950.0,
            "steam_pressure": 9.8,
            "stock_flow": 105.0,
            "moisture": 4.7,
            "ash": 12.0,
            "basis_weight": 80.0,
            "recipe": "Recipe A"
        },
        "prediction": {
            "risk": 99.95,
            "label": "Off Spec"
        },
        "similar_cases": [
            {
                "transition_id": 233,
                "similarity_pct": 98.2,
                "outcome": "Success",
                "operator_action": "Reduce Steam Pressure by 0.2 bar"
            }
        ],
        "recommendations": {
            "recommendations": [
                {"action": "Reduce Steam Pressure by 0.2 bar", "reason": "Steam pressure is high."},
                {"action": "Reduce Machine Speed by 5%", "reason": "Speed exceeds stability limit."}
            ]
        },
        "explanation": {
            "feature_importance": [
                {"feature": "Moisture", "impact": 72.8, "value": 4.7},
                {"feature": "Steam Pressure", "impact": 40.0, "value": 9.8}
            ]
        }
    }

    result_text = generate_copilot_explanation(test_state)
    print("=" * 60)
    print("  Phase 9 Conversational Copilot — Output Test")
    print("=" * 60)
    print(result_text)
    print("=" * 60)
