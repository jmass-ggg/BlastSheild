from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="BLASTSHIELD_",
        env_file=".env",
        extra="ignore",
    )

    app_name: str = "BlastShield"
    environment: str = "development"
    api_prefix: str = "/api/v1"
    analysis_database_url: str = (
        "postgresql+psycopg://blastshield_analyzer:analyzer_demo_password"
        "@localhost:5432/blastshield"
    )
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    statement_timeout_ms: int = Field(default=5_000, ge=1, le=60_000)
    lock_timeout_ms: int = Field(default=1_000, ge=1, le=60_000)
    fk_max_depth: int = Field(default=3, ge=1, le=10)


@lru_cache
def get_settings() -> Settings:
    return Settings()

