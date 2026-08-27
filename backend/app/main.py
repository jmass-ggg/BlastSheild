from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.core.config import get_settings
from app.core.errors import BlastShieldError
from app.core.logging import configure_logging

configure_logging()
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="BlastShield Day 1 backend foundation",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(health_router, prefix=settings.api_prefix)


@app.exception_handler(BlastShieldError)
async def blastshield_error_handler(
    _request: Request, error: BlastShieldError
) -> JSONResponse:
    body: dict[str, object] = {"code": error.code, "message": error.message}
    if error.details:
        body["details"] = error.details
    return JSONResponse(status_code=error.status_code, content=body)

