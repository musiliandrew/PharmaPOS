import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, Text, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


# Enums
class SubscriptionPlan(str, Enum):
    FREE = "FREE"
    STARTER = "STARTER"
    PRO = "PRO"
    BUSINESS = "BUSINESS"


class UserRole(str, Enum):
    OWNER = "OWNER"
    MANAGER = "MANAGER"
    CASHIER = "CASHIER"


class InventoryMovementType(str, Enum):
    SALE = "SALE"
    PURCHASE = "PURCHASE"
    ADJUSTMENT = "ADJUSTMENT"
    EXPIRED = "EXPIRED"
    RETURN = "RETURN"


class SalePaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"


class MpesaStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    TIMEOUT = "TIMEOUT"


# Models
class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    plan = Column(SQLEnum(SubscriptionPlan), default=SubscriptionPlan.FREE, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Default Payment Configurations
    payment_payhero_channel_id = Column(String(255), nullable=True)
    payment_till = Column(String(255), nullable=True)
    payment_paybill = Column(String(255), nullable=True)

    # Relationships
    branches = relationship("Branch", back_populates="tenant", cascade="all, delete-orphan")
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="tenant", cascade="all, delete-orphan")
    suppliers = relationship("Supplier", back_populates="tenant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="tenant", cascade="all, delete-orphan")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    loyalty_points = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("Tenant", back_populates="customers")
    sales = relationship("Sale", back_populates="customer")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("Tenant", back_populates="suppliers")


class Branch(Base):
    __tablename__ = "branches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Payment Configurations (Encrypted at rest)
    payment_paybill = Column(String(255), nullable=True)
    payment_till = Column(String(255), nullable=True)
    payment_payhero_channel_id = Column(String(255), nullable=True)
    payment_bank_name = Column(String(255), nullable=True)
    payment_bank_acct = Column(String(255), nullable=True)
    payment_preferred_method = Column(String(50), default="PAYBILL")

    # Relationships
    tenant = relationship("Tenant", back_populates="branches")
    users = relationship("User", back_populates="branch")
    stock_batches = relationship("StockBatch", back_populates="branch")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CASHIER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    branch = relationship("Branch", back_populates="users")
    sales = relationship("Sale", back_populates="cashier")


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    sku = Column(String(100), nullable=False, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    generic_name = Column(String(255), nullable=True)
    category = Column(String(100), nullable=False, index=True)
    unit = Column(String(50), default="Pack", nullable=False)
    reorder_level = Column(Integer, default=10, nullable=False)
    selling_price = Column(Numeric(12, 2), nullable=False)
    buying_price = Column(Numeric(12, 2), nullable=False)
    tax_rate = Column(Numeric(5, 2), default=0.00, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="products")
    batches = relationship("StockBatch", back_populates="product", cascade="all, delete-orphan")


class StockBatch(Base):
    __tablename__ = "stock_batches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(100), nullable=False, index=True)
    manufacture_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=False, index=True)
    quantity_initial = Column(Integer, nullable=False)
    quantity_remaining = Column(Integer, nullable=False)
    unit_cost = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="stock_batches")
    product = relationship("Product", back_populates="batches")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("stock_batches.id", ondelete="SET NULL"), nullable=True)
    movement_type = Column(SQLEnum(InventoryMovementType), nullable=False)
    quantity = Column(Integer, nullable=False)  # positive for addition, negative for deduction
    reference_id = Column(String(255), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Sale(Base):
    __tablename__ = "sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    cashier_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    receipt_number = Column(String(100), unique=True, nullable=False, index=True)
    subtotal = Column(Numeric(12, 2), nullable=False)
    discount = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(50), default="M-Pesa", nullable=False)
    payment_status = Column(SQLEnum(SalePaymentStatus), default=SalePaymentStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    cashier = relationship("User", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    mpesa_transactions = relationship("MpesaTransaction", back_populates="sale")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sale_id = Column(UUID(as_uuid=True), ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("stock_batches.id", ondelete="SET NULL"), nullable=True)
    unit_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)

    # Relationships
    sale = relationship("Sale", back_populates="items")


class MpesaTransaction(Base):
    __tablename__ = "mpesa_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    sale_id = Column(UUID(as_uuid=True), ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant_request_id = Column(String(100), nullable=True, index=True)
    checkout_request_id = Column(String(100), unique=True, nullable=False, index=True)
    provider = Column(String(50), default="PAYHERO", nullable=False)
    channel_id = Column(String(100), nullable=True, index=True)
    phone_number = Column(String(20), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    mpesa_receipt_number = Column(String(100), nullable=True, index=True)
    result_code = Column(Integer, nullable=True)
    result_desc = Column(String(255), nullable=True)
    status = Column(SQLEnum(MpesaStatus), default=MpesaStatus.PENDING, nullable=False, index=True)
    raw_callback_payload = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sale = relationship("Sale", back_populates="mpesa_transactions")
