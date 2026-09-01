from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Supplier
from app.schemas.suppliers import SupplierCreate, SupplierResponse

router = APIRouter()

@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    data: SupplierCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    supplier = Supplier(
        tenant_id=current_user.tenant_id,
        name=data.name,
        contact_person=data.contact_person,
        phone=data.phone,
        email=data.email,
        address=data.address
    )
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier

@router.get("", response_model=List[SupplierResponse])
async def list_suppliers(
    query: Optional[str] = Query(None, description="Search supplier by name, email, or contact person"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Supplier).where(
        Supplier.tenant_id == current_user.tenant_id,
        Supplier.is_active == True
    )

    if query:
        pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                Supplier.name.ilike(pattern),
                Supplier.contact_person.ilike(pattern),
                Supplier.email.ilike(pattern)
            )
        )

    res = await db.execute(stmt)
    return list(res.scalars().all())
