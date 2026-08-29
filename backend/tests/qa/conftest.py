import os
import pytest
from collections.abc import Iterator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import ExecutionSettings, Settings, get_execution_settings, get_settings
from app.db.app_database import get_app_engine, get_session_factory
from app.db.analysis_connection import get_analysis_engine
from app.db.execution_connection import get_execution_engine
from app.main import app

POSTGRES_PORT = os.getenv("POSTGRES_PORT", "55432")

TEST_ANALYSIS_URL = (
    f"postgresql+psycopg://blastshield_analyzer:analyzer_demo_password@localhost:{POSTGRES_PORT}/blastshield"
)
TEST_APP_URL = (
    f"postgresql+psycopg://blastshield_app:app_demo_password@localhost:{POSTGRES_PORT}/blastshield"
)
TEST_EXECUTION_URL = (
    f"postgresql+psycopg://blastshield_executor:executor_demo_password@localhost:{POSTGRES_PORT}/blastshield"
)
TEST_ADMIN_URL = (
    f"postgresql+psycopg://postgres:postgres_demo_password@localhost:{POSTGRES_PORT}/blastshield"
)


@pytest.fixture(scope="session")
def admin_engine():
    engine = create_engine(TEST_ADMIN_URL, pool_pre_ping=True)
    yield engine
    engine.dispose()


@pytest.fixture(scope="session")
def analyzer_engine():
    engine = create_engine(TEST_ANALYSIS_URL, pool_pre_ping=True)
    yield engine
    engine.dispose()


@pytest.fixture(scope="session")
def app_engine():
    engine = create_engine(TEST_APP_URL, pool_pre_ping=True)
    yield engine
    engine.dispose()


@pytest.fixture(scope="session")
def execution_engine():
    engine = create_engine(TEST_EXECUTION_URL, pool_pre_ping=True)
    yield engine
    engine.dispose()


@pytest.fixture(autouse=True)
def reset_database(admin_engine):
    """Resets public tables and blastshield_control.analyses to standard initial seed."""
    with admin_engine.begin() as conn:
        conn.execute(text("TRUNCATE public.users CASCADE;"))
        conn.execute(text("ALTER SEQUENCE public.users_id_seq RESTART WITH 1;"))
        conn.execute(text("ALTER SEQUENCE public.orders_id_seq RESTART WITH 1;"))
        conn.execute(text("ALTER SEQUENCE public.payments_id_seq RESTART WITH 1;"))
        conn.execute(text("ALTER SEQUENCE public.subscriptions_id_seq RESTART WITH 1;"))
        conn.execute(text("ALTER SEQUENCE public.sessions_id_seq RESTART WITH 1;"))
        
        # Read seed file
        seed_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "..", "database", "init", "10_seed.sql"
        )
        if os.path.exists(seed_path):
            with open(seed_path, "r") as f:
                conn.execute(text(f.read()))
    yield


@pytest.fixture(autouse=True)
def setup_qa_environment():
    os.environ["BLASTSHIELD_ANALYSIS_DATABASE_URL"] = TEST_ANALYSIS_URL
    os.environ["BLASTSHIELD_APP_DATABASE_URL"] = TEST_APP_URL
    os.environ["BLASTSHIELD_EXECUTION_DATABASE_URL"] = TEST_EXECUTION_URL
    get_settings.cache_clear()
    get_execution_settings.cache_clear()
    get_analysis_engine.cache_clear()
    get_app_engine.cache_clear()
    get_execution_engine.cache_clear()
    get_session_factory.cache_clear()
    yield
    get_settings.cache_clear()
    get_execution_settings.cache_clear()
    get_analysis_engine.cache_clear()
    get_app_engine.cache_clear()
    get_execution_engine.cache_clear()
    get_session_factory.cache_clear()


@pytest.fixture
def qa_client() -> Iterator[TestClient]:
    with TestClient(app) as client:
        yield client
