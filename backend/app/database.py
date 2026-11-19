import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.getenv("DATABASE_PATH", "homesos.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Table: professionals
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS professionals (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            skills TEXT NOT NULL,
            locality TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            rating REAL NOT NULL,
            completed_jobs INTEGER NOT NULL,
            response_time_min INTEGER NOT NULL,
            is_available INTEGER NOT NULL DEFAULT 1,
            price_range TEXT NOT NULL,
            profile_desc TEXT NOT NULL,
            avatar_url TEXT,
            phone TEXT NOT NULL,
            languages TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Table: service_requests
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS service_requests (
            id TEXT PRIMARY KEY,
            problem_description TEXT NOT NULL,
            raw_transcript TEXT,
            category TEXT NOT NULL,
            urgency TEXT NOT NULL,
            symptoms TEXT NOT NULL,
            safety_concerns TEXT,
            immediate_guidance TEXT,
            customer_location TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            preferred_time TEXT NOT NULL,
            estimated_complexity TEXT NOT NULL,
            technician_briefing TEXT NOT NULL,
            assigned_professional_id TEXT,
            status TEXT NOT NULL,
            price_estimate_min INTEGER NOT NULL,
            price_estimate_max INTEGER NOT NULL,
            final_amount INTEGER,
            timeline TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_professional_id) REFERENCES professionals (id)
        );
        """)
        conn.commit()
