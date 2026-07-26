# -*- coding: utf-8 -*-
"""
connection.py
=============
Paper Factory AI — Database Connection & Session Management

All database assets live inside f:\\Grade-paper-ai\\database.
Supports PostgreSQL via DATABASE_URL environment variable,
with automatic fallback to local SQLite (database/paper_mill.db).
"""

import os
import logging
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from database/.env, backend/.env, or root .env
DB_DIR = os.path.abspath(os.path.dirname(__file__))
os.makedirs(DB_DIR, exist_ok=True)
ROOT_DIR = os.path.abspath(os.path.join(DB_DIR, ".."))

load_dotenv(os.path.join(DB_DIR, ".env"))
load_dotenv(os.path.join(ROOT_DIR, "backend", ".env"))
load_dotenv(os.path.join(ROOT_DIR, ".env"))

logger = logging.getLogger("database")


# Default SQLite database path inside database/ folder
DEFAULT_SQLITE_PATH = os.path.join(DB_DIR, "paper_mill.db")
DEFAULT_SQLITE_URL  = f"sqlite:///{DEFAULT_SQLITE_PATH}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        echo=False
    )
    with engine.connect() as conn:
        pass
    logger.info(f"Database engine initialized using URL: {DATABASE_URL.split('@')[-1]}")
except Exception as e:
    logger.warning(f"Primary DATABASE_URL failed ({e}). Falling back to local SQLite at {DEFAULT_SQLITE_PATH}.")
    DATABASE_URL = DEFAULT_SQLITE_URL
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI Dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
