from functools import cached_property

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Telegram Sports Predictions"
    environment: str = "local"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_cors_origins: str = "http://localhost:3000"
    database_url: str = "postgresql+psycopg://predictions:predictions@postgres:5432/predictions"
    jwt_secret: str = "change-me"
    jwt_expires_minutes: int = 10080
    bot_internal_token: str = "change-me-internal-token"
    bot_token: str = "change-me"
    bot_internal_url: str = "http://bot:8080"
    telegram_webapp_url: str = "http://localhost:3000"
    telegram_admin_ids: str = ""
    telegram_vip_channel_id: str = ""
    telegram_discussion_group_id: str = ""
    vip_default_duration_days: int = 30
    vip_stars_amount: int = 100
    expert_autopost_enabled: bool = True
    expert_autopost_interval_seconds: int = 60

    @cached_property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]

    @cached_property
    def admin_ids(self) -> set[int]:
        return {int(value.strip()) for value in self.telegram_admin_ids.split(",") if value.strip()}


settings = Settings()
