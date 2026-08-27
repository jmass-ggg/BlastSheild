import logging
from typing import Any


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def log_lifecycle(
    logger: logging.Logger,
    *,
    analysis_id: Any,
    event: str,
    status_before: str | None = None,
    status_after: str | None = None,
    duration_ms: float | None = None,
    measurement_mode: str | None = None,
    error_code: str | None = None,
) -> None:
    fields = {
        "analysis_id": analysis_id,
        "event": event,
        "status_before": status_before,
        "status_after": status_after,
        "duration_ms": round(duration_ms, 2) if duration_ms is not None else None,
        "measurement_mode": measurement_mode,
        "error_code": error_code,
    }
    logger.info(
        " ".join(
            f"{key}={value}" for key, value in fields.items() if value is not None
        )
    )
