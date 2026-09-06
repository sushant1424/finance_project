from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    currency: str
    date_format: str
    month_start_day: int
    compact_mode: bool
    show_cents: bool
    chart_animation: bool
    first_day_of_week: str
    created_at: str

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    email: EmailStr | None = None
    currency: str | None = Field(None, min_length=1, max_length=10)
    date_format: str | None = None
    month_start_day: int | None = Field(None, ge=1, le=28)
    compact_mode: bool | None = None
    show_cents: bool | None = None
    chart_animation: bool | None = None
    first_day_of_week: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)
