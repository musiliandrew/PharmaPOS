from datetime import datetime, timedelta
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Branch
from app.core.security import encrypt_value, decrypt_value
from app.schemas.analytics import (
    DashboardResponse, MetricItem, ExpirySummaryItem, AIQueryRequest, 
    AIQueryResponse, PaymentSettingsResponse, PaymentSettingsUpdate
)
from app.services.analytics import AnalyticsService

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sales_data = await AnalyticsService.get_todays_sales_summary(db, current_user.tenant_id)
    exp_items = await AnalyticsService.get_expiring_stock(db, current_user.tenant_id, days=60)
    low_stock = await AnalyticsService.get_low_stock_items(db, current_user.tenant_id)

    formatted_exp = [
        ExpirySummaryItem(
            product_name=item["product_name"],
            batch_number=item["batch_number"],
            expiry_date=item["expiry_date"],
            quantity=item["quantity"],
            status=item["status"]
        )
        for item in exp_items[:5]
    ]

    return DashboardResponse(
        todays_sales=MetricItem(
            label="Today's sales",
            value=f"KES {sales_data['total_sales']:,.2f}",
            raw_number=sales_data['total_sales'],
            change="12.5%",
            positive=True
        ),
        transactions_count=MetricItem(
            label="Transactions",
            value=str(sales_data['transaction_count']),
            raw_number=Decimal(sales_data['transaction_count']),
            change="8.2%",
            positive=True
        ),
        mpesa_volume=MetricItem(
            label="M-Pesa volume",
            value=f"KES {sales_data['mpesa_volume']:,.2f}",
            raw_number=sales_data['mpesa_volume'],
            change="18.4%",
            positive=True
        ),
        gross_profit=MetricItem(
            label="Gross profit",
            value=f"KES {sales_data['gross_profit']:,.2f}",
            raw_number=sales_data['gross_profit'],
            change="6.8%",
            positive=True
        ),
        payment_breakdown=sales_data["payment_breakdown"],
        sales_trend_7_days=[
            {"day": "Mon", "sales": 15000},
            {"day": "Tue", "sales": 22000},
            {"day": "Wed", "sales": 18000},
            {"day": "Thu", "sales": 31000},
            {"day": "Fri", "sales": 28000},
            {"day": "Sat", "sales": 42000},
            {"day": "Sun", "sales": 35000},
        ],
        expiry_watch=formatted_exp,
        low_stock_count=len(low_stock)
    )


@router.post("/ai/query", response_model=AIQueryResponse)
async def process_ai_assistant_query(
    body: AIQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prompt_lower = body.prompt.lower()
    
    if any(k in prompt_lower for k in ["expir", "expire", "expiry"]):
        items = await AnalyticsService.get_expiring_stock(db, current_user.tenant_id)
        if not items:
            answer = "Great news! You currently have no stock expiring within the next 60 days."
        else:
            answer = f"You have {len(items)} batch(es) approaching expiry. Top critical item: {items[0]['product_name']} (Batch {items[0]['batch_number']}) expiring on {items[0]['expiry_date']}."
        return AIQueryResponse(answer=answer, tool_used="get_expiring_stock_report", data={"expiring_batches": items})

    elif any(k in prompt_lower for k in ["low stock", "reorder", "running low"]):
        low_items = await AnalyticsService.get_low_stock_items(db, current_user.tenant_id)
        if not low_items:
            answer = "All inventory items are currently well above reorder levels."
        else:
            answer = f"There are {len(low_items)} product(s) below reorder levels that require restock: {', '.join(i['product_name'] for i in low_items)}."
        return AIQueryResponse(answer=answer, tool_used="get_low_stock_items", data={"low_stock_items": low_items})

    else:
        sales_summary = await AnalyticsService.get_todays_sales_summary(db, current_user.tenant_id)
        answer = f"Today's total sales stand at KES {sales_summary['total_sales']:,.2f} across {sales_summary['transaction_count']} transaction(s). M-Pesa volume is KES {sales_summary['mpesa_volume']:,.2f} and gross profit is KES {sales_summary['gross_profit']:,.2f}."
        return AIQueryResponse(answer=answer, tool_used="get_daily_sales_summary", data=sales_summary)


@router.get("/settings/payments", response_model=PaymentSettingsResponse)
async def get_payment_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.branch_id:
        return PaymentSettingsResponse()
    
    stmt = select(Branch).where(Branch.id == current_user.branch_id)
    res = await db.execute(stmt)
    branch = res.scalar_one_or_none()
    
    if not branch:
        return PaymentSettingsResponse()
        
    return PaymentSettingsResponse(
        paybill=decrypt_value(branch.payment_paybill),
        till=decrypt_value(branch.payment_till),
        payhero_channel_id=decrypt_value(branch.payment_payhero_channel_id),
        bank_name=branch.payment_bank_name,
        bank_acct=decrypt_value(branch.payment_bank_acct),
        preferred_method=branch.payment_preferred_method or "PAYBILL"
    )


@router.post("/settings/payments")
async def update_payment_settings(
    payload: PaymentSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.branch_id:
        raise HTTPException(status_code=400, detail="User is not associated with a branch.")
        
    stmt = select(Branch).where(Branch.id == current_user.branch_id)
    res = await db.execute(stmt)
    branch = res.scalar_one_or_none()
    
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found.")
        
    branch.payment_paybill = encrypt_value(payload.paybill) if payload.paybill else None
    branch.payment_till = encrypt_value(payload.till) if payload.till else None
    branch.payment_payhero_channel_id = encrypt_value(payload.payhero_channel_id) if payload.payhero_channel_id else None
    branch.payment_bank_name = payload.bank_name
    branch.payment_bank_acct = encrypt_value(payload.bank_acct) if payload.bank_acct else None
    branch.payment_preferred_method = payload.preferred_method or "PAYBILL"
    
    await db.commit()
    return {"message": "Payment settings updated successfully"}
