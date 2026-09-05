import re
import uuid
import base64
import logging
from typing import Optional, Dict, Any
from decimal import Decimal
import httpx
from app.core.config import settings

logger = logging.getLogger("payhero")


class PayHeroService:
    @staticmethod
    def normalize_phone(phone: str) -> str:
        """
        Normalize Kenyan phone numbers to format: 254XXXXXXXXX
        Supports 07..., 01..., +254..., 254...
        """
        cleaned = re.sub(r"[^\d+]", "", phone.strip())
        if cleaned.startswith("+254"):
            cleaned = cleaned[1:]
        elif cleaned.startswith("0") and len(cleaned) == 10:
            cleaned = "254" + cleaned[1:]
        elif cleaned.startswith("7") or cleaned.startswith("1"):
            if len(cleaned) == 9:
                cleaned = "254" + cleaned

        if not re.match(r"^254[17]\d{8}$", cleaned):
            raise ValueError(f"Invalid Kenyan phone number format: {phone}. Expected 07XX... or 01XX...")
        return cleaned

    @classmethod
    async def initiate_stk_push(
        cls,
        phone_number: str,
        amount: Decimal | float | int,
        channel_id: str | int,
        external_reference: str,
        customer_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate an M-Pesa STK Push through Pay Hero API.
        Routes payment directly into the pharmacy's channel_id (Till or Paybill).
        """
        normalized_phone = cls.normalize_phone(phone_number)
        int_amount = max(1, int(round(float(amount))))

        # If credentials are not set, simulate STK push in dev/sandbox
        if not settings.PAYHERO_API_USERNAME or not settings.PAYHERO_API_PASSWORD:
            logger.info("PayHero credentials not configured in settings. Simulating STK push for %s", normalized_phone)
            mock_checkout_id = f"PH_SIM_{uuid.uuid4().hex[:12]}"
            return {
                "success": True,
                "simulated": True,
                "checkout_request_id": mock_checkout_id,
                "reference": external_reference,
                "status": "QUEUED",
                "message": f"Simulated STK Push queued for {normalized_phone} (Channel {channel_id}, KES {int_amount})"
            }

        endpoint = f"{settings.PAYHERO_API_URL.rstrip('/')}/payments/initiate-stk-push"
        callback_url = f"{settings.PUBLIC_BACKEND_URL.rstrip('/')}/api/v1/sales/payhero-callback"

        payload = {
            "amount": int_amount,
            "phone_number": normalized_phone,
            "channel_id": str(channel_id),
            "provider": "m-pesa",
            "external_reference": external_reference,
            "customer_name": customer_name or "Walk-in Customer",
            "callback_url": callback_url
        }

        auth = (settings.PAYHERO_API_USERNAME, settings.PAYHERO_API_PASSWORD)

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(endpoint, json=payload, auth=auth)
                res_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}

                if response.status_code in [200, 201] and res_data.get("status") in ["Success", "QUEUED", "PENDING", True]:
                    return {
                        "success": True,
                        "simulated": False,
                        "checkout_request_id": res_data.get("reference") or res_data.get("CheckoutRequestID") or str(uuid.uuid4()),
                        "reference": external_reference,
                        "status": "QUEUED",
                        "message": res_data.get("message", "STK push initiated successfully.")
                    }
                else:
                    error_msg = res_data.get("message") or res_data.get("error") or response.text or "STK Push failed"
                    logger.error("PayHero STK push error: %s (Status: %s)", error_msg, response.status_code)
                    return {
                        "success": False,
                        "simulated": False,
                        "status": "FAILED",
                        "error": error_msg
                    }
        except httpx.RequestError as exc:
            logger.error("PayHero network error during STK push: %s", exc)
            return {
                "success": False,
                "simulated": False,
                "status": "FAILED",
                "error": f"Failed to connect to PayHero: {str(exc)}"
            }
