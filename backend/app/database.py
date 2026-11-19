import sqlite3
import os
from contextlib import contextmanager
from .auth_util import hash_password

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

def migrate_schema(conn):
    """Safely migrate tables without dropping existing data."""
    cursor = conn.cursor()

    # Check columns in service_requests
    cursor.execute("PRAGMA table_info(service_requests);")
    existing_cols = [row["name"] for row in cursor.fetchall()]

    if "customer_id" not in existing_cols:
        cursor.execute("ALTER TABLE service_requests ADD COLUMN customer_id TEXT DEFAULT 'user-demo';")
    if "images" not in existing_cols:
        cursor.execute("ALTER TABLE service_requests ADD COLUMN images TEXT DEFAULT '[]';")
    if "image_analysis" not in existing_cols:
        cursor.execute("ALTER TABLE service_requests ADD COLUMN image_analysis TEXT;")

    conn.commit()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Table: users (Customer accounts)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            locality TEXT NOT NULL DEFAULT 'BTM Layout',
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

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
            customer_id TEXT DEFAULT 'user-demo',
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
            images TEXT NOT NULL DEFAULT '[]',
            image_analysis TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES users (id),
            FOREIGN KEY (assigned_professional_id) REFERENCES professionals (id)
        );
        """)
        conn.commit()

        # Run non-destructive column migrations
        migrate_schema(conn)

        # Seed default customer account if empty
        cursor.execute("SELECT count(*) as cnt FROM users WHERE email = 'priya@example.com';")
        if cursor.fetchone()["cnt"] == 0:
            cursor.execute("""
            INSERT INTO users (id, name, email, phone, password_hash, locality, address)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (
                "user-demo",
                "Priya Sharma",
                "priya@example.com",
                "+91 98765 43210",
                hash_password("password123"),
                "BTM Layout",
                "Flat 402, Green Glen Heights, 16th Main, BTM 2nd Stage, Bengaluru"
            ))
            conn.commit()
