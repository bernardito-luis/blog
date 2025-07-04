import functools

from pydantic_settings import BaseSettings, SettingsConfigDict


class BaseProjectSettings(BaseSettings):
    ENVIRONMENT: str = 'dev'
    OPENAI_API_KEY: str


class Settings(BaseProjectSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')


@functools.lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
