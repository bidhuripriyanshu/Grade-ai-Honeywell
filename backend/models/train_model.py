# -*- coding: utf-8 -*-
"""
train_model.py
==============
Paper Factory Off-Spec Prediction - XGBoost Training Script

Steps performed:
  1. Load dataset
  2. Select features & target
  3. Encode categorical 'Recipe' column
  4. Split into train / test sets (80 / 20)
  5. Train XGBoost classifier
  6. Evaluate accuracy + risk probabilities
  7. Save model.pkl and label_encoder.pkl
"""

import os
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
# pyrefly: ignore [missing-import]
from xgboost import XGBClassifier

# ─────────────────────────────────────────────
# Step 1 — Load Dataset
# ─────────────────────────────────────────────
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "fake_factory_data.csv")

print("=" * 55)
print("  Paper Factory Off-Spec Prediction — Training")
print("=" * 55)

df = pd.read_csv(CSV_PATH)

print(f"\n[OK] Dataset loaded  ->  {len(df):,} rows, {len(df.columns)} columns")
print("\nFirst 5 rows:")
print(df.head())

# ─────────────────────────────────────────────
# Step 2 — Select Features & Target
# ─────────────────────────────────────────────
FEATURE_COLS = [
    "Machine Speed",
    "Steam Pressure",
    "Stock Flow",
    "Moisture",
    "Ash",
    "Recipe",
    "Basis Weight",
]
TARGET_COL = "Off Spec"

# Keep only the columns we need
df = df[FEATURE_COLS + [TARGET_COL]].copy()

# ─────────────────────────────────────────────
# Step 3 — Encode Target (Yes/No → 1/0)
# ─────────────────────────────────────────────
df[TARGET_COL] = df[TARGET_COL].map({"Yes": 1, "No": 0})

# Drop any rows where mapping failed (shouldn't happen, but safe guard)
df.dropna(subset=[TARGET_COL], inplace=True)
df[TARGET_COL] = df[TARGET_COL].astype(int)

print(f"\nTarget distribution:\n{df[TARGET_COL].value_counts().rename({0: 'Normal (0)', 1: 'Off-Spec (1)'})}")

X = df[FEATURE_COLS].copy()
y = df[TARGET_COL]

# ─────────────────────────────────────────────
# Step 4 — Encode Categorical 'Recipe' Column
# ─────────────────────────────────────────────
encoder = LabelEncoder()
X["Recipe"] = encoder.fit_transform(X["Recipe"])

print(f"\nRecipe encoding: {dict(zip(encoder.classes_, encoder.transform(encoder.classes_)))}")

# ─────────────────────────────────────────────
# Step 5 — Train / Test Split  (80 / 20)
# ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\nTrain size : {len(X_train):,} samples")
print(f"Test  size : {len(X_test):,} samples")

# ─────────────────────────────────────────────
# Step 6 — Train XGBoost Classifier
# ─────────────────────────────────────────────
print("\n[...] Training XGBoost model ...")

model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    use_label_encoder=False,
    eval_metric="logloss",
    random_state=42,
)

model.fit(X_train, y_train)
print("[OK] Training complete!")

# ─────────────────────────────────────────────
# Step 7 — Evaluate Accuracy
# ─────────────────────────────────────────────
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"\nAccuracy : {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, predictions, target_names=["Normal", "Off-Spec"]))

# ─────────────────────────────────────────────
# Step 8 — Risk Probability Preview
# ─────────────────────────────────────────────
risk_proba = model.predict_proba(X_test[:5])
print("Risk probabilities for first 5 test samples:")
print("  [Normal%  Off-Spec%]")
for i, row in enumerate(risk_proba):
    print(f"  Sample {i+1}: Normal={row[0]*100:.1f}%  Off-Spec={row[1]*100:.1f}%")

# ─────────────────────────────────────────────
# Step 9 — Save Model + Encoder
# ─────────────────────────────────────────────
MODEL_DIR  = os.path.dirname(__file__)
MODEL_PATH   = os.path.join(MODEL_DIR, "model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

joblib.dump(model,   MODEL_PATH)
joblib.dump(encoder, ENCODER_PATH)

print(f"\n[SAVED] Model   -> {MODEL_PATH}")
print(f"[SAVED] Encoder -> {ENCODER_PATH}")
print("\n[DONE] All done! Ready to run predict.py or start the API.")
print("=" * 55)
