from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from ..auth import (
    clear_session_cookie,
    create_session,
    delete_session,
    get_current_user,
    get_user_by_email,
    set_session_cookie,
    verify_password,
)
from ..config import settings
from ..schemas import LoginRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
def login(payload: LoginRequest, response: Response):
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )
    session_id = create_session(user["id"])
    set_session_cookie(response, session_id)
    return UserOut(
        id=user["id"],
        email=user["email"],
        display_name=user["display_name"],
        account_id=user["account_id"],
    )


@router.post("/logout")
def logout(request: Request, response: Response):
    session_id = request.cookies.get(settings.session_cookie_name)
    delete_session(session_id)
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user: dict = Depends(get_current_user)):
    return UserOut(
        id=user["id"],
        email=user["email"],
        display_name=user["display_name"],
        account_id=user["account_id"],
    )
