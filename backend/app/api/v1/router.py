from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.businesses import router as businesses_router
from app.api.v1.endpoints.expenses import router as expenses_router
from app.api.v1.endpoints.members import router as members_router
from app.api.v1.endpoints.products import router as products_router
from app.api.v1.endpoints.receipt_settings import router as receipt_settings_router
from app.api.v1.endpoints.sales import router as sales_router
from app.core.config import settings
from app.core.database import get_db

router = APIRouter(prefix=settings.API_V1_PREFIX, tags=["v1"])
router.include_router(auth_router)
router.include_router(businesses_router)
router.include_router(members_router)
router.include_router(products_router)
router.include_router(receipt_settings_router)
router.include_router(sales_router)
router.include_router(expenses_router)
router.include_router(analytics_router)
router.include_router(admin_router)


@router.get("/health/db")
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected"},
        )
