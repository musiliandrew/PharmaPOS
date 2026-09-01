from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Customer
from app.schemas.customers import CustomerCreate, CustomerResponse

router = APIRouter()

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    data: CustomerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = Customer(
        tenant_id=current_user.tenant_id,
        name=data.name,
        phone=data.phone,
        email=data.email
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer

@router.get("", response_model=List[CustomerResponse])
async def list_customers(
    query: Optional[str] = Query(None, description="Search customer by name, phone, or email"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Customer).where(
        Customer.tenant_id == current_user.tenant_id,
        Customer.is_active == True
    )

    if query:
        pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                Customer.name.ilike(pattern),
                Customer.phone.ilike(pattern),
                Customer.email.ilike(pattern)
            )
        )

    res = await db.execute(stmt)
    return list(res.scalars().all())
