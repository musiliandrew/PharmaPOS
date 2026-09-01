import random
import string
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Product, Sale, SaleItem, SalePaymentStatus, Customer
from app.schemas.sales import POSCheckoutRequest, SaleResponse, SaleItemResponse, SalesSummary
from app.services.fefo import FEFOEngine

router = APIRouter()


def generate_receipt_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"INV-{timestamp}-{random_str}"


@router.post("/checkout", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def pos_checkout(
    data: POSCheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cashier must belong to an active branch to process sales."
        )

    if not data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty."
        )

    subtotal = sum(item.quantity * item.unit_price for item in data.items)
    tax_amount = Decimal("0.00")  # Configurable VAT
    total_amount = subtotal - data.discount + tax_amount

    receipt_num = generate_receipt_number()

    customer_id = None
    if data.customer_phone:
        cleaned_phone = data.customer_phone.strip()
        cust_stmt = select(Customer).where(
            Customer.phone == cleaned_phone,
            Customer.tenant_id == current_user.tenant_id
        )
        cust_res = await db.execute(cust_stmt)
        customer = cust_res.scalar_one_or_none()
        if customer:
            customer_id = customer.id
            earned_points = int(total_amount // 100)
            customer.loyalty_points = (customer.loyalty_points or 0) + earned_points
            db.add(customer)

    sale = Sale(
        tenant_id=current_user.tenant_id,
        branch_id=current_user.branch_id,
        cashier_id=current_user.id,
        customer_id=customer_id,
        receipt_number=receipt_num,
        subtotal=subtotal,
        discount=data.discount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method=data.payment_method,
        payment_status=SalePaymentStatus.PAID
    )
    db.add(sale)
    await db.flush()

    sale_items_response: List[SaleItemResponse] = []

    for cart_item in data.items:
        # 1. Fetch product
        stmt = select(Product).where(
            Product.id == cart_item.product_id,
            Product.tenant_id == current_user.tenant_id
        )
        res = await db.execute(stmt)
        product = res.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {cart_item.product_id} not found."
            )

        # 2. Execute FEFO stock deduction
        deductions = await FEFOEngine.deduct_stock_fefo(
            db=db,
            tenant_id=current_user.tenant_id,
            branch_id=current_user.branch_id,
            product_id=product.id,
            required_quantity=cart_item.quantity,
            user_id=current_user.id,
            reference_id=receipt_num
        )

        total_price = cart_item.quantity * cart_item.unit_price

        # Record SaleItem for primary batch
        primary_batch_id = deductions[0][0] if deductions else None

        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            batch_id=primary_batch_id,
            unit_price=cart_item.unit_price,
            quantity=cart_item.quantity,
            total_price=total_price
        )
        db.add(sale_item)
        await db.flush()

        sale_items_response.append(
            SaleItemResponse(
                id=sale_item.id,
                product_id=product.id,
                product_name=product.name,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price,
                total_price=total_price
            )
        )

    await db.commit()
    await db.refresh(sale)

    resp = SaleResponse(
        id=sale.id,
        tenant_id=sale.tenant_id,
        branch_id=sale.branch_id,
        cashier_id=sale.cashier_id,
        cashier_name=current_user.full_name,
        receipt_number=sale.receipt_number,
        subtotal=sale.subtotal,
        discount=sale.discount,
        tax_amount=sale.tax_amount,
        total_amount=sale.total_amount,
        payment_method=sale.payment_method,
        payment_status=sale.payment_status,
        created_at=sale.created_at,
        items=sale_items_response
    )
    return resp


@router.get("/history", response_model=List[SaleResponse])
async def get_sales_history(
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = (
        select(Sale)
        .where(Sale.tenant_id == current_user.tenant_id)
        .order_by(desc(Sale.created_at))
        .limit(limit)
    )
    res = await db.execute(stmt)
    sales = res.scalars().all()

    sales_list: List[SaleResponse] = []
    for sale in sales:
        sales_list.append(
            SaleResponse(
                id=sale.id,
                tenant_id=sale.tenant_id,
                branch_id=sale.branch_id,
                cashier_id=sale.cashier_id,
                cashier_name="Cashier",
                receipt_number=sale.receipt_number,
                subtotal=sale.subtotal,
                discount=sale.discount,
                tax_amount=sale.tax_amount,
                total_amount=sale.total_amount,
                payment_method=sale.payment_method,
                payment_status=sale.payment_status,
                created_at=sale.created_at,
                items=[]
            )
        )

    return sales_list
