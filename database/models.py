# -*- coding: utf-8 -*-
"""
models.py
=========
Paper Factory AI — SQLAlchemy ORM Models for Relational DB Schema
Located inside f:\\Grade-paper-ai\\database
"""

from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text
# pyrefly: ignore [missing-import]
from database.connection import Base

class FeedbackLogModel(Base):
    """
    Operator recommendation feedback table storing accept/reject choices,
    prediction state, and risk scores.
    """
    __tablename__ = "feedback_logs"

    id = Column(String(50), primary_key=True, index=True)
    accepted = Column(Boolean, nullable=False, default=True)
    operator = Column(String(100), nullable=False, default="Operator J. Miller")
    prediction = Column(String(50), nullable=False, default="Off Spec")
    risk = Column(Float, nullable=False, default=99.95)
    action = Column(String(255), nullable=False)
    timestamp = Column(String(50), nullable=False, default=lambda: datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"))

    def to_dict(self):
        return {
            "id": self.id,
            "accepted": self.accepted,
            "operator": self.operator,
            "prediction": self.prediction,
            "risk": self.risk,
            "action": self.action,
            "timestamp": self.timestamp
        }

class TransitionLogModel(Base):
    """
    Grade transition events log table for audit trails and trajectory analytics.
    """
    __tablename__ = "transition_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transition_code = Column(String(50), nullable=False, default="A -> B")
    recipe_from = Column(String(50), nullable=False, default="Recipe A")
    recipe_to = Column(String(50), nullable=False, default="Recipe B")
    status = Column(String(50), nullable=False, default="active")
    off_spec_risk = Column(Float, nullable=False, default=99.95)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "transition_code": self.transition_code,
            "recipe_from": self.recipe_from,
            "recipe_to": self.recipe_to,
            "status": self.status,
            "off_spec_risk": self.off_spec_risk,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
