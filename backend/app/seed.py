from .auth import hash_password
from .config import settings
from .database import db_session
from .services import utc_now_iso


def seed_demo_user() -> None:
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (settings.demo_email.lower(),),
        ).fetchone()
        if existing:
            return
        conn.execute(
            """
            INSERT INTO users (email, password_hash, display_name, account_id, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                settings.demo_email.lower(),
                hash_password(settings.demo_password),
                settings.demo_display_name,
                settings.demo_account_id,
                utc_now_iso(),
            ),
        )
