from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache

from sqlalchemy import Connection, Engine, create_engine

from app.core.config import get_settings


@lru_cache
def get_analysis_engine() -> Engine:
    settings = get_settings()
    return create_engine(
        settings.analysis_database_url,
        pool_pre_ping=True,
    )


@contextmanager
def analysis_transaction(engine: Engine | None = None) -> Iterator[Connection]:
    """Open a defense-in-depth read-only analysis transaction."""
    settings = get_settings()
    selected_engine = engine or get_analysis_engine()

    with selected_engine.connect() as connection, connection.begin():
        connection.exec_driver_sql("SET TRANSACTION READ ONLY")
        connection.exec_driver_sql(
            f"SET LOCAL statement_timeout = {settings.statement_timeout_ms}"
        )
        connection.exec_driver_sql(
            f"SET LOCAL lock_timeout = {settings.lock_timeout_ms}"
        )
        yield connection
