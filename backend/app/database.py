import sqlite3
from contextlib import contextmanager
from pathlib import Path

from .config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    account_id TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hosted_zones (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    domain_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Public', 'Private')),
    comment TEXT,
    description TEXT,
    record_count INTEGER NOT NULL DEFAULT 2,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hosted_zones_domain
ON hosted_zones(domain_name);

CREATE TABLE IF NOT EXISTS dns_records (
    id TEXT PRIMARY KEY,
    hosted_zone_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    ttl INTEGER NOT NULL DEFAULT 300,
    routing_policy TEXT NOT NULL DEFAULT 'Simple',
    is_system_record INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (hosted_zone_id) REFERENCES hosted_zones(id) ON DELETE CASCADE,
    UNIQUE (hosted_zone_id, name, type)
);

CREATE TABLE IF NOT EXISTS dns_record_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT NOT NULL,
    value TEXT NOT NULL,
    priority INTEGER,
    weight INTEGER,
    port INTEGER,
    flag INTEGER,
    tag TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (record_id) REFERENCES dns_records(id) ON DELETE CASCADE
);
"""


def get_connection() -> sqlite3.Connection:
    path: Path = settings.database_path
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA)
        conn.commit()


@contextmanager
def db_session():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
