from datetime import datetime, timedelta
import secrets

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import ChangePasswordRequest, ProfileUpdateRequest, RegisterRequest
from app.services import account_service
from app.services.email_service import send_email


def register_user(data: RegisterRequest, db: Session) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    account_service.ensure_default_account(user.id, db)
    return user


def login_user(email: str, password: str, db: Session) -> dict:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": user}


def update_profile(user: User, data: ProfileUpdateRequest, db: Session) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def change_password(user: User, data: ChangePasswordRequest, db: Session) -> None:
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = get_password_hash(data.new_password)
    db.commit()


def delete_account(user: User, db: Session) -> None:
    db.delete(user)
    db.commit()


def request_password_reset(email: str, db: Session) -> None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return  # don't reveal whether email exists
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=settings.RESET_TOKEN_EXPIRE_HOURS)
    db.commit()
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    send_email(
        user.email,
        "Reset your FinSight password",
        f"Hi {user.name},\n\nClick to reset your password:\n{reset_url}\n\nThis link expires in {settings.RESET_TOKEN_EXPIRE_HOURS} hours.",
    )


def reset_password(token: str, new_password: str, db: Session) -> None:
    user = db.query(User).filter(User.reset_token == token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    user.password_hash = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
