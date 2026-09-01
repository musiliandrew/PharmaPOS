from datetime import datetime, timedelta
from typing import Optional, Any
import base64
import hashlib
import jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from app.core.config import settings

# Crypt context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password[:72])


def create_access_token(
    subject: str,
    tenant_id: str,
    role: str,
    branch_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "tenant_id": str(tenant_id),
        "role": str(role),
        "branch_id": str(branch_id) if branch_id else None,
        "exp": expire,
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def get_fernet() -> Fernet:
    # Derive a key from the SECRET_KEY
    key_bytes = settings.SECRET_KEY.encode()
    derived_key = hashlib.sha256(key_bytes).digest()
    fernet_key = base64.urlsafe_b64encode(derived_key)
    return Fernet(fernet_key)


def encrypt_value(value: str) -> str:
    if not value:
        return ""
    fernet = get_fernet()
    return fernet.encrypt(value.encode()).decode()


def decrypt_value(encrypted_value: str) -> str:
    if not encrypted_value:
        return ""
    fernet = get_fernet()
    try:
        return fernet.decrypt(encrypted_value.encode()).decode()
    except Exception:
        # Fallback to plain text if decryption fails
        return encrypted_value

