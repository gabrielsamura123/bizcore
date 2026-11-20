import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.endpoints.receipt_settings import UPLOAD_DIR
from app.api.v1.router import router as v1_router
from app.scripts.seed_expenses import seed_expenses
from app.scripts.seed_features import seed_features
from app.scripts.seed_pending_businesses import seed_pending_businesses
from app.scripts.seed_products import seed_products

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        seed_features()
        seed_products()
        seed_expenses()
        seed_pending_businesses()
    except Exception:
        logger.exception("Demo seed skipped during startup")
    yield


app = FastAPI(title="BizCore API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.include_router(v1_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "bizcore-api"}
