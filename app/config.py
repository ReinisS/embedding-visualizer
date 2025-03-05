"""Configuration settings for the embedding visualizer."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    debug: bool = Field(default=False, validation_alias="APP_DEBUG")
    api_prefix: str = Field(default="/api", validation_alias="APP_API_PREFIX")

    # Authentication
    clerk_publishable_key: str = Field(..., validation_alias="APP_CLERK_PUBLISHABLE_KEY")
    clerk_secret_key: str = Field(..., validation_alias="APP_CLERK_SECRET_KEY")
    clerk_api_base: str = Field(
        default="https://api.clerk.com", validation_alias="APP_CLERK_API_BASE"
    )

    # Analytics
    posthog_api_key: str = Field(..., validation_alias="APP_POSTHOG_API_KEY")
    posthog_host: str = Field(
        default="https://app.posthog.com", validation_alias="APP_POSTHOG_HOST"
    )

    # Cache Configuration
    cache_enabled: bool = Field(default=True, validation_alias="APP_CACHE_ENABLED")
    cache_host: str = Field(default="localhost", validation_alias="APP_CACHE_HOST")
    cache_port: int = Field(default=6379, validation_alias="APP_CACHE_PORT")
    cache_db: int = Field(default=0, validation_alias="APP_CACHE_DB")
    cache_password: str = Field(default="", validation_alias="APP_CACHE_PASSWORD")
    cache_ttl_seconds: int = Field(default=3600, gt=0, validation_alias="APP_CACHE_TTL_SECONDS")

    # Rate Limiting
    requests_per_minute_per_user: int = Field(
        default=5, gt=0, validation_alias="APP_REQUESTS_PER_MINUTE_PER_USER"
    )

    # Model Configuration
    model_name: str = Field(default="all-MiniLM-L6-v2", validation_alias="APP_MODEL_NAME")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_nested_delimiter="__",
    )


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings.

    Returns:
        Settings: Application settings instance.
    """
    return Settings()  # type: ignore
