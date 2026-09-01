from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.models import SalePaymentStatus


class CartItem(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class POSCheckoutRequest(BaseModel):
    items: List[CartItem]
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)
    payment_method: str = "Cash"  # M-Pesa, Cash, Card
    customer_phone: Optional[str] = None


class SaleItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    branch_id: UUID
    cashier_id: Optional[UUID]
    cashier_name: Optional[str]
    receipt_number: str
    subtotal: Decimal
    discount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    payment_method: str
    payment_status: SalePaymentStatus
    created_at: datetime
    items: List[SaleItemResponse] = []

    class Config:
        from_attributes = True


class SalesSummary(BaseModel):
    total_sales: Decimal
    transaction_count: int
    mpesa_volume: Decimal
    cash_volume: Decimal
    card_volume: Decimal
    gross_profit: Decimal
