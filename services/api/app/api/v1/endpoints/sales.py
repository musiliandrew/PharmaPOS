import random
import string
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import (
    User, Product, Sale, SaleItem, SalePaymentStatus, Customer,
    Branch, Tenant, MpesaTransaction, MpesaStatus
)
from app.schemas.sales import (
    POSCheckoutRequest, SaleResponse, SaleItemResponse, SalesSummary,
    STKPushRequest, STKPushResponse, SaleStatusResponse
)
from app.services.fefo import FEFOEngine
from app.services.payhero import PayHeroService
from app.core.security import decrypt_value

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


@router.post("/initiate-stk", response_model=STKPushResponse, status_code=status.HTTP_201_CREATED)
async def initiate_stk_checkout(
    data: STKPushRequest,
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

    # 1. Fetch branch payment configurations
    stmt = select(Branch).where(Branch.id == current_user.branch_id)
    res = await db.execute(stmt)
    branch = res.scalar_one_or_none()

    channel_id = None
    if branch and branch.payment_payhero_channel_id:
        channel_id = decrypt_value(branch.payment_payhero_channel_id)

    # Fallback to tenant-level channel_id if not set at branch
    if not channel_id:
        t_stmt = select(Tenant).where(Tenant.id == current_user.tenant_id)
        t_res = await db.execute(t_stmt)
        tenant = t_res.scalar_one_or_none()
        if tenant and tenant.payment_payhero_channel_id:
            channel_id = decrypt_value(tenant.payment_payhero_channel_id) or tenant.payment_payhero_channel_id

    # Fallback for sandbox / testing if not yet configured
    if not channel_id:
        channel_id = "sandbox"

    subtotal = sum(item.quantity * item.unit_price for item in data.items)
    tax_amount = Decimal("0.00")
    total_amount = max(Decimal("1.00"), subtotal - data.discount + tax_amount)
    receipt_num = generate_receipt_number()

    # Create pending sale record
    sale = Sale(
        tenant_id=current_user.tenant_id,
        branch_id=current_user.branch_id,
        cashier_id=current_user.id,
        receipt_number=receipt_num,
        subtotal=subtotal,
        discount=data.discount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method="M-Pesa",
        payment_status=SalePaymentStatus.PENDING
    )
    db.add(sale)
    await db.flush()

    # Record sale items
    for item in data.items:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item.product_id,
            unit_price=item.unit_price,
            quantity=item.quantity,
            total_price=item.quantity * item.unit_price
        )
        db.add(sale_item)
    await db.flush()

    # 2. Trigger PayHero STK Push
    try:
        push_result = await PayHeroService.initiate_stk_push(
            phone_number=data.phone_number,
            amount=total_amount,
            channel_id=channel_id,
            external_reference=receipt_num,
            customer_name=data.customer_name
        )
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"M-Pesa initiation error: {str(exc)}"
        )

    if not push_result.get("success"):
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=push_result.get("error") or "Failed to initiate M-Pesa STK push."
        )

    # 3. Create M-Pesa transaction record
    mpesa_tx = MpesaTransaction(
        tenant_id=current_user.tenant_id,
        sale_id=sale.id,
        checkout_request_id=push_result.get("checkout_request_id") or str(uuid.uuid4()),
        merchant_request_id=receipt_num,
        provider="PAYHERO",
        channel_id=str(channel_id),
        phone_number=data.phone_number,
        amount=total_amount,
        status=MpesaStatus.PENDING
    )
    db.add(mpesa_tx)
    await db.commit()

    return STKPushResponse(
        sale_id=sale.id,
        receipt_number=receipt_num,
        total_amount=total_amount,
        phone_number=data.phone_number,
        status="STK_PUSH_SENT",
        message=push_result.get("message", "STK push sent to customer phone."),
        simulated=push_result.get("simulated", False)
    )


@router.post("/payhero-callback")
async def payhero_callback(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Pay Hero Webhook Receiver: Handles real-time transaction confirmations.
    """
    data = payload.get("response", payload)
    external_ref = data.get("external_reference") or data.get("reference")
    payhero_status = str(data.get("status", "")).upper()
    mpesa_receipt = data.get("mpesa_reference") or data.get("MpesaReceiptNumber") or data.get("receipt_number") or data.get("code")

    if not external_ref:
        return {"status": "ignored", "reason": "No external reference provided"}

    stmt = select(Sale).where(Sale.receipt_number == external_ref)
    res = await db.execute(stmt)
    sale = res.scalar_one_or_none()

    if not sale:
        return {"status": "ignored", "reason": f"Sale {external_ref} not found"}

    if payhero_status in ["SUCCESS", "PAID", "COMPLETED", "TRUE"]:
        if sale.payment_status != SalePaymentStatus.PAID:
            sale.payment_status = SalePaymentStatus.PAID

            # Execute FEFO deduction
            items_stmt = select(SaleItem).where(SaleItem.sale_id == sale.id)
            items_res = await db.execute(items_stmt)
            for item in items_res.scalars().all():
                deductions = await FEFOEngine.deduct_stock_fefo(
                    db=db,
                    tenant_id=sale.tenant_id,
                    branch_id=sale.branch_id,
                    product_id=item.product_id,
                    required_quantity=item.quantity,
                    user_id=sale.cashier_id,
                    reference_id=sale.receipt_number
                )
                if deductions:
                    item.batch_id = deductions[0][0]

            # Update transaction
            tx_stmt = select(MpesaTransaction).where(MpesaTransaction.sale_id == sale.id)
            tx_res = await db.execute(tx_stmt)
            tx = tx_res.scalar_one_or_none()
            if tx:
                tx.status = MpesaStatus.SUCCESS
                tx.mpesa_receipt_number = mpesa_receipt or "PAYHERO-OK"
                tx.raw_callback_payload = payload

            await db.commit()
    elif payhero_status in ["FAILED", "CANCELLED", "TIMEOUT"]:
        sale.payment_status = SalePaymentStatus.FAILED
        tx_stmt = select(MpesaTransaction).where(MpesaTransaction.sale_id == sale.id)
        tx_res = await db.execute(tx_stmt)
        tx = tx_res.scalar_one_or_none()
        if tx:
            tx.status = MpesaStatus.FAILED
            tx.raw_callback_payload = payload
        await db.commit()

    return {"status": "ok", "message": "Callback processed"}


@router.get("/{sale_id}/status", response_model=SaleStatusResponse)
async def get_sale_status(
    sale_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Sale).where(Sale.id == sale_id, Sale.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    sale = res.scalar_one_or_none()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found.")

    tx_stmt = select(MpesaTransaction).where(MpesaTransaction.sale_id == sale.id)
    tx_res = await db.execute(tx_stmt)
    tx = tx_res.scalar_one_or_none()

    return SaleStatusResponse(
        sale_id=sale.id,
        receipt_number=sale.receipt_number,
        payment_status=sale.payment_status,
        is_paid=(sale.payment_status == SalePaymentStatus.PAID),
        total_amount=sale.total_amount,
        mpesa_receipt=tx.mpesa_receipt_number if tx else None
    )


@router.post("/{sale_id}/confirm-manual", response_model=SaleResponse)
async def confirm_sale_manual(
    sale_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Sale).where(Sale.id == sale_id, Sale.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    sale = res.scalar_one_or_none()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found.")

    if sale.payment_status != SalePaymentStatus.PAID:
        sale.payment_status = SalePaymentStatus.PAID

        # Execute FEFO deduction
        items_stmt = select(SaleItem).where(SaleItem.sale_id == sale.id)
        items_res = await db.execute(items_stmt)
        for item in items_res.scalars().all():
            deductions = await FEFOEngine.deduct_stock_fefo(
                db=db,
                tenant_id=sale.tenant_id,
                branch_id=sale.branch_id,
                product_id=item.product_id,
                required_quantity=item.quantity,
                user_id=current_user.id,
                reference_id=sale.receipt_number
            )
            if deductions:
                item.batch_id = deductions[0][0]

        tx_stmt = select(MpesaTransaction).where(MpesaTransaction.sale_id == sale.id)
        tx_res = await db.execute(tx_stmt)
        tx = tx_res.scalar_one_or_none()
        if tx:
            tx.status = MpesaStatus.SUCCESS
            tx.mpesa_receipt_number = f"MANUAL-{current_user.full_name[:4].upper()}"

        await db.commit()
        await db.refresh(sale)

    # Fetch items for response
    items_stmt = select(SaleItem).where(SaleItem.sale_id == sale.id)
    items_res = await db.execute(items_stmt)
    items = items_res.scalars().all()

    items_resp = []
    for it in items:
        p_stmt = select(Product).where(Product.id == it.product_id)
        p_res = await db.execute(p_stmt)
        p = p_res.scalar_one_or_none()
        items_resp.append(
            SaleItemResponse(
                id=it.id,
                product_id=it.product_id,
                product_name=p.name if p else "Medicine",
                quantity=it.quantity,
                unit_price=it.unit_price,
                total_price=it.total_price
            )
        )

    return SaleResponse(
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
        items=items_resp
    )
