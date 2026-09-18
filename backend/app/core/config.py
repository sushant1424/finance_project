from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:123@localhost/finsight"
    SECRET_KEY: str = "finsight-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    # Comma-separated extra CORS origins for production (e.g. Vercel URL)
    CORS_ORIGINS: str = ""
    RESET_TOKEN_EXPIRE_HOURS: int = 24
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@finsight.app"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            self.FRONTEND_URL,
        ]
        if self.CORS_ORIGINS:
            origins.extend(
                o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()
            )
        # Preserve order, drop duplicates
        seen: set[str] = set()
        unique: list[str] = []
        for origin in origins:
            if origin and origin not in seen:
                seen.add(origin)
                unique.append(origin)
        return unique


settings = Settings()
