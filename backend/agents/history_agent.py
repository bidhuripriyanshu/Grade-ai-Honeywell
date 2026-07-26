# -*- coding: utf-8 -*-
"""
history_agent.py
================
Paper Factory AI — Phase 7 LangGraph History Node

Invokes historical similarity search engine (similarity/search.py) to find
top-K matching past process transitions.
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "similarity")))

# pyrefly: ignore [missing-import]
from search import find_similar_cases
from state import AgentState


def history_agent_node(state: AgentState) -> AgentState:
    """
    LangGraph node: HistoryAgent
    Finds top 5 similar historical process transitions.
    """
    sensor_data = state.get("sensor_data", {})

    speed = float(sensor_data.get("machine_speed", 900.0))
    steam = float(sensor_data.get("steam_pressure", 9.5))
    flow  = float(sensor_data.get("stock_flow", 105.0))
    moist = float(sensor_data.get("moisture", 5.5))
    ash   = float(sensor_data.get("ash", 12.0))
    bw    = float(sensor_data.get("basis_weight", 80.0))
    recipe = str(sensor_data.get("recipe", "Recipe A"))
    grade  = str(sensor_data.get("grade", "Standard"))

    try:
        search_res = find_similar_cases(
            machine_speed=speed,
            steam_pressure=steam,
            stock_flow=flow,
            moisture=moist,
            ash=ash,
            basis_weight=bw,
            recipe=recipe,
            grade=grade,
            top_k=5,
        )
        state["similar_cases"] = search_res.get("similar_cases", [])
    except Exception as e:
        state["similar_cases"] = []
        state["error"] = f"HistoryAgent warning: {str(e)}"

    return state
