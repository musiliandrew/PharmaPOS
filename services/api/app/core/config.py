import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Determine directory containing settings file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILE_PATH = os.path.join(BASE_DIR, ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "Pharma SaaS POS API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
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
