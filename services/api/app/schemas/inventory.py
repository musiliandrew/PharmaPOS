from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# Stock Batch Schemas
class StockBatchCreate(BaseModel):
    product_id: UUID
    batch_number: str
    manufacture_date: Optional[datetime] = None
    expiry_date: datetime
    quantity_initial: int = Field(gt=0)
    unit_cost: Decimal = Field(ge=0)


class StockBatchResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    branch_id: UUID
    product_id: UUID
    batch_number: str
    manufacture_date: Optional[datetime]
    expiry_date: datetime
    quantity_initial: int
    quantity_remaining: int
    unit_cost: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


# Product Schemas
class ProductCreate(BaseModel):
    name: str
    sku: str
    barcode: Optional[str] = None
    generic_name: Optional[str] = None
    category: str
    unit: str = "Pack"
    reorder_level: int = 10
    selling_price: Decimal = Field(gt=0)
    buying_price: Decimal = Field(ge=0)
    tax_rate: Decimal = Field(default=Decimal("0.00"))


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    barcode: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    reorder_level: Optional[int] = None
    selling_price: Optional[Decimal] = None
    buying_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    sku: str
    barcode: Optional[str]
    name: str
    generic_name: Optional[str]
    category: str
    unit: str
    reorder_level: int
    selling_price: Decimal
    buying_price: Decimal
    tax_rate: Decimal
    is_active: bool
    total_stock: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class ExpiryWatchItem(BaseModel):
    product_id: UUID
    product_name: str
    sku: str
    category: str
    batch_number: str
    expiry_date: datetime
    days_to_expiry: int
    quantity_remaining: int
    status: str  # CRITICAL (<14 days), WARNING (<30 days), WATCH (<60 days)


class InventoryAdjustment(BaseModel):
    batch_id: UUID
    quantity_change: int  # Positive for addition, negative for deduction
    reason: str  # DAMAGE, RETURN, CORRECTION, EXPIRED
