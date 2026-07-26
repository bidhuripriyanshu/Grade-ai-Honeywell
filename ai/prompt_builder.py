# -*- coding: utf-8 -*-
"""
prompt_builder.py
=================
Paper Factory AI — Phase 9 Prompt Builder

Constructs contextual structured prompts for the Honeywell Process Engineer LLM.
"""

from typing import Dict, Any, List


def build_copilot_prompt(
    sensor_data: Dict[str, Any],
    prediction: Dict[str, Any],
    similar_cases: List[Dict[str, Any]],
    recommendations: Dict[str, Any],
    shap_importance: List[Dict[str, Any]]
) -> str:
    """
    Build a comprehensive, structured prompt combining outputs from Phases 3-6.
    """
    speed = sensor_data.get("machine_speed", 950.0)
    steam = sensor_data.get("steam_pressure", 9.8)
    flow  = sensor_data.get("stock_flow", 105.0)
    moist = sensor_data.get("moisture", 4.7)
    ash   = sensor_data.get("ash", 12.0)
    bw    = sensor_data.get("basis_weight", 80.0)
    recipe = sensor_data.get("recipe", "Recipe A")

    risk = prediction.get("risk", 50.0)
    label = prediction.get("label", "Off Spec")

    # Format top similar historical case
    top_case = similar_cases[0] if similar_cases else {}
    case_id = top_case.get("transition_id", "N/A")
    case_sim = top_case.get("similarity_pct", 95.0)
    case_res = top_case.get("outcome", "Success")
    case_act = top_case.get("operator_action", "Reduce Steam Pressure")

    # Format recommendations list
    recs_list = recommendations.get("recommendations", [])
    if recs_list:
        actions_str = "\n".join([f"- {r['action']}: {r['reason']}" for r in recs_list])
    else:
        actions_str = "- Maintain current operating parameters."

    # Format SHAP drivers
    if shap_importance:
        shap_str = "\n".join([f"- {item['feature']}: {item['impact']:+.1f}% (Value: {item.get('value', 'N/A')})" for item in shap_importance[:4]])
    else:
        shap_str = "- Parameters operating within normal bands."

    prompt = (
        "You are an experienced Honeywell Paper Machine Process Engineer.\n\n"
        "Analyze the following grade transition operational state:\n\n"
        f"Current Sensor Readings:\n"
        f"- Steam Pressure: {steam} bar\n"
        f"- Machine Speed: {speed} RPM\n"
        f"- Stock Flow: {flow} L/min\n"
        f"- Moisture: {moist}%\n"
        f"- Ash Content: {ash}%\n"
        f"- Basis Weight: {bw} g/m²\n"
        f"- Recipe: {recipe}\n\n"
        f"XGBoost Prediction:\n"
        f"- Off-Spec Risk: {risk:.1f}% ({label})\n\n"
        f"Top Similar Historical Case:\n"
        f"- Transition ID: #{case_id}\n"
        f"- Similarity: {case_sim}%\n"
        f"- Outcome: {case_res}\n"
        f"- Action Taken: {case_act}\n\n"
        f"Recommended Corrective Actions:\n{actions_str}\n\n"
        f"SHAP Risk Contributions:\n{shap_str}\n\n"
        "Instructions:\n"
        "Write a concise 3-4 sentence explanation for the plant machine operator:\n"
        "1. Mention how current conditions compare to the top similar historical transition.\n"
        "2. State why the risk score is at this level and highlight the primary SHAP drivers.\n"
        "3. Explain why the recommended actions will stabilize web quality and lower off-spec risk.\n"
        "Keep the explanation under 150 words in simple, confident engineering terms."
    )

    return prompt
