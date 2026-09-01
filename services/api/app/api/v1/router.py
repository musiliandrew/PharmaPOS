from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, inventory, sales, analytics, suppliers, customers

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(products.router, prefix="/products", tags=["Products Catalog"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory & FEFO Batches"])
api_router.include_router(sales.router, prefix="/sales", tags=["POS Sales & Receipts"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Dashboard Analytics & AI Tools"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Supplier Directory"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customer Directory"])

