# -*- coding: utf-8 -*-
"""
explain_prediction.py
=====================
Paper Factory AI — Phase 6 SHAP Explainability & Plot Generator

Formats SHAP feature contribution breakdowns and generates plot artifacts
(horizontal bar chart, waterfall plot, and summary chart) saved in shap_plots/.
"""

import os
import sys
import numpy as np

try:
    import matplotlib
    matplotlib.use("Agg")  # Non-interactive backend for server generation
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False

from shap_analysis import calculate_shap_contributions

PLOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "shap_plots"))
if HAS_MATPLOTLIB:
    try:
        os.makedirs(PLOTS_DIR, exist_ok=True)
    except Exception:
        pass



def generate_shap_plots(analysis_result: dict) -> dict:
    if not HAS_MATPLOTLIB:
        return {"bar_plot": "", "waterfall_plot": "", "summary_plot": ""}
    feat_imp = analysis_result["feature_importance"]
    risk = analysis_result["risk"]
    base_risk = analysis_result["base_risk"]

    features = [item["feature"] for item in reversed(feat_imp)]
    impacts  = [item["impact"] for item in reversed(feat_imp)]

    # 1. Bar Plot (horizontal)
    plt.figure(figsize=(9, 5))
    colors = ["#e74c3c" if x >= 0 else "#2ecc71" for x in impacts]

    bars = plt.barh(features, impacts, color=colors, edgecolor="black", alpha=0.85)

    plt.axvline(0, color="#333333", linestyle="--", linewidth=1)
    plt.title(f"SHAP Feature Impact Breakdown (Off-Spec Risk = {risk}%)", fontsize=13, fontweight="bold", pad=15)
    plt.xlabel("Risk Contribution (Percentage Points)", fontsize=11)
    plt.grid(axis="x", linestyle=":", alpha=0.6)

    # Add text labels on bars
    for bar, imp in zip(bars, impacts):
        width = bar.get_width()
        offset = 0.5 if width >= 0 else -1.5
        label = f"+{imp:.1f}%" if imp >= 0 else f"{imp:.1f}%"
        plt.text(
            width + offset,
            bar.get_y() + bar.get_height() / 2,
            label,
            va="center",
            ha="left" if width >= 0 else "right",
            fontsize=9,
            fontweight="bold",
            color="#e74c3c" if imp >= 0 else "#27ae60"
        )

    plt.tight_layout()
    bar_path = os.path.join(PLOTS_DIR, "bar.png")
    plt.savefig(bar_path, dpi=200)
    plt.close()

    # 2. Waterfall Chart
    plt.figure(figsize=(9, 5.5))
    top_features = [item["feature"] for item in feat_imp]
    top_impacts  = [item["impact"] for item in feat_imp]
    top_values   = [str(item["value"]) for item in feat_imp]

    cumulative = base_risk
    waterfall_bars = []
    y_labels = ["Base Risk"] + [f"{f} ({v})" for f, v in zip(top_features, top_values)] + ["Final Risk"]

    # Plot base risk
    plt.barh("Base Risk", base_risk, color="#3498db", edgecolor="black", alpha=0.85)

    current = base_risk
    for f_name, imp, val in zip(top_features, top_impacts, top_values):
        label_str = f"{f_name} ({val})"
        c = "#e74c3c" if imp >= 0 else "#2ecc71"
        left_val = current if imp >= 0 else current + imp
        plt.barh(label_str, abs(imp), left=left_val, color=c, edgecolor="black", alpha=0.85)
        current += imp

    # Plot final risk
    plt.barh("Final Risk", current, color="#e67e22", edgecolor="black", alpha=0.85)

    plt.gca().invert_yaxis()
    plt.title(f"SHAP Waterfall Risk Breakdown: {base_risk}% → {risk}%", fontsize=13, fontweight="bold", pad=15)
    plt.xlabel("Off-Spec Risk Probability (%)", fontsize=11)
    plt.grid(axis="x", linestyle=":", alpha=0.6)
    plt.tight_layout()

    waterfall_path = os.path.join(PLOTS_DIR, "waterfall.png")
    plt.savefig(waterfall_path, dpi=200)
    plt.close()

    # 3. Summary Plot
    plt.figure(figsize=(9, 4.5))
    plt.barh(features, [abs(x) for x in impacts], color="#9b59b6", edgecolor="black", alpha=0.85)
    plt.title("Overall SHAP Absolute Impact Summary", fontsize=13, fontweight="bold", pad=15)
    plt.xlabel("Absolute Risk Contribution (|%|)", fontsize=11)
    plt.grid(axis="x", linestyle=":", alpha=0.6)
    plt.tight_layout()

    summary_path = os.path.join(PLOTS_DIR, "summary.png")
    plt.savefig(summary_path, dpi=200)
    plt.close()

    return {
        "bar": "/explain/plots/bar.png",
        "waterfall": "/explain/plots/waterfall.png",
        "summary": "/explain/plots/summary.png"
    }


def get_explainability_analysis(sensor_data: dict, generate_plots: bool = True) -> dict:
    """
    Generate complete SHAP explanation payload for API consumption.
    """
    analysis = calculate_shap_contributions(sensor_data)

    plot_urls = {}
    if generate_plots:
        plot_urls = generate_shap_plots(analysis)

    return {
        "prediction": analysis["prediction"],
        "risk": analysis["risk"],
        "base_risk": analysis["base_risk"],
        "feature_importance": [
            {
                "feature": item["feature"],
                "impact": item["impact"],
                "value": item["value"]
            }
            for item in analysis["feature_importance"]
        ],
        "plots": plot_urls
    }


if __name__ == "__main__":
    sample = {
        "machine_speed": 950.0,
        "steam_pressure": 9.8,
        "stock_flow": 105.0,
        "moisture": 4.7,
        "ash": 12.0,
        "recipe": "Recipe A",
        "basis_weight": 80.0
    }
    result = get_explainability_analysis(sample, generate_plots=True)
    print("=" * 60)
    print("  Phase 6 Explainability Engine — Sample Response Output")
    print("=" * 60)
    import json
    print(json.dumps(result, indent=2))
    print("=" * 60)
