# -*- coding: utf-8 -*-
"""
rules.py
========
Paper Factory AI — Recommendation Engine Business Rules

Contains domain-specific operational rules that evaluate current sensor
readings and return targeted corrective actions for paper mill operators.
"""

from typing import List, Dict, Any


def evaluate_rules(sensor_data: Dict[str, Any], risk_pct: float) -> List[Dict[str, str]]:
    """
    Evaluate business rules against sensor readings and off-spec risk.

    Parameters
    ----------
    sensor_data : dict
        Keys expected:
            - machine_speed  (RPM)
            - steam_pressure (bar)
            - stock_flow     (L/min)
            - moisture       (%)
            - ash            (%)
            - basis_weight   (g/m²)
            - recipe         (str, optional)
    risk_pct : float
        Predicted off-spec risk percentage (0 to 100).

    Returns
    -------
    list of dict
        Each dict has keys:
            - action: str (e.g. "Reduce Steam Pressure by 0.2 bar")
            - reason: str (e.g. "Steam pressure exceeds the recommended threshold.")
    """
    recommendations = []

    speed = float(sensor_data.get("machine_speed", 0))
    steam = float(sensor_data.get("steam_pressure", 0))
    flow  = float(sensor_data.get("stock_flow", 0))
    moist = float(sensor_data.get("moisture", 0))
    ash   = float(sensor_data.get("ash", 0))
    bw    = float(sensor_data.get("basis_weight", 0))

    # Rule 1: Steam Pressure High (> 9.0 bar)
    if steam > 9.0:
        recommendations.append({
            "action": "Reduce Steam Pressure by 0.2 bar",
            "reason": f"Steam pressure ({steam:.1f} bar) exceeds optimal upper threshold of 9.0 bar."
        })
    # Rule 1b: Steam Pressure Low (< 8.0 bar)
    elif steam < 8.0 and steam > 0:
        recommendations.append({
            "action": "Increase Steam Pressure by 0.3 bar",
            "reason": f"Steam pressure ({steam:.1f} bar) is below minimum operating threshold of 8.0 bar."
        })

    # Rule 2: Machine Speed High (> 940 RPM or > 1500 RPM threshold)
    if speed > 940:
        recommendations.append({
            "action": "Reduce Machine Speed by 5%",
            "reason": f"Machine speed ({speed:.0f} RPM) exceeds high-speed stability threshold (940 RPM)."
        })

    # Rule 3: Moisture Low (< 4.8%)
    if moist < 4.8 and moist > 0:
        recommendations.append({
            "action": "Increase Stock Flow by 10 L/min",
            "reason": f"Moisture level ({moist:.1f}%) is below lower quality limit of 4.8%."
        })
    # Rule 3b: Moisture High (> 7.2%)
    elif moist > 7.2:
        recommendations.append({
            "action": "Reduce Stock Flow by 8 L/min",
            "reason": f"Moisture level ({moist:.1f}%) exceeds maximum quality limit of 7.2%."
        })

    # Rule 4: Basis Weight Low (< 76 g/m²)
    if bw < 76.0 and bw > 0:
        recommendations.append({
            "action": "Increase Stock Flow by 5 L/min",
            "reason": f"Basis weight ({bw:.1f} g/m²) is below standard quality specification (76 g/m²)."
        })
    # Rule 4b: Basis Weight High (> 84 g/m²)
    elif bw > 84.0:
        recommendations.append({
            "action": "Reduce Stock Flow by 5 L/min",
            "reason": f"Basis weight ({bw:.1f} g/m²) exceeds upper quality limit (84 g/m²)."
        })

    # Rule 5: Ash Content High (> 15%)
    if ash > 15.0:
        recommendations.append({
            "action": "Reduce Filler Addition Rate",
            "reason": f"Ash content ({ash:.1f}%) exceeds maximum recommended filler limit (15.0%)."
        })

    # Rule 6: High Overall Risk Fallback
    if risk_pct >= 70.0 and not recommendations:
        recommendations.append({
            "action": "Perform Operator Process Inspection",
            "reason": f"High off-spec risk ({risk_pct:.1f}%) detected despite parameter values being within standard bands."
        })

    return recommendations


def get_all_rules_metadata() -> List[Dict[str, Any]]:
    """Return documentation of all defined business rules in the engine."""
    return [
        {
            "id": "R001",
            "parameter": "Steam Pressure",
            "condition": "Steam Pressure > 9.0 bar",
            "recommendation": "Reduce Steam Pressure by 0.2 bar",
            "impact": "Lowers thermal drying excess and minimizes paper embrittlement."
        },
        {
            "id": "R002",
            "parameter": "Steam Pressure",
            "condition": "Steam Pressure < 8.0 bar",
            "recommendation": "Increase Steam Pressure by 0.3 bar",
            "impact": "Prevents incomplete drying and damp paper reels."
        },
        {
            "id": "R003",
            "parameter": "Machine Speed",
            "condition": "Machine Speed > 940 RPM",
            "recommendation": "Reduce Machine Speed by 5%",
            "impact": "Stabilizes wet-end sheet formation during recipe transitions."
        },
        {
            "id": "R004",
            "parameter": "Moisture",
            "condition": "Moisture < 4.8%",
            "recommendation": "Increase Stock Flow by 10 L/min",
            "impact": "Restores fiber hydration and basis weight equilibrium."
        },
        {
            "id": "R005",
            "parameter": "Moisture",
            "condition": "Moisture > 7.2%",
            "recommendation": "Reduce Stock Flow by 8 L/min",
            "impact": "Decreases wet mass entering dry section."
        },
        {
            "id": "R006",
            "parameter": "Basis Weight",
            "condition": "Basis Weight < 76 g/m² or > 84 g/m²",
            "recommendation": "Adjust Stock Flow",
            "impact": "Keeps paper thickness and mass within customer grade specs."
        },
        {
            "id": "R007",
            "parameter": "Ash Content",
            "condition": "Ash > 15.0%",
            "recommendation": "Reduce Filler Addition Rate",
            "impact": "Maintains structural paper tensile strength."
        }
    ]
