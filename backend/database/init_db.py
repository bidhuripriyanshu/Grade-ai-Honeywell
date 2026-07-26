# -*- coding: utf-8 -*-
"""
init_db.py
==========
Paper Factory AI — Database Initializer & Seeder Module
Located inside f:\\Grade-paper-ai\\database
"""

import os
import sys
import json
import threading

# Ensure project root is in sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from database.connection import engine, SessionLocal, Base
from database.models import FeedbackLogModel, TransitionLogModel

DB_DIR  = os.path.abspath(os.path.dirname(__file__))
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

def init_database():
    """Initializes tables and seeds initial data into PostgreSQL / SQLite."""
    os.makedirs(DB_DIR, exist_ok=True)
    
    # 1. Create tables
    try:
        Base.metadata.create_all(bind=engine)
        print("[Database] Schema tables initialized.")
    except Exception as e:
        print(f"[Database Warning] Table creation failed: {e}")

    # 2. Seed database
    try:
        db = SessionLocal()
        count = db.query(FeedbackLogModel).count()
        if count == 0:
            for seed in SEED_FEEDBACK_LOGS:
                db_item = FeedbackLogModel(
                    id=seed["id"],
                    accepted=seed["accepted"],
                    operator=seed["operator"],
                    prediction=seed["prediction"],
                    risk=seed["risk"],
                    action=seed["action"],
                    timestamp=seed["timestamp"]
                )
                db.add(db_item)
            db.commit()
            print(f"[Database] Seeded {len(SEED_FEEDBACK_LOGS)} baseline records.")
        db.close()
    except Exception as e:
        print(f"[Database Warning] Seeding failed: {e}")

    # 3. Mirror JSON backup file
    if not os.path.isfile(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(SEED_FEEDBACK_LOGS, f, indent=2)

if __name__ == "__main__":
    init_database()
