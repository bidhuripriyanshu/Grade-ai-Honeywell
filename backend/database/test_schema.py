# -*- coding: utf-8 -*-
"""
test_schema.py
==============
Paper Factory AI — Schema Inspector & Verification Utility
Inspects connected PostgreSQL / SQLite database tables, columns, and row counts.
"""

import os
import sys

# Ensure UTF-8 output encoding for Windows PowerShell
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# pyrefly: ignore [missing-import]
from sqlalchemy import inspect
from database.connection import engine
from database.init_db import init_database

def test_and_inspect_schema():
    print("=" * 65)
    print("  Paper Factory AI — Database Schema Inspection")
    print("=" * 65)

    # 1. Initialize tables & seed data if needed
    init_database()

    # 2. Inspect tables and column definitions
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    print(f"\n[+] Connected Engine Dialect : {engine.dialect.name.upper()}")
    print(f"[+] Found Tables ({len(table_names)})      : {', '.join(table_names)}\n")

    for table_name in table_names:
        print(f"+-- Table: {table_name}")
        columns = inspector.get_columns(table_name)
        for col in columns:
            col_name = col['name']
            col_type = col['type']
            col_null = "NULLABLE" if col.get('nullable') else "NOT NULL"
            col_pk   = " [PRIMARY KEY]" if col.get('primary_key') else ""
            print(f"|   +-- {col_name:<20} {str(col_type):<15} {col_null}{col_pk}")
        print("-" * 50)

    print("\n[+] Schema inspection completed successfully!")
    print("=" * 65)

if __name__ == "__main__":
    test_and_inspect_schema()
