from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, Response, status
from passlib.context import CryptContext

from .config import settings
from .database import db_session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_session(user_id: int) -> str:
    session_id = secrets.token_urlsafe(32)
    now = utc_now()
    expires = now + timedelta(seconds=settings.session_max_age_seconds)
    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO sessions (id, user_id, created_at, expires_at)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, user_id, now.isoformat(), expires.isoformat()),
        )
    return session_id


def delete_session(session_id: str | None) -> None:
    if not session_id:
        return
    with db_session() as conn:
        conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))


def set_session_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=settings.session_max_age_seconds,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(settings.session_cookie_name, path="/")


def get_user_by_email(email: str):
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email.lower(),)
        ).fetchone()
    return dict(row) if row else None


def get_user_by_id(user_id: int):
    with db_session() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return dict(row) if row else None


def get_current_user(request: Request):
    session_id = request.cookies.get(settings.session_cookie_name)
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    with db_session() as conn:
        row = conn.execute(
            """
            SELECT u.*, s.expires_at AS session_expires_at, s.id AS session_id
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.id = ?
            """,
            (session_id,),
        ).fetchone()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )
    user = dict(row)
    expires_at = datetime.fromisoformat(user["session_expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < utc_now():
        delete_session(session_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )
    return {
        "id": user["id"],
        "email": user["email"],
        "display_name": user["display_name"],
        "account_id": user["account_id"],
        "session_id": user["session_id"],
    }


CurrentUser = Depends(get_current_user)
