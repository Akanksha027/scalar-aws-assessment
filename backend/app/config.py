from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    app_name: str = "Route53 Clone API"
    database_path: Path = BASE_DIR / "data" / "route53.db"
    secret_key: str = "route53-clone-dev-secret-change-in-production"
    session_cookie_name: str = "route53_session"
    session_max_age_seconds: int = 60 * 60 * 24
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    demo_email: str = "admin@example.com"
    demo_password: str = "password123"
    demo_display_name: str = "Akanksha-aws"
    demo_account_id: str = "474632926022"

    class Config:
        env_file = ".env"


settings = Settings()
