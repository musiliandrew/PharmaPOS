from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.models.models import UserRole, SubscriptionPlan


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    tenant_id: Optional[str] = None
    role: Optional[str] = None
    branch_id: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TenantRegister(BaseModel):
    pharmacy_name: str
    owner_name: str
    email: EmailStr
    password: str
    branch_name: str = "Main Branch"


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    tenant_id: UUID
    branch_id: Optional[UUID]

    class Config:
        from_attributes = True


class TenantResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    plan: SubscriptionPlan

    class Config:
        from_attributes = True
