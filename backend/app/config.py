from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Route53 Clone API"
    database_path: Path = BASE_DIR / "data" / "route53.db"
    secret_key: str = "route53-clone-dev-secret-change-in-production"
    session_cookie_name: str = "route53_session"
    session_max_age_seconds: int = 60 * 60 * 24
    # Comma-separated list in env: CORS_ORIGINS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://router53.itsakanksha.in",
        "http://router53.itsakanksha.in",
        "https://aws-clone.vercel.app",
    ]
    cookie_secure: bool = False
    demo_email: str = "admin@example.com"
    demo_password: str = "password123"
    demo_display_name: str = "Akanksha-aws"
    demo_account_id: str = "474632926022"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, value):
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    @field_validator("database_path", mode="before")
    @classmethod
    def parse_db_path(cls, value):
        if value:
            return Path(value)
        return value


settings = Settings()
