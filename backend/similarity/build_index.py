# -*- coding: utf-8 -*-
"""
build_index.py
==============
Historical Similarity Search - Index Builder

What this does:
  1. Loads the full historical dataset (50,000 rows)
  2. Encodes categorical columns (Recipe, Grade)
  3. Normalises all numerical features with StandardScaler
  4. Builds a sklearn NearestNeighbors index (fast cosine similarity)
  5. Saves everything needed for search.py:
       similarity/nn_index.pkl      - the trained NearestNeighbors model
       similarity/scaler.pkl        - the fitted StandardScaler
       similarity/encoders.pkl      - label encoders for Recipe + Grade
       similarity/historical_df.pkl - clean dataframe for result lookup

Run from backend/ folder:
    python similarity/build_index.py
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder, StandardScaler, normalize
from sklearn.neighbors import NearestNeighbors

# ─────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
CSV_PATH     = os.path.join(BASE_DIR, "..", "dataset", "fake_factory_data.csv")
OUT_DIR      = BASE_DIR   # save into similarity/

INDEX_PATH   = os.path.join(OUT_DIR, "nn_index.pkl")
SCALER_PATH  = os.path.join(OUT_DIR, "scaler.pkl")
ENC_PATH     = os.path.join(OUT_DIR, "encoders.pkl")
DF_PATH      = os.path.join(OUT_DIR, "historical_df.pkl")

# ─────────────────────────────────────────────
# Feature columns used for similarity matching
# ─────────────────────────────────────────────
NUM_COLS = [
    "Machine Speed",
    "Steam Pressure",
    "Stock Flow",
    "Moisture",
    "Ash",
    "Basis Weight",
]
CAT_COLS = ["Recipe", "Grade"]   # encoded to integers

OUTCOME_COL       = "Off Spec"         # Yes / No
ACTION_COL        = "Operator Action"
ALARM_COL         = "Alarm"


def build():
    print("=" * 58)
    print("  Historical Similarity Index Builder")
    print("=" * 58)

    # ── 1. Load ───────────────────────────────────────────────
    df = pd.read_csv(CSV_PATH)
    print(f"\n[OK] Loaded {len(df):,} rows, {len(df.columns)} columns")

    # ── 2. Keep needed columns, drop rows with nulls ──────────
    keep = NUM_COLS + CAT_COLS + [OUTCOME_COL, ACTION_COL, ALARM_COL]
    # Add Timestamp if present (for display)
    if "Timestamp" in df.columns:
        keep = ["Timestamp"] + keep
    df = df[keep].dropna().reset_index(drop=True)
    print(f"[OK] After cleaning: {len(df):,} rows")

    # ── 3. Encode categorical columns ─────────────────────────
    encoders = {}
    for col in CAT_COLS:
        enc = LabelEncoder()
        df[f"{col}_enc"] = enc.fit_transform(df[col].astype(str))
        encoders[col] = enc
        classes = list(enc.classes_)
        print(f"[OK] {col} encoded: {classes}")

    # ── 4. Build feature matrix ───────────────────────────────
    feature_cols = NUM_COLS + [f"{c}_enc" for c in CAT_COLS]
    X = df[feature_cols].values.astype(float)

    # ── 5. Scale + L2-normalise ───────────────────────────────
    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_norm   = normalize(X_scaled, norm="l2")   # cosine via euclidean on unit vecs

    # ── 6. Fit NearestNeighbors ───────────────────────────────
    # metric='euclidean' on L2-normalised vectors == cosine similarity
    nn = NearestNeighbors(n_neighbors=10, metric="euclidean", algorithm="auto")
    nn.fit(X_norm)
    print(f"[OK] NearestNeighbors index built on {len(X_norm):,} vectors")

    # ── 7. Save everything ────────────────────────────────────
    joblib.dump(nn,       INDEX_PATH)
    joblib.dump(scaler,   SCALER_PATH)
    joblib.dump(encoders, ENC_PATH)
    df.to_pickle(DF_PATH)

    print(f"\n[SAVED] nn_index.pkl      -> {INDEX_PATH}")
    print(f"[SAVED] scaler.pkl        -> {SCALER_PATH}")
    print(f"[SAVED] encoders.pkl      -> {ENC_PATH}")
    print(f"[SAVED] historical_df.pkl -> {DF_PATH}")
    print("\n[DONE] Index ready. Run search.py to test similarity search.")
    print("=" * 58)


if __name__ == "__main__":
    build()
