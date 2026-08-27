import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.analyses import router as analyses_router
from app.api.analyze import router as analyze_router
from app.api.approvals import router as approvals_router
from app.api.execution import router as execution_router
from app.api.health import router as health_router
from app.core.config import get_settings
from app.core.errors import BlastShieldError
from app.core.logging import configure_logging

configure_logging()
settings = get_settings()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version="0.4.0",
    description="BlastShield destructive SQL impact analysis gateway",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(analyze_router, prefix=settings.api_prefix)
app.include_router(analyses_router, prefix=settings.api_prefix)
app.include_router(approvals_router, prefix=settings.api_prefix)
app.include_router(execution_router, prefix=settings.api_prefix)


@app.exception_handler(BlastShieldError)
async def blastshield_error_handler(
    _request: Request, error: BlastShieldError
) -> JSONResponse:
    body: dict[str, object] = {"code": error.code, "message": error.message}
    if error.details:
        body["details"] = error.details
    return JSONResponse(status_code=error.status_code, content=body)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    _request: Request, _error: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "code": "VALIDATION_ERROR",
            "message": "The request payload is invalid.",
        },
    )


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(
    _request: Request, error: SQLAlchemyError
) -> JSONResponse:
    logger.error("event=database_error error_type=%s", type(error).__name__)
    return JSONResponse(
        status_code=503,
        content={
            "code": "DATABASE_UNAVAILABLE",
            "message": "A required database operation is unavailable.",
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(
    _request: Request, error: StarletteHTTPException
) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={
            "code": "NOT_FOUND" if error.status_code == 404 else "HTTP_ERROR",
            "message": str(error.detail),
        },
    )


@app.exception_handler(Exception)
async def unexpected_error_handler(
    _request: Request, error: Exception
) -> JSONResponse:
    logger.error("event=unexpected_error error_type=%s", type(error).__name__)
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "An unexpected backend error occurred.",
        },
    )
