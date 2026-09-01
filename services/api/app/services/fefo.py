from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, asc
from fastapi import HTTPException, status
from app.models.models import StockBatch, InventoryMovement, InventoryMovementType, Product, User


class FEFOEngine:
    @staticmethod
    async def get_available_batches_fefo(
        db: AsyncSession,
        tenant_id: UUID,
        product_id: UUID
    ) -> List[StockBatch]:
        """
        Fetch non-expired stock batches sorted by earliest expiry date (FEFO).
        """
        stmt = (
            select(StockBatch)
            .where(
                StockBatch.tenant_id == tenant_id,
                StockBatch.product_id == product_id,
                StockBatch.quantity_remaining > 0,
                StockBatch.expiry_date > datetime.utcnow()
            )
            .order_by(asc(StockBatch.expiry_date))
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def deduct_stock_fefo(
        db: AsyncSession,
        tenant_id: UUID,
        branch_id: UUID,
        product_id: UUID,
        required_quantity: int,
        user_id: Optional[UUID] = None,
        reference_id: Optional[str] = None
    ) -> List[Tuple[UUID, int]]:
        """
        Deduct stock using FEFO (First-Expiry-First-Out).
        Returns a list of (batch_id, quantity_deducted_from_batch).
        """
        batches = await FEFOEngine.get_available_batches_fefo(db, tenant_id, product_id)
        total_available = sum(b.quantity_remaining for b in batches)

        if total_available < required_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock available. Requested: {required_quantity}, Available: {total_available}"
            )

        remaining_to_deduct = required_quantity
        deduction_summary: List[Tuple[UUID, int]] = []

        for batch in batches:
            if remaining_to_deduct <= 0:
                break

            deduct_amount = min(batch.quantity_remaining, remaining_to_deduct)
            batch.quantity_remaining -= deduct_amount
            remaining_to_deduct -= deduct_amount

            deduction_summary.append((batch.id, deduct_amount))

            # Record inventory audit movement
            movement = InventoryMovement(
                tenant_id=tenant_id,
                branch_id=branch_id,
                product_id=product_id,
                batch_id=batch.id,
                movement_type=InventoryMovementType.SALE,
                quantity=-deduct_amount,
                reference_id=reference_id,
                created_by=user_id
            )
            db.add(movement)

        await db.flush()
        return deduction_summary

    @staticmethod
    async def add_stock_batch(
        db: AsyncSession,
        tenant_id: UUID,
        branch_id: UUID,
        product_id: UUID,
        batch_number: str,
        expiry_date: datetime,
        quantity: int,
        unit_cost: float,
        manufacture_date: Optional[datetime] = None,
        user_id: Optional[UUID] = None
    ) -> StockBatch:
        batch = StockBatch(
            tenant_id=tenant_id,
            branch_id=branch_id,
            product_id=product_id,
            batch_number=batch_number,
            manufacture_date=manufacture_date,
            expiry_date=expiry_date,
            quantity_initial=quantity,
            quantity_remaining=quantity,
            unit_cost=unit_cost
        )
        db.add(batch)
        await db.flush()

        movement = InventoryMovement(
            tenant_id=tenant_id,
            branch_id=branch_id,
            product_id=product_id,
            batch_id=batch.id,
            movement_type=InventoryMovementType.PURCHASE,
            quantity=quantity,
            reference_id=f"BATCH-{batch_number}",
            created_by=user_id
        )
        db.add(movement)
        await db.flush()
        return batch
