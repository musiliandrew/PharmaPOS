from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class MetricItem(BaseModel):
    label: str
    value: str
    raw_number: Decimal
    change: str
    positive: bool


class ExpirySummaryItem(BaseModel):
    product_name: str
    batch_number: str
    expiry_date: str
    quantity: int
    status: str


class DashboardResponse(BaseModel):
    todays_sales: MetricItem
    transactions_count: MetricItem
    mpesa_volume: MetricItem
    gross_profit: MetricItem
    payment_breakdown: Dict[str, Decimal]
    sales_trend_7_days: List[Dict[str, Any]]
    expiry_watch: List[ExpirySummaryItem]
    low_stock_count: int


class AIQueryRequest(BaseModel):
    prompt: str


class AIQueryResponse(BaseModel):
    answer: str
    tool_used: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class PaymentSettingsUpdate(BaseModel):
    paybill: Optional[str] = None
    till: Optional[str] = None
    payhero_channel_id: Optional[str] = None
    bank_name: Optional[str] = None
    bank_acct: Optional[str] = None
    preferred_method: Optional[str] = "PAYBILL"


class PaymentSettingsResponse(BaseModel):
    paybill: Optional[str] = None
    till: Optional[str] = None
    payhero_channel_id: Optional[str] = None
    bank_name: Optional[str] = None
    bank_acct: Optional[str] = None
    preferred_method: Optional[str] = "PAYBILL"

