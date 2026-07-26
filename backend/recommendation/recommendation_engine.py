# -*- coding: utf-8 -*-
"""
recommendation_engine.py
========================
Paper Factory AI — Phase 5 Recommendation Engine

Connects domain rules with an LLM (Honeywell Paper Mill Engineer persona)
to turn machine risk predictions into clear operator recommendations
and plain-language explanations.
"""

import os
from typing import Dict, Any, List
from rules import evaluate_rules


def _call_llm_explanation(
    sensor_data: Dict[str, Any],
    risk_pct: float,
    recommendations: List[Dict[str, str]]
) -> str:
    """
    Attempt to generate a natural language explanation using an LLM API
    (Gemini, OpenAI, or Groq) if an API key is available.

    Falls back gracefully if no API key is provided or network is unavailable.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    groq_key   = os.getenv("GROQ_API_KEY")

    prompt = (
        "You are an experienced Honeywell Paper Mill Engineer advising a mill operator.\n\n"
        f"Current Sensor Readings:\n"
        f"- Steam Pressure: {sensor_data.get('steam_pressure')} bar\n"
        f"- Machine Speed: {sensor_data.get('machine_speed')} RPM\n"
        f"- Moisture: {sensor_data.get('moisture')}%\n"
        f"- Stock Flow: {sensor_data.get('stock_flow')} L/min\n"
        f"- Ash: {sensor_data.get('ash')}%\n"
        f"- Basis Weight: {sensor_data.get('basis_weight')} g/m²\n"
        f"- Recipe: {sensor_data.get('recipe', 'Standard')}\n"
        f"- Off-Spec Risk: {risk_pct:.1f}%\n\n"
        "Identified Recommended Actions:\n"
    )

    if recommendations:
        for r in recommendations:
            prompt += f"- {r['action']}: {r['reason']}\n"
    else:
        prompt += "- Maintain current parameters. All values are within normal operating ranges.\n"

    prompt += (
        "\nTask: Explain these corrective actions in 2-3 clear, professional sentences for the operator. "
        "Explain WHY these adjustments will stabilize the process and prevent off-spec paper."
    )

    # 1. Try Gemini
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            resp = model.generate_content(prompt)
            if resp and resp.text:
                return resp.text.strip()
        except Exception:
            pass

    # 2. Try OpenAI
    if openai_key:
        try:
            # pyrefly: ignore [missing-import]
            import openai
            client = openai.OpenAI(api_key=openai_key)
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a Honeywell Paper Mill Process Engineer."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200
            )
            return completion.choices[0].message.content.strip()
        except Exception:
            pass

    # 3. Fallback rule-synthesizer generator (Runs offline seamlessly)
    return _generate_fallback_summary(sensor_data, risk_pct, recommendations)


def _generate_fallback_summary(
    sensor_data: Dict[str, Any],
    risk_pct: float,
    recommendations: List[Dict[str, str]]
) -> str:
    """
    Generate a high-quality human explanation when LLM API keys are not present.
    """
    if not recommendations:
        if risk_pct < 30.0:
            return (
                f"The current process parameters are running within optimal operating windows with a low "
                f"off-spec risk of {risk_pct:.1f}%. Continue current operation without manual intervention."
            )
        else:
            return (
                f"The off-spec risk is estimated at {risk_pct:.1f}%. Current sensor parameters are within "
                f"standard operating bands, but operators should monitor moisture and steam stability."
            )

    actions_text = ", ".join([r["action"].lower() for r in recommendations])
    count = len(recommendations)

    if risk_pct >= 70.0:
        summary = (
            f"High off-spec risk ({risk_pct:.1f}%) detected! {count} corrective action(s) recommended: "
            f"including to {actions_text}. "
            f"Executing these adjustments will normalize process conditions and reduce grade transition defects."
        )
    else:
        summary = (
            f"Moderate risk level ({risk_pct:.1f}%). To optimize sheet uniformity and prevent off-spec output, "
            f"the operator should {actions_text} according to Honeywell paper mill operational procedures."
        )

    return summary


def get_recommendations(
    sensor_data: Dict[str, Any],
    risk_pct: float,
    use_llm: bool = True
) -> Dict[str, Any]:
    """
    Main entry point for Phase 5 Recommendation Engine.

    Parameters
    ----------
    sensor_data : dict
        Current machine sensor values.
    risk_pct : float
        XGBoost predicted off-spec risk (0-100).
    use_llm : bool, optional
        Whether to generate LLM explanation (default True).

    Returns
    -------
    dict matching API response schema:
        {
          "risk": float,
          "recommendations": [
             {"action": str, "reason": str}, ...
          ],
          "summary": str
        }
    """
    recs = evaluate_rules(sensor_data, risk_pct)

    if use_llm:
        summary = _call_llm_explanation(sensor_data, risk_pct, recs)
    else:
        summary = _generate_fallback_summary(sensor_data, risk_pct, recs)

    return {
        "risk": round(float(risk_pct), 2),
        "recommendations": recs,
        "summary": summary
    }


# ─────────────────────────────────────────────
# Quick test when run directly
# ─────────────────────────────────────────────
if __name__ == "__main__":
    test_sample = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0
    }
    test_risk = 92.5

    result = get_recommendations(test_sample, test_risk)
    print("=" * 60)
    print("  Phase 5 Recommendation Engine — Test Output")
    print("=" * 60)
    print(f"Risk        : {result['risk']}%")
    print(f"Summary     : {result['summary']}")
    print("Actions     :")
    for r in result["recommendations"]:
        print(f"  - Action : {r['action']}")
        print(f"    Reason : {r['reason']}")
    print("=" * 60)
