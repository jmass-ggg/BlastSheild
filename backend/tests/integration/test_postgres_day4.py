import os

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import DBAPIError

ANALYSIS_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_DATABASE_URL")
APP_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_APP_DATABASE_URL")
EXECUTION_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_EXECUTION_DATABASE_URL")
pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        not all([ANALYSIS_DATABASE_URL, APP_DATABASE_URL, EXECUTION_DATABASE_URL]),
        reason="Day 4 database URLs are not configured",
    ),
]


def test_database_role_security_matrix() -> None:
    analyzer = create_engine(ANALYSIS_DATABASE_URL)
    app = create_engine(APP_DATABASE_URL)
    executor = create_engine(EXECUTION_DATABASE_URL)
    try:
        with analyzer.connect() as connection:
            assert connection.execute(text("SELECT current_user")).scalar_one() == (
                "blastshield_analyzer"
            )
            connection.execute(text("EXPLAIN SELECT COUNT(*) FROM users"))
        with pytest.raises(DBAPIError):
            with analyzer.begin() as connection:
                connection.execute(text("CREATE TABLE forbidden_table (id BIGINT)"))

        with app.connect() as connection:
            assert connection.execute(text("SELECT current_user")).scalar_one() == (
                "blastshield_app"
            )
            connection.execute(text("SELECT COUNT(*) FROM blastshield_control.analyses"))
        with pytest.raises(DBAPIError):
            with app.connect() as connection:
                connection.execute(text("SELECT COUNT(*) FROM users"))

        with executor.connect() as connection:
            assert connection.execute(text("SELECT current_user")).scalar_one() == (
                "blastshield_executor"
            )
            connection.execute(text("UPDATE users SET full_name = full_name WHERE id = -1"))
        with pytest.raises(DBAPIError):
            with executor.connect() as connection:
                connection.execute(
                    text("UPDATE blastshield_control.analyses SET status = status")
                )
    finally:
        analyzer.dispose()
        app.dispose()
        executor.dispose()
