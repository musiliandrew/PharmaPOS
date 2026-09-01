from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, asc
from app.models.models import Sale, SaleItem, StockBatch, Product, SalePaymentStatus


class AnalyticsService:
    @staticmethod
    async def get_todays_sales_summary(db: AsyncSession, tenant_id: UUID) -> Dict[str, Any]:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 1. Total Sales & Count Today
        stmt = (
            select(
                func.coalesce(func.sum(Sale.total_amount), Decimal("0.00")),
                func.count(Sale.id)
            )
            .where(
                Sale.tenant_id == tenant_id,
                Sale.payment_status == SalePaymentStatus.PAID,
                Sale.created_at >= today_start
            )
        )
        res = await db.execute(stmt)
        total_sales, count = res.one()

        # 2. Payment Method Breakdown
        breakdown_stmt = (
            select(Sale.payment_method, func.coalesce(func.sum(Sale.total_amount), Decimal("0.00")))
            .where(
                Sale.tenant_id == tenant_id,
                Sale.payment_status == SalePaymentStatus.PAID,
                Sale.created_at >= today_start
            )
            .group_by(Sale.payment_method)
        )
        b_res = await db.execute(breakdown_stmt)
        breakdown_dict = {method: amt for method, amt in b_res.all()}
        
        mpesa_vol = breakdown_dict.get("M-Pesa", Decimal("0.00"))
        cash_vol = breakdown_dict.get("Cash", Decimal("0.00"))
        card_vol = breakdown_dict.get("Card", Decimal("0.00"))

        # 3. Estimated Gross Profit Today
        profit_stmt = (
            select(
                func.coalesce(
                    func.sum((SaleItem.unit_price - Product.buying_price) * SaleItem.quantity),
                    Decimal("0.00")
                )
            )
            .join(Product, SaleItem.product_id == Product.id)
            .join(Sale, SaleItem.sale_id == Sale.id)
            .where(
                Sale.tenant_id == tenant_id,
                Sale.payment_status == SalePaymentStatus.PAID,
                Sale.created_at >= today_start
            )
        )
        prof_res = await db.execute(profit_stmt)
        gross_profit = prof_res.scalar() or Decimal("0.00")

        return {
            "total_sales": total_sales,
            "transaction_count": count,
            "mpesa_volume": mpesa_vol,
            "cash_volume": cash_vol,
            "card_volume": card_vol,
            "gross_profit": gross_profit,
            "payment_breakdown": {
                "M-Pesa": mpesa_vol,
                "Cash": cash_vol,
                "Card": card_vol
            }
        }

    @staticmethod
    async def get_expiring_stock(db: AsyncSession, tenant_id: UUID, days: int = 60) -> List[Dict[str, Any]]:
        target_date = datetime.utcnow() + timedelta(days=days)
        stmt = (
            select(StockBatch, Product)
            .join(Product, StockBatch.product_id == Product.id)
            .where(
                StockBatch.tenant_id == tenant_id,
                StockBatch.quantity_remaining > 0,
                StockBatch.expiry_date <= target_date
            )
            .order_by(asc(StockBatch.expiry_date))
        )
        res = await db.execute(stmt)
        rows = res.all()
        now = datetime.utcnow()
        
        items = []
        for batch, product in rows:
            days_left = (batch.expiry_date - now).days
            status = "CRITICAL" if days_left <= 14 else ("WARNING" if days_left <= 30 else "WATCH")
            items.append({
                "product_name": product.name,
                "batch_number": batch.batch_number,
                "expiry_date": batch.expiry_date.strftime("%d %b %Y"),
                "quantity": batch.quantity_remaining,
                "status": status
            })
        return items

    @staticmethod
    async def get_low_stock_items(db: AsyncSession, tenant_id: UUID) -> List[Dict[str, Any]]:
        stmt = select(Product).where(Product.tenant_id == tenant_id, Product.is_active == True)
        res = await db.execute(stmt)
        products = res.scalars().all()
        
        low_stock = []
        for prod in products:
            sum_stmt = select(func.coalesce(func.sum(StockBatch.quantity_remaining), 0)).where(
                StockBatch.product_id == prod.id,
                StockBatch.tenant_id == tenant_id
            )
            s_res = await db.execute(sum_stmt)
            curr_stock = s_res.scalar() or 0
            
            if curr_stock <= prod.reorder_level:
                low_stock.append({
                    "product_id": str(prod.id),
                    "product_name": prod.name,
                    "sku": prod.sku,
                    "current_stock": curr_stock,
                    "reorder_level": prod.reorder_level
                })
        return low_stock
