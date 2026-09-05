import os
from typing import Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine directory containing settings file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILE_PATH = os.path.join(BASE_DIR, ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "Pharma SaaS POS API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        return []
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security & Auth
    SECRET_KEY: str  # Mandatory from .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # Database
    DATABASE_URL: str  # Mandatory from .env
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Safaricom Daraja M-Pesa Settings
    MPESA_ENVIRONMENT: str = "sandbox"
    MPESA_CONSUMER_KEY: Optional[str] = None
    MPESA_CONSUMER_SECRET: Optional[str] = None
    MPESA_PASSKEY: Optional[str] = None
    MPESA_SHORTCODE: str = "174379"
    MPESA_CALLBACK_URL: Optional[str] = None

    # Pay Hero Settings (Multi-Tenant M-Pesa STK Gateway)
    PAYHERO_API_USERNAME: Optional[str] = None
    PAYHERO_API_PASSWORD: Optional[str] = None
    PAYHERO_API_URL: str = "https://payhero.co.ke/api/v2"
    PUBLIC_BACKEND_URL: str = "https://pharma-backend-51917830461.us-central1.run.app"

    # Google Cloud Storage Settings
    GCS_BUCKET_NAME: str = "pharma-storage"
    GCS_PROJECT_ID: Optional[str] = None
    GCS_CREDENTIALS_FILE: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
