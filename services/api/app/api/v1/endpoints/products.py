from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Product, StockBatch
from app.schemas.inventory import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check duplicate SKU
    stmt = select(Product).where(
        Product.tenant_id == current_user.tenant_id,
        Product.sku == data.sku
    )
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A product with SKU '{data.sku}' already exists."
        )

    product = Product(
        tenant_id=current_user.tenant_id,
        sku=data.sku,
        barcode=data.barcode,
        name=data.name,
        generic_name=data.generic_name,
        category=data.category,
        unit=data.unit,
        reorder_level=data.reorder_level,
        selling_price=data.selling_price,
        buying_price=data.buying_price,
        tax_rate=data.tax_rate
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    response = ProductResponse.model_validate(product)
    response.total_stock = 0
    return response


@router.get("", response_model=List[ProductResponse])
async def list_products(
    query: Optional[str] = Query(None, description="Search by name, SKU, or barcode"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Product).where(
        Product.tenant_id == current_user.tenant_id,
        Product.is_active == True
    )

    if category and category != "All":
        stmt = stmt.where(Product.category == category)

    if query:
        search_pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(search_pattern),
                Product.sku.ilike(search_pattern),
                Product.barcode.ilike(search_pattern),
                Product.generic_name.ilike(search_pattern)
            )
        )

    res = await db.execute(stmt)
    products = list(res.scalars().all())

    # Calculate total remaining stock for each product
    response_list: List[ProductResponse] = []
    for prod in products:
        stock_stmt = select(func.coalesce(func.sum(StockBatch.quantity_remaining), 0)).where(
            StockBatch.product_id == prod.id,
            StockBatch.tenant_id == current_user.tenant_id
        )
        stock_res = await db.execute(stock_stmt)
        total_stock = stock_res.scalar() or 0

        p_resp = ProductResponse.model_validate(prod)
        p_resp.total_stock = total_stock
        response_list.append(p_resp)

    return response_list
