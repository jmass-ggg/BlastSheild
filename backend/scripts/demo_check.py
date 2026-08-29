"""Non-destructive preflight and safe end-to-end rehearsal for BlastShield."""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path
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
REHEARSAL_SQL = "DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '100 years';"


class CheckFailed(RuntimeError):
    pass


def local_database_url(role: str, password: str) -> str:
    port = os.getenv("POSTGRES_PORT", "55432" if os.path.exists(".env") else "5432")
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


def verify_api(api_url: str) -> dict[str, Any]:
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
    return report


def run_agent_demo(report: dict[str, Any]) -> None:
    verifier = (
        Path(__file__).resolve().parents[2]
        / "trueforge"
        / "skills"
        / "blastshield-demo"
        / "scripts"
        / "verify_report.py"
    )
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json") as report_file:
        json.dump(report, report_file)
        report_file.flush()
        completed = subprocess.run(
            [sys.executable, str(verifier), report_file.name],
            check=False,
            capture_output=True,
            text=True,
        )
    if completed.returncode != 0:
        raise CheckFailed(
            f"Independent report verification failed: {completed.stdout.strip()}"
        )

    verification = json.loads(completed.stdout)
    if verification.get("verification") != "PASSED":
        raise CheckFailed("Independent report verification did not pass.")

    impact = report["impact"]
    business = report["business_impact"]
    risk = report["risk"]
    print("\n--- TRUEFORGE AGENT DEMO ---")
    print("TrueForge sandbox verification: PASSED")
    print("\nAgent:")
    print(f'"I found {impact["total_rows"]} total affected records.')
    print(f'Risk = {risk["level"]}.\n')
    print(
        f'{business["active_subscriptions"]} active subscriptions would be affected.'
    )
    print(f'${business["mrr_at_risk"]:,.0f} MRR is at risk.\n')
    print('I recommend rejecting this operation."')
    print("\nNext direct tool call: blastshield_request_execution(analysis_id)")
    print("Expected TrueForge checkpoint: Tool requires approval [DENY] [ALLOW]")
    print("DENY leaves production unchanged.")
    print("ALLOW records approval, revalidates, and uses the constrained executor.")
    print("--- END TRUEFORGE AGENT DEMO ---\n")


def run_rehearsal(api_url: str) -> None:
    print("\n--- RUNNING FULL LIFECYCLE REHEARSAL ---")
    
    # 1. Analyze safe test query
    print("1. Intercept & Analyze SQL...")
    report = request_json(
        "POST",
        f"{api_url}/api/v1/analyze",
        {"sql": REHEARSAL_SQL, "source": "demo-rehearsal"},
    )
    analysis_id = report["analysis_id"]
    print(f"   ✓ Intercepted: analysis_id={analysis_id}, status={report['status']}")
    print(f"   ✓ Risk Score: {report['risk']['score']}/100 ({report['risk']['level']})")

    # 2. Approve analysis
    print("2. Human Operator Approval...")
    approval = request_json(
        "POST",
        f"{api_url}/api/v1/analyses/{analysis_id}/approve",
        {"actor": "demo-rehearsal", "reason": "Pre-demo rehearsal test"},
    )
    if approval.get("status") != "APPROVED":
        raise CheckFailed(f"Approval failed, got status: {approval.get('status')}")
    print(f"   ✓ Status transitioned to {approval['status']}")

    # 3. Execute analysis
    print("3. Execution with Pre-Execution Fingerprint Revalidation...")
    execution = request_json(
        "POST",
        f"{api_url}/api/v1/analyses/{analysis_id}/execute",
    )
    if not execution.get("executed") or execution.get("status") != "EXECUTED":
        raise CheckFailed(f"Execution failed: {execution}")
    print(f"   ✓ Executed successfully: {execution['affected_rows']} rows affected, status={execution['status']}")
    print("--- REHEARSAL COMPLETE: FULL PIPELINE VERIFIED ---\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="BlastShield demo preflight and rehearsal.")
    parser.add_argument(
        "--rehearse",
        action="store_true",
        help="Run an end-to-end rehearsal (analyze -> approve -> execute) with a non-destructive query.",
    )
    parser.add_argument(
        "--agent-demo",
        action="store_true",
        help="Print the verified TrueForge agent narrative without executing the DELETE.",
    )
    args = parser.parse_args()

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
        report = verify_api(api_url)
        analysis_id = str(report["analysis_id"])
        if args.agent_demo:
            run_agent_demo(report)
        if args.rehearse:
            run_rehearsal(api_url)
    except Exception as error:
        if isinstance(error, CheckFailed):
            message = str(error)
        else:
            message = f"{type(error).__name__}: {error}; inspect backend/PostgreSQL health."
        print(f"DEMO CHECK FAILED: {message}", file=sys.stderr)
        return 1

    print("DEMO CHECK PASSED")
    print(f"Pending analysis created (not approved or executed): {analysis_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
