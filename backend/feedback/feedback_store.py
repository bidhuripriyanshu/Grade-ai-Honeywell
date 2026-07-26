# -*- coding: utf-8 -*-
"""
feedback_store.py
=================
Paper Factory AI — Phase 10 Feedback Store (DB + JSON Hybrid)

Persists operator recommendation acceptance & rejection feedback in PostgreSQL / SQLite
relational database using SQLAlchemy ORM, with automatic JSON mirroring & fallback,
and calculates live AI Accuracy metrics.
"""

import os
import sys
import json
import threading
from datetime import datetime
from typing import Dict, Any, List

# Ensure project root is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from database.connection import engine, SessionLocal, Base
from database.models import FeedbackLogModel, TransitionLogModel
from database.init_db import init_database, SEED_FEEDBACK_LOGS

IS_VERCEL = "VERCEL" in os.environ or "AWS_LAMBDA_FUNCTION_NAME" in os.environ

if IS_VERCEL:
    DB_DIR  = "/tmp"
else:
    DB_DIR  = os.path.abspath(os.path.join(root_dir, "database"))
    try:
        os.makedirs(DB_DIR, exist_ok=True)
    except Exception:
        pass

DB_FILE = os.path.join(DB_DIR, "feedback_log.json")
_lock   = threading.Lock()

SEED_FEEDBACK_LOGS = [
    {"id": "FB-101", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 99.95, "action": "Reduce Steam Pressure by 0.2 bar", "timestamp": "2026-07-25T19:40:00Z"},
    {"id": "FB-102", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 98.20, "action": "Reduce Machine Speed by 5%", "timestamp": "2026-07-25T19:15:00Z"},
    {"id": "FB-103", "accepted": True,  "operator": "Shift Sup. A. Vance", "prediction": "Off Spec", "risk": 95.40, "action": "Increase Stock Flow by 10 L/min", "timestamp": "2026-07-25T18:50:00Z"},
    {"id": "FB-104", "accepted": False, "operator": "Shift Sup. A. Vance", "prediction": "Off Spec", "risk": 92.10, "action": "Adjust Filler Dosing", "timestamp": "2026-07-25T18:10:00Z"},
    {"id": "FB-105", "accepted": True,  "operator": "Operator M. Davis", "prediction": "Off Spec", "risk": 96.80, "action": "Reduce Steam Pressure by 0.3 bar", "timestamp": "2026-07-25T17:35:00Z"},
    {"id": "FB-106", "accepted": True,  "operator": "Operator M. Davis", "prediction": "Normal",   "risk": 15.20, "action": "Maintain Current Setpoints", "timestamp": "2026-07-25T16:45:00Z"},
    {"id": "FB-107", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 94.10, "action": "Reduce Machine Speed by 5%", "timestamp": "2026-07-25T16:00:00Z"},
    {"id": "FB-108", "accepted": True,  "operator": "Shift Sup. A. Vance", "prediction": "Off Spec", "risk": 91.50, "action": "Increase Stock Flow by 8 L/min", "timestamp": "2026-07-25T15:20:00Z"},
    {"id": "FB-109", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 93.00, "action": "Reduce Steam Pressure by 0.2 bar", "timestamp": "2026-07-25T14:40:00Z"},
    {"id": "FB-110", "accepted": False, "operator": "Operator M. Davis", "prediction": "Off Spec", "risk": 89.90, "action": "Increase Machine Speed", "timestamp": "2026-07-25T14:00:00Z"},
    {"id": "FB-111", "accepted": True,  "operator": "Shift Sup. A. Vance", "prediction": "Off Spec", "risk": 97.40, "action": "Reduce Steam Pressure by 0.2 bar", "timestamp": "2026-07-25T13:15:00Z"},
    {"id": "FB-112", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 96.10, "action": "Reduce Speed by 5%", "timestamp": "2026-07-25T12:30:00Z"},
    {"id": "FB-113", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Normal",   "risk": 22.00, "action": "Maintain Current Setpoints", "timestamp": "2026-07-25T11:45:00Z"},
    {"id": "FB-114", "accepted": True,  "operator": "Operator M. Davis", "prediction": "Off Spec", "risk": 95.00, "action": "Increase Stock Flow by 10 L/min", "timestamp": "2026-07-25T11:00:00Z"},
    {"id": "FB-115", "accepted": True,  "operator": "Shift Sup. A. Vance", "prediction": "Off Spec", "risk": 98.50, "action": "Reduce Steam Pressure by 0.2 bar", "timestamp": "2026-07-25T10:15:00Z"},
    {"id": "FB-116", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 94.80, "action": "Reduce Speed by 5%", "timestamp": "2026-07-25T09:30:00Z"},
    {"id": "FB-117", "accepted": True,  "operator": "Operator M. Davis", "prediction": "Off Spec", "risk": 93.70, "action": "Increase Stock Flow by 8 L/min", "timestamp": "2026-07-25T08:50:00Z"},
    {"id": "FB-118", "accepted": True,  "operator": "Shift Sup. A. Vance", "prediction": "Off Spec", "risk": 96.00, "action": "Reduce Steam Pressure by 0.3 bar", "timestamp": "2026-07-25T08:10:00Z"},
    {"id": "FB-119", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 99.10, "action": "Reduce Steam Pressure by 0.2 bar", "timestamp": "2026-07-25T07:25:00Z"},
    {"id": "FB-120", "accepted": True,  "operator": "Operator M. Davis", "prediction": "Off Spec", "risk": 92.40, "action": "Increase Stock Flow by 10 L/min", "timestamp": "2026-07-25T06:40:00Z"},
    {"id": "FB-121", "accepted": True,  "operator": "Shift Sup. A. Vance", "prediction": "Off Spec", "risk": 95.80, "action": "Reduce Speed by 5%", "timestamp": "2026-07-25T05:55:00Z"},
    {"id": "FB-122", "accepted": True,  "operator": "Operator J. Miller", "prediction": "Off Spec", "risk": 97.20, "action": "Reduce Steam Pressure by 0.2 bar", "timestamp": "2026-07-25T05:10:00Z"},
    {"id": "FB-123", "accepted": True,  "operator": "Operator M. Davis", "prediction": "Normal",   "risk": 18.50, "action": "Maintain Current Setpoints", "timestamp": "2026-07-25T04:25:00Z"}
]


def _ensure_db_initialized():
    """Ensure database tables exist and seed data is populated via database.init_db."""
    init_database()



def get_feedback_statistics() -> Dict[str, Any]:
    """
    Read feedback logs from DB (with JSON fallback) and calculate live AI Accuracy score.
    """
    _ensure_db_initialized()

    logs = []
    # Try fetching from DB
    try:
        db = SessionLocal()
        db_records = db.query(FeedbackLogModel).order_by(FeedbackLogModel.timestamp.desc()).all()
        logs = [r.to_dict() for r in db_records]
        db.close()
    except Exception as e:
        print(f"[DB Fallback] Fetching logs from JSON fallback due to: {e}")
        with _lock:
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    logs = json.load(f)
            except Exception:
                logs = SEED_FEEDBACK_LOGS

    if not logs:
        logs = SEED_FEEDBACK_LOGS

    total_count = len(logs)
    accepted_count = sum(1 for item in logs if item.get("accepted", False))
    rejected_count = total_count - accepted_count

    accuracy = round((accepted_count / total_count * 100), 1) if total_count > 0 else 91.0

    return {
        "ai_accuracy": accuracy,
        "total_feedback": total_count,
        "accepted_count": accepted_count,
        "rejected_count": rejected_count,
        "history": logs
    }


def save_operator_feedback(feedback_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save new operator feedback record into DB and JSON fallback.
    """
    _ensure_db_initialized()

    timestamp_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    # 1. Save to DB
    try:
        db = SessionLocal()
        total_records = db.query(FeedbackLogModel).count()
        new_id = f"FB-{total_records + 101}"

        db_entry = FeedbackLogModel(
            id=new_id,
            accepted=bool(feedback_data.get("accepted", True)),
            operator=str(feedback_data.get("operator", "Operator J. Miller")),
            prediction=str(feedback_data.get("prediction", "Off Spec")),
            risk=round(float(feedback_data.get("risk", 99.95)), 2),
            action=str(feedback_data.get("action", "Reduce Steam Pressure by 0.2 bar")),
            timestamp=timestamp_str
        )
        db.add(db_entry)
        db.commit()
        db.close()
    except Exception as e:
        print(f"[DB Save Warning] Saving to DB failed: {e}")

    # 2. Mirror to JSON File
    with _lock:
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                logs = json.load(f)
        except Exception:
            logs = SEED_FEEDBACK_LOGS

        new_json_id = f"FB-{len(logs) + 101}"
        new_entry = {
            "id": new_json_id,
            "accepted": bool(feedback_data.get("accepted", True)),
            "operator": str(feedback_data.get("operator", "Operator J. Miller")),
            "prediction": str(feedback_data.get("prediction", "Off Spec")),
            "risk": round(float(feedback_data.get("risk", 99.95)), 2),
            "action": str(feedback_data.get("action", "Reduce Steam Pressure by 0.2 bar")),
            "timestamp": timestamp_str
        }

        logs.insert(0, new_entry)
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2)

    return get_feedback_statistics()


if __name__ == "__main__":
    stats = get_feedback_statistics()
    print("=" * 50)
    print("  Phase 10 Feedback Store — DB Integration Test")
    print("=" * 50)
    print(f"AI Accuracy     : {stats['ai_accuracy']}%")
    print(f"Total Feedback  : {stats['total_feedback']}")
    print(f"Accepted        : {stats['accepted_count']}")
    print(f"Rejected        : {stats['rejected_count']}")
    print(f"Records Count   : {len(stats['history'])}")
    print("=" * 50)
