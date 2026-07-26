# Paper Factory AI — Honeywell Grade Transition & Off-Spec Prevention

A full-stack industrial AI platform built for paper mill operators to optimize grade transitions, predict off-spec paper risks in real time, and get explainable setpoint recommendations.

---

## What Problem Does This Solve?

During paper grade transitions, operators have to adjust multiple interconnected machine setpoints—such as steam pressure, machine speed, moisture content, and stock flow. Small mistakes or delays lead to:
- High off-spec paper reel waste
- Thermal imbalance & paper web breaks
- Wasted energy and downtime

This system combines an **XGBoost risk model**, a **k-NN historical similarity search engine**, a **7-rule domain recommendation system**, **SHAP feature explainability**, and a **LangGraph multi-agent pipeline** to give operators instant, plain-English guidance during transitions.

---

## System Architecture

```
                  ┌──────────────────────────────────────────┐
                  │ Next.js 16 Dashboard (React 19 / TS)     │
                  └────────────────────┬─────────────────────┘
                                       │ REST / JSON API
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │ FastAPI Backend (Python 3.12 / Uvicorn)  │
                  └────────────────────┬─────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
   ┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
   │ XGBoost Model   │       │ k-NN Vector      │       │ Domain Rule      │
   │ Off-Spec Risk % │       │ Similarity Search│       │ Engine (7 Rules) │
   └────────┬────────┘       └────────┬─────────┘       └────────┬─────────┘
            │                         │                          │
            └─────────────────────────┼──────────────────────────┘
                                      │
                                      ▼
                  ┌──────────────────────────────────────────┐
                  │ LangGraph Orchestrator (4-Stage Pipeline)│
                  │  Predict -> History -> Rules -> SHAP     │
                  └────────────────────┬─────────────────────┘
                                       │
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │ Groq LLM (Llama-3.3-70B) / SHAP Plotter  │
                  └────────────────────┬─────────────────────┘
                                       │
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │ DB Layer: PostgreSQL / SQLite + JSON     │
                  └──────────────────────────────────────────┘
```

---

## Core Capabilities

### 1. Off-Spec Risk Prediction (`POST /predict`)
- Predicts whether current sensor readings will produce Normal or Off-Spec paper.
- Uses a trained XGBoost classifier over 7 key parameters: `Machine Speed`, `Steam Pressure`, `Stock Flow`, `Moisture`, `Ash`, `Recipe`, and `Basis Weight`.
- Includes an automatic serverless fallback risk estimator if binary `.pkl` model artifacts aren't cached locally.

### 2. Historical Transition Search (`POST /history/similar`)
- Searches past transition runs using k-NN vector matching with L2/Cosine distance.
- Displays the top-K most similar historical transitions, their outcome (Success vs. Off-Spec), the operator actions taken, and active alarms.
- Highlights warnings if higher steam pressure or machine speed caused off-spec paper in similar historical runs.

### 3. Operator Recommendation Engine (`POST /recommend`)
- Evaluates sensor parameters against 7 hardcoded paper mill operational rules (e.g. steam pressure limits >9.0 bar, moisture target <4.8%).
- Generates exact setpoint adjustment suggestions (e.g. *"Reduce Steam Pressure by 0.2 bar"*, *"Reduce Speed by 5%"*).
- Uses Groq (`llama-3.3-70b-versatile`) or Gemini to write a 2-3 sentence summary explaining *why* the changes will stabilize the sheet. Fallback offline narrative generators kick in if no API keys are configured.

### 4. SHAP Feature Explainability (`POST /explain`)
- Breaks down the exact percentage contribution of each sensor parameter to the overall off-spec risk.
- Renders 3 Matplotlib chart images on demand:
  - **Bar Plot**: Relative risk contribution per parameter.
  - **Waterfall Chart**: Risk trajectory from base risk (25.04%) up to final predicted risk.
  - **Summary Chart**: Absolute feature impact ranking.
- Images are served via `GET /explain/plots/{plot_name}.png`.

### 5. LangGraph Multi-Agent System (`POST /agent`)
- Runs a 4-node `StateGraph` pipeline that executes all components in sequence:
  1. `PredictionAgent` (calculates risk)
  2. `HistoryAgent` (fetches similar cases)
  3. `RecommendationAgent` (evaluates rules & calls LLM)
  4. `ExplanationAgent` (computes SHAP impact)
- Returns a single unified JSON payload. Node & edge graph topology metadata can be queried via `GET /agent/graph`.

### 6. Closed-Loop Operator Feedback (`POST /feedback`)
- Allows operators to accept or reject recommended setpoint actions directly from the dashboard.
- Stores audit history in PostgreSQL (or local SQLite / JSON backup).
- Computes real-time AI accuracy statistics (`GET /feedback/stats`), maintaining a baseline score above 91%.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS + Tailwind
- **Backend API**: FastAPI, Uvicorn, Pydantic v2, Python 3.12
- **Machine Learning & Stats**: XGBoost, Scikit-learn, Joblib, NumPy
- **Agent Framework**: LangGraph (`StateGraph`)
- **Explainability**: SHAP, Matplotlib (`Agg` non-interactive backend)
- **LLM Integrations**: Groq API (`llama-3.3-70b-versatile`), Google Gemini
- **Database & Persistence**: SQLAlchemy ORM with PostgreSQL / SQLite (`paper_mill.db`) + JSON fallback
- **Deployment**: Vercel Serverless Function (`api/main.py`)

---

## Project Layout

```
Grade-paper-ai/
├── backend/
│   ├── api/
│   │   ├── main.py               # FastAPI entry point & CORS configuration
│   │   ├── agent.py              # /agent endpoints (LangGraph workflow)
│   │   ├── explain.py            # /explain endpoints (SHAP analysis & plot server)
│   │   ├── feedback.py           # /feedback endpoints (Operator feedback tracking)
│   │   ├── history.py            # /history endpoints (Similarity search)
│   │   └── recommend.py          # /recommend endpoints (Rules & LLM advice)
│   ├── agents/
│   │   ├── workflow.py           # LangGraph StateGraph DAG orchestrator
│   │   ├── prediction_agent.py   # Stage 1 agent
│   │   ├── history_agent.py      # Stage 2 agent
│   │   ├── recommendation_agent.py # Stage 3 agent
│   │   └── explanation_agent.py  # Stage 4 agent
│   ├── database/
│   │   ├── connection.py         # DB connection & session factory (PostgreSQL/SQLite)
│   │   ├── models.py             # SQLAlchemy ORM schemas
│   │   └── init_db.py            # Schema creation & initial seeder
│   ├── explainability/
│   │   ├── explain_prediction.py # SHAP calculation & plot generation logic
│   │   └── shap_analysis.py      # SHAP impact math
│   ├── models/
│   │   ├── model.pkl             # Trained XGBoost model file
│   │   ├── label_encoder.pkl     # Recipe label encoder
│   │   └── predict.py            # ML inference function + fallback
│   ├── recommendation/
│   │   ├── recommendation_engine.py # Rule evaluation + LLM prompt builder
│   │   └── rules.py              # Operational rule definitions
│   ├── similarity/
│   │   ├── search.py             # k-NN similarity search engine
│   │   ├── nn_index.pkl          # Nearest neighbor index file
│   │   ├── scaler.pkl            # Feature scaler file
│   │   └── encoders.pkl          # Categorical encoders
│   └── test_full_backend_integration.py # Master backend integration test suite
├── frontend/                     # Next.js 16 Web Dashboard
├── ai/                           # Groq & LLM client helpers
├── vercel.json                   # Vercel deployment config
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Set Up the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the dev server
uvicorn api.main:app --reload --port 8000
```

The API docs (Swagger UI) will be available at `http://localhost:8000/docs`.

### 2. Set Up the Frontend

```bash
cd frontend

# Install packages
npm install

# Start Next.js dev server
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check endpoint |
| `POST` | `/predict` | Predict off-spec risk % using XGBoost |
| `GET` | `/model-info` | Get model metadata and valid recipe names |
| `POST` | `/history/similar` | Run k-NN search for top-K historical transitions |
| `GET` | `/history/grades` | Get list of supported paper grades |
| `GET` | `/history/recipes` | Get list of supported recipe codes |
| `POST` | `/recommend` | Run rule engine & get LLM operator advice |
| `GET` | `/recommend/rules` | Return list of all 7 operational rules |
| `POST` | `/explain` | Compute SHAP feature contributions |
| `GET` | `/explain/plots/{name}` | Get generated SHAP PNG charts (`bar.png`, `waterfall.png`) |
| `POST` | `/agent` | Execute full 4-stage LangGraph agent workflow |
| `GET` | `/agent/graph` | Get LangGraph node & edge structure |
| `GET` | `/feedback/stats` | Get operator feedback history & live AI accuracy % |
| `POST` | `/feedback` | Submit operator accept/reject feedback |

---

## Running Tests

To verify that all 14 API endpoints are working:

```bash
cd backend
python test_full_backend_integration.py
```

Expected output:
```
======================================================================
  Paper Factory AI -- Full Backend Integration & Deployment Test
======================================================================
  [PASS] GET / (Health Check)
  [PASS] POST /predict (Risk Prediction)
  [PASS] GET /model-info (Model Metadata)
  [PASS] POST /history/similar (Similarity Search)
  [PASS] GET /history/grades (Valid Grades)
  [PASS] GET /history/recipes (Valid Recipes)
  [PASS] POST /recommend (Recommendation Engine)
  [PASS] GET /recommend/rules (Business Rules)
  [PASS] POST /explain (SHAP Analysis)
  [PASS] GET /explain/plots/bar.png (SHAP Plot PNG)
  [PASS] POST /agent (LangGraph AI Agent)
  [PASS] GET /agent/graph (Graph Topology)
  [PASS] GET /feedback/stats (AI Accuracy Stats)
  [PASS] POST /feedback (Save Operator Action)
======================================================================
  Integration Test Summary: 14/14 Endpoints PASSED
======================================================================
```

---

## Environment Variables (Optional)

If you want to enable Groq LLM explanations or PostgreSQL integration, set the following environment variables (or put them in `backend/.env`):

```ini
# Database (defaults to local SQLite /tmp/paper_mill.db if omitted)
DATABASE_URL=postgresql://user:password@localhost:5432/paper_mill

# Groq LLM Keys (optional, system uses offline process engineer fallback if omitted)
GROQ_API_KEY_1=gsk_...
GROQ_API_KEY_2=gsk_...

```

---

## License

Internal Honeywell Industrial Copilot Platform project.
