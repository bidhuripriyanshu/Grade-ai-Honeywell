# -*- coding: utf-8 -*-
"""
prediction_agent.py
===================
Paper Factory AI — Phase 7 LangGraph Prediction Node

Invokes the XGBoost Off-Spec prediction model (model.pkl).
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models")))

# pyrefly: ignore [missing-import]
from predict import predict_sample
from state import AgentState


def prediction_agent_node(state: AgentState) -> AgentState:
    """
    LangGraph node: PredictionAgent
    Calculates off-spec risk probability and label using trained XGBoost model.
    """
    sensor_data = state.get("sensor_data", {})

    speed = float(sensor_data.get("machine_speed", 900.0))
    steam = float(sensor_data.get("steam_pressure", 9.5))
    flow  = float(sensor_data.get("stock_flow", 105.0))
    moist = float(sensor_data.get("moisture", 5.5))
    ash   = float(sensor_data.get("ash", 12.0))
    recipe = str(sensor_data.get("recipe", "Recipe A"))
    bw    = float(sensor_data.get("basis_weight", 80.0))

    pred_res = predict_sample(
        machine_speed=speed,
        steam_pressure=steam,
        stock_flow=flow,
        moisture=moist,
        ash=ash,
        recipe=recipe,
        basis_weight=bw,
    )

    state["prediction"] = {
        "risk": pred_res["risk_pct"],
        "label": pred_res["label"],
        "normal_pct": pred_res["normal_pct"],
    }

    return state
