from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # LLM Configuration
    LLM_PROVIDER: str = "gemini"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./negotiation.db"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    @property
    def cors_origins_list(self) -> List[str]:
        return self.CORS_ORIGINS

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()