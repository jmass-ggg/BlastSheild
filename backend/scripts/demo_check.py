"""Non-destructive preflight for the local BlastShield demo."""

import json
import os
import sys
import urllib.request
from typing import Any

from sqlalchemy import create_engine, text


EXPECTED_COUNTS = {
    "users": 100,
    "orders": 250,
    "payments": 250,
    "subscriptions": 50,
    "sessions": 80,
}
DEMO_SQL = "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';"


class CheckFailed(RuntimeError):
    pass


def local_database_url(role: str, password: str) -> str:
    port = os.getenv("POSTGRES_PORT", "5432")
    return f"postgresql+psycopg://{role}:{password}@localhost:{port}/blastshield"


def request_json(
    method: str, url: str, payload: dict[str, Any] | None = None
) -> dict[str, Any]:
    body = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(
        url,
        data=body,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


def verify_role(url: str, expected_role: str) -> None:
    engine = create_engine(url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            actual = connection.execute(text("SELECT current_user")).scalar_one()
        if actual != expected_role:
            raise CheckFailed(f"Expected database role {expected_role}, got {actual}.")
    finally:
        engine.dispose()


def verify_fixture(analysis_url: str) -> None:
    engine = create_engine(analysis_url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            actual = {
                table: int(
                    connection.execute(
                        text(f"SELECT COUNT(*) FROM public.{table}")
                    ).scalar_one()
                )
                for table in EXPECTED_COUNTS
            }
        if actual != EXPECTED_COUNTS:
            raise CheckFailed(
                f"Demo fixture counts changed: expected {EXPECTED_COUNTS}, got {actual}."
            )
    finally:
        engine.dispose()


def verify_no_active_claims(app_url: str) -> None:
    engine = create_engine(app_url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            claims = int(
                connection.execute(
                    text(
                        "SELECT COUNT(*) FROM blastshield_control.analyses "
                        "WHERE status = 'APPROVED' "
                        "AND execution_claimed_at IS NOT NULL"
                    )
                ).scalar_one()
            )
        if claims:
            raise CheckFailed(
                "An approved analysis has already been claimed; use a new analysis "
                "or reconcile the old claim before the demo."
            )
    finally:
        engine.dispose()


def verify_api(api_url: str) -> str:
    health = request_json("GET", f"{api_url}/api/v1/health")
    if health.get("status") != "ok":
        raise CheckFailed("Backend health did not return status=ok.")

    report = request_json(
        "POST",
        f"{api_url}/api/v1/analyze",
        {"sql": DEMO_SQL, "source": "demo-preflight"},
    )
    required_fields = {
        "analysis_id",
        "status",
        "action",
        "impact",
        "dependencies",
        "business_impact",
        "risk",
        "graph",
        "safer_alternative",
        "requires_approval",
        "timeline",
    }
    if not required_fields.issubset(report):
        raise CheckFailed("Analysis response is missing required report fields.")
    if report["status"] != "PENDING_APPROVAL" or not report["requires_approval"]:
        raise CheckFailed("Preflight analysis did not stop for human approval.")
    if report["impact"] != {
        "direct_rows": 40,
        "dependent_rows": 252,
        "total_rows": 292,
    }:
        raise CheckFailed("Demo impact metrics do not match the expected fixture.")
    if report["business_impact"] != {
        "active_subscriptions": 14,
        "mrr_at_risk": 406.0,
        "arr_at_risk": 4872.0,
    }:
        raise CheckFailed("Demo business-impact metrics are not deterministic.")
    if report["risk"]["score"] != 60 or report["risk"]["level"] != "HIGH":
        raise CheckFailed("Demo risk result does not match the frozen policy.")
    return str(report["analysis_id"])


def main() -> int:
    api_url = os.getenv(
        "BLASTSHIELD_API_URL",
        f"http://localhost:{os.getenv('BACKEND_PORT', '8000')}",
    ).rstrip("/")
    analysis_url = os.getenv("BLASTSHIELD_ANALYSIS_DATABASE_URL") or local_database_url(
        "blastshield_analyzer", "analyzer_demo_password"
    )
    app_url = os.getenv("BLASTSHIELD_APP_DATABASE_URL") or local_database_url(
        "blastshield_app", "app_demo_password"
    )
    execution_url = os.getenv(
        "BLASTSHIELD_EXECUTION_DATABASE_URL"
    ) or local_database_url("blastshield_executor", "executor_demo_password")

    try:
        verify_role(analysis_url, "blastshield_analyzer")
        verify_role(execution_url, "blastshield_executor")
        verify_fixture(analysis_url)
        verify_no_active_claims(app_url)
        analysis_id = verify_api(api_url)
    except Exception as error:
        if isinstance(error, CheckFailed):
            message = str(error)
        else:
            message = f"{type(error).__name__}; inspect backend/PostgreSQL health."
        print(f"DEMO CHECK FAILED: {message}", file=sys.stderr)
        return 1

    print("DEMO CHECK PASSED")
    print(f"Pending analysis created (not approved or executed): {analysis_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
