import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError


def test_analyzer_role_security_boundaries(analyzer_engine):
    """Verify blastshield_analyzer is strictly read-only on public and has NO access to control plane."""
    with analyzer_engine.connect() as conn:
        assert conn.execute(text("SELECT current_user")).scalar_one() == "blastshield_analyzer"
        # Allowed: SELECT from public tables
        assert conn.execute(text("SELECT COUNT(*) FROM public.users")).scalar_one() == 100
        assert conn.execute(text("SELECT COUNT(*) FROM public.orders")).scalar_one() == 250

    # Forbidden: INSERT in public
    with pytest.raises(DBAPIError):  # noqa: SIM117 — pytest.raises must wrap the engine block; combining would break assertion
        with analyzer_engine.begin() as conn:
            conn.execute(text("INSERT INTO public.users (email, full_name, last_login) VALUES ('x@x.test', 'X', NOW())"))

    # Forbidden: UPDATE in public
    with pytest.raises(DBAPIError), analyzer_engine.begin() as conn:
        conn.execute(text("UPDATE public.users SET full_name = 'hacked' WHERE id = 1"))

    # Forbidden: DELETE in public
    with pytest.raises(DBAPIError), analyzer_engine.begin() as conn:
        conn.execute(text("DELETE FROM public.users WHERE id = 1"))

    # Forbidden: SELECT from blastshield_control
    with pytest.raises(DBAPIError), analyzer_engine.connect() as conn:
        conn.execute(text("SELECT * FROM blastshield_control.analyses"))

    # Forbidden: DDL
    with pytest.raises(DBAPIError), analyzer_engine.begin() as conn:
        conn.execute(text("CREATE TABLE public.bad_table (id INT)"))


def test_app_role_security_boundaries(app_engine):
    """Verify blastshield_app can only access control plane and CANNOT access domain tables."""
    with app_engine.connect() as conn:
        assert conn.execute(text("SELECT current_user")).scalar_one() == "blastshield_app"
        # Allowed: SELECT / INSERT in blastshield_control
        assert conn.execute(text("SELECT COUNT(*) FROM blastshield_control.analyses")).scalar_one() >= 0

    # Forbidden: SELECT from public.users
    with pytest.raises(DBAPIError), app_engine.connect() as conn:
        conn.execute(text("SELECT * FROM public.users"))

    # Forbidden: INSERT into public.users
    with pytest.raises(DBAPIError):  # noqa: SIM117 — pytest.raises must wrap the engine block; combining would break assertion
        with app_engine.begin() as conn:
            conn.execute(text("INSERT INTO public.users (email, full_name, last_login) VALUES ('x@x.test', 'X', NOW())"))

    # Forbidden: DELETE from public.users
    with pytest.raises(DBAPIError), app_engine.begin() as conn:
        conn.execute(text("DELETE FROM public.users WHERE id = 1"))


def test_executor_role_security_boundaries(execution_engine):
    """Verify blastshield_executor can execute domain changes but CANNOT access control plane."""
    with execution_engine.connect() as conn:
        assert conn.execute(text("SELECT current_user")).scalar_one() == "blastshield_executor"
        # Allowed: SELECT/UPDATE/DELETE in public
        assert conn.execute(text("SELECT COUNT(*) FROM public.users")).scalar_one() == 100

    # Forbidden: SELECT from blastshield_control
    with pytest.raises(DBAPIError), execution_engine.connect() as conn:
        conn.execute(text("SELECT * FROM blastshield_control.analyses"))

    # Forbidden: UPDATE in blastshield_control
    with pytest.raises(DBAPIError):  # noqa: SIM117 — pytest.raises must wrap the engine block; combining would break assertion
        with execution_engine.begin() as conn:
            conn.execute(text("UPDATE blastshield_control.analyses SET status = 'EXECUTED'"))
