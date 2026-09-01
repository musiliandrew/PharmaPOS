from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, StockBatch, Product, InventoryMovement, InventoryMovementType
from app.schemas.inventory import StockBatchCreate, StockBatchResponse, ExpiryWatchItem, InventoryAdjustment
from app.services.fefo import FEFOEngine

router = APIRouter()


@router.post("/batches", response_model=StockBatchResponse, status_code=status.HTTP_201_CREATED)
async def create_stock_batch(
    data: StockBatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a branch to add stock batches."
        )

    # Verify product belongs to tenant
    stmt = select(Product).where(
        Product.id == data.product_id,
        Product.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    batch = await FEFOEngine.add_stock_batch(
        db=db,
        tenant_id=current_user.tenant_id,
        branch_id=current_user.branch_id,
        product_id=data.product_id,
        batch_number=data.batch_number,
        manufacture_date=data.manufacture_date,
        expiry_date=data.expiry_date,
        quantity=data.quantity_initial,
        unit_cost=float(data.unit_cost),
        user_id=current_user.id
    )
    await db.commit()
    await db.refresh(batch)
    return batch


@router.get("/expiry-watch", response_model=List[ExpiryWatchItem])
async def get_expiry_watch(
    days: int = Query(60, description="Expiry warning threshold in days"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = datetime.utcnow() + timedelta(days=days)
    
    stmt = (
        select(StockBatch, Product)
        .join(Product, StockBatch.product_id == Product.id)
        .where(
            StockBatch.tenant_id == current_user.tenant_id,
            StockBatch.quantity_remaining > 0,
            StockBatch.expiry_date <= target_date
        )
        .order_by(asc(StockBatch.expiry_date))
    )
    
    res = await db.execute(stmt)
    results = res.all()
    
    items: List[ExpiryWatchItem] = []
    now = datetime.utcnow()
    
    for batch, product in results:
        days_to_exp = (batch.expiry_date - now).days
        if days_to_exp <= 14:
            status_label = "CRITICAL"
        elif days_to_exp <= 30:
            status_label = "WARNING"
        else:
            status_label = "WATCH"

        items.append(
            ExpiryWatchItem(
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                category=product.category,
                batch_number=batch.batch_number,
                expiry_date=batch.expiry_date,
                days_to_expiry=days_to_exp,
                quantity_remaining=batch.quantity_remaining,
                status=status_label
            )
        )
    
    return items


@router.post("/adjustments", status_code=status.HTTP_200_OK)
async def adjust_inventory(
    data: InventoryAdjustment,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(StockBatch).where(
        StockBatch.id == data.batch_id,
        StockBatch.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    batch = res.scalar_one_or_none()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock batch not found."
        )

    new_qty = batch.quantity_remaining + data.quantity_change
    if new_qty < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot adjust batch remaining quantity below zero."
        )

    batch.quantity_remaining = new_qty

    movement = InventoryMovement(
        tenant_id=current_user.tenant_id,
        branch_id=batch.branch_id,
        product_id=batch.product_id,
        batch_id=batch.id,
        movement_type=InventoryMovementType.ADJUSTMENT,
        quantity=data.quantity_change,
        reference_id=f"ADJ-{data.reason}",
        created_by=current_user.id
    )
    db.add(movement)
    await db.commit()

    return {"status": "success", "new_remaining_quantity": new_qty}
