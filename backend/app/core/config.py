from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="BLASTSHIELD_",
        env_file=".env",
        extra="ignore",
    )

    analysis_database_url: str = (
        "postgresql+psycopg://blastshield_analyzer:analyzer_demo_password"
        "@localhost:5432/blastshield"
    )
    app_database_url: str = (
        "postgresql+psycopg://blastshield_app:app_demo_password"
        "@localhost:5432/blastshield"
    )
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    statement_timeout_ms: int = Field(default=5_000, ge=1, le=60_000)
    lock_timeout_ms: int = Field(default=1_000, ge=1, le=60_000)
    fk_max_depth: int = Field(default=3, ge=1, le=10)
    exact_count_max_cost: float = Field(default=100_000, ge=0)
    business_subscription_table: str = "subscriptions"
    business_subscription_status_column: str = "status"
    business_subscription_active_value: str = "active"
    business_subscription_price_column: str = "monthly_price"


class ExecutionSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="BLASTSHIELD_",
        env_file=".env",
        extra="ignore",
    )

    execution_database_url: str = (
        "postgresql+psycopg://blastshield_executor:executor_demo_password"
        "@localhost:5432/blastshield"
    )
    execution_statement_timeout_ms: int = Field(default=10_000, ge=1, le=120_000)
    execution_lock_timeout_ms: int = Field(default=2_000, ge=1, le=60_000)


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_execution_settings() -> ExecutionSettings:
    return ExecutionSettings()
