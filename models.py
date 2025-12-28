import sqlite3
import os
from config import DATABASE_PATH

def get_db_connection():
    # Ensure database folder exists
    db_dir = os.path.dirname(DATABASE_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        mobile TEXT,
        gender TEXT,
        aadhaar TEXT,
        license TEXT,
        location TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS tickets(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount INTEGER,
        payment_mode TEXT,
        status TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        vehicle_type TEXT,
        vehicle_name TEXT,
        duration TEXT,
        cost INTEGER,
        payment_mode TEXT
    )
    """)

    conn.commit()
    conn.close()
