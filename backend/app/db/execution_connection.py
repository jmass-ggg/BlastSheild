from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache

from sqlalchemy import Connection, Engine, create_engine

from app.core.config import ExecutionSettings, get_execution_settings


@lru_cache
def get_execution_engine() -> Engine:
    return create_engine(
        get_execution_settings().execution_database_url,
        pool_pre_ping=True,
        pool_size=2,
        max_overflow=2,
    )


@contextmanager
def execution_transaction(
    engine: Engine | None = None,
    *,
    settings: ExecutionSettings | None = None,
) -> Iterator[Connection]:
    selected_engine = engine or get_execution_engine()
    selected_settings = settings or get_execution_settings()
    with selected_engine.connect() as connection:
        with connection.begin():
            connection.exec_driver_sql(
                "SET LOCAL statement_timeout = "
                f"{selected_settings.execution_statement_timeout_ms}"
            )
            connection.exec_driver_sql(
                f"SET LOCAL lock_timeout = {selected_settings.execution_lock_timeout_ms}"
            )
            yield connection

