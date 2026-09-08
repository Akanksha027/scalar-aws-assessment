from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .routers import auth, hosted_zones, records
from .seed import seed_demo_user

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(hosted_zones.router, prefix="/api/v1")
app.include_router(records.router, prefix="/api/v1")


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed_demo_user()


@app.get("/health")
def health():
    return {"status": "ok"}
