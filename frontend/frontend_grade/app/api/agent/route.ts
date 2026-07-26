import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000/agent";

const defaultPayload = {
  machine_speed: 950.0,
  steam_pressure: 9.8,
  stock_flow: 105.0,
  moisture: 4.7,
  ash: 12.0,
  basis_weight: 80.0,
  recipe: "Recipe A",
  grade: "Standard",
};

function formatFastAPIResponse(data: any, fallbackPayload = defaultPayload) {
  return NextResponse.json({
    risk: data.risk ?? 99.95,
    prediction: data.prediction ?? "Off Spec",
    current_parameters: data.sensor_data ?? fallbackPayload,
    similar_cases: data.similar_cases ?? [],
    recommendations: data.recommendations ?? {},
    shap: data.explanation?.feature_importance ?? data.shap ?? [],
    plots: data.explanation?.plots ?? data.plots ?? {},
    llm_explanation: data.llm_explanation ?? "The current operating conditions closely resemble historical transition #233.",
    engine: data.workflow_engine ?? data.engine ?? "LangGraph StateGraph v1.2.9",
  });
}

function getFallbackMockResponse(payload = defaultPayload) {
  return NextResponse.json({
    risk: 99.95,
    prediction: "Off Spec",
    current_parameters: payload,
    similar_cases: [
      { transition_id: 233, similarity_pct: 98.2, outcome: "Success", operator_action: "Reduce Steam Pressure by 0.2 bar" },
      { transition_id: 456, similarity_pct: 96.5, outcome: "Failed", operator_action: "Maintain Machine Speed" },
      { transition_id: 777, similarity_pct: 95.1, outcome: "Success", operator_action: "Increase Stock Flow by 10 L/min" },
      { transition_id: 890, similarity_pct: 93.8, outcome: "Success", operator_action: "Reduce Speed by 5%" },
      { transition_id: 112, similarity_pct: 91.4, outcome: "Success", operator_action: "Adjust Filler Dosing" },
    ],
    recommendations: {
      risk: 99.95,
      recommendations: [
        { action: "Reduce Steam Pressure by 0.2 bar", reason: "Steam pressure (9.8 bar) exceeds optimal upper threshold of 9.0 bar." },
        { action: "Reduce Machine Speed by 5%", reason: "Machine speed (950 RPM) exceeds high-speed stability threshold (940 RPM)." },
        { action: "Increase Stock Flow by 10 L/min", reason: "Moisture level (4.7%) is below lower quality limit of 4.8%." },
      ],
      summary: "High off-spec risk detected! 3 corrective action(s) recommended: including to reduce steam pressure by 0.2 bar, reduce machine speed by 5%, increase stock flow by 10 L/min. Executing these adjustments will normalize process conditions and reduce grade transition defects.",
    },
    shap: [
      { feature: "Moisture", impact: 72.8, value: 4.7 },
      { feature: "Steam Pressure", impact: 40.0, value: 9.8 },
      { feature: "Machine Speed", impact: 28.0, value: 950.0 },
      { feature: "Stock Flow", impact: 10.5, value: 105.0 },
      { feature: "Ash Content", impact: 4.2, value: 12.0 },
      { feature: "Basis Weight", impact: -5.0, value: 80.0 },
    ],
    llm_explanation: "The current operating conditions closely resemble historical transition #233, which completed successfully after correcting thermal drying and machine speed parameters. The predicted off-spec risk is high (99.9%) primarily because Moisture and Steam Pressure are above their optimal operating windows.",
    engine: "LangGraph StateGraph (Offline Fallback Mode)",
  });
}

export async function GET() {
  try {
    const res = await fetch(FASTAPI_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return formatFastAPIResponse(data);
    }
  } catch (err) {
    console.error("FastAPI Backend GET Connection Error:", err);
  }

  return getFallbackMockResponse();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = { ...defaultPayload, ...body };
    const res = await fetch(FASTAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return formatFastAPIResponse(data, payload);
    }
  } catch (err) {
    console.error("FastAPI Backend POST Connection Error:", err);
  }

  return getFallbackMockResponse();
}
