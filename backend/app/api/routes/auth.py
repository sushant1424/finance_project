from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        currency=user.currency,
        date_format=user.date_format,
        month_start_day=user.month_start_day,
        compact_mode=user.compact_mode,
        show_cents=user.show_cents,
        chart_animation=user.chart_animation,
        first_day_of_week=user.first_day_of_week,
        created_at=user.created_at.isoformat() if user.created_at else "",
    )


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = auth_service.register_user(data, db)
    result = auth_service.login_user(data.email, data.password, db)
    return {"access_token": result["access_token"], "token_type": "bearer", "user": _user_response(user)}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login_user(data.email, data.password, db)
    return {"access_token": result["access_token"], "token_type": "bearer", "user": _user_response(result["user"])}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return _user_response(user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = auth_service.update_profile(user, data, db)
    return _user_response(updated)


@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.change_password(user, data, db)
    return {"message": "Password updated successfully"}


@router.delete("/account")
def delete_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service.delete_account(user, db)
    return {"message": "Account deleted"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service.request_password_reset(data.email, db)
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service.reset_password(data.token, data.new_password, db)
    return {"message": "Password updated successfully"}
