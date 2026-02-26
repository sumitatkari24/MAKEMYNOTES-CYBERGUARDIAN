import sqlite3

DB_NAME = "askmynotes.db"

# ✅ Create ONE global connection
conn = sqlite3.connect(DB_NAME, check_same_thread=False)
conn.execute("PRAGMA journal_mode=WAL;")
conn.execute("PRAGMA synchronous=NORMAL;")

cursor = conn.cursor()


def init_db():
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER,
            filename TEXT,
            FOREIGN KEY(subject_id) REFERENCES subjects(id)
        )
    """)

    conn.commit()


def add_subject(name):
    try:
        cursor.execute("INSERT INTO subjects (name) VALUES (?)", (name,))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False