import json
import subprocess
import sys
from pathlib import Path

VERIFIER = (
    Path(__file__).resolve().parents[3]
    / "trueforge"
    / "skills"
    / "blastshield-demo"
    / "scripts"
    / "verify_report.py"
)


def demo_report() -> dict:
    return {
        "analysis_id": "demo-id",
        "status": "PENDING_APPROVAL",
        "requires_approval": True,
        "impact": {
            "direct_rows": 40,
            "dependent_rows": 252,
            "total_rows": 292,
        },
        "dependencies": [
            {"rows": 100},
            {"rows": 32},
            {"rows": 20},
            {"rows": 100},
        ],
        "risk": {
            "score": 68,
            "level": "HIGH",
            "breakdown": {
                "operation": 20,
                "direct_impact": 8,
                "dependent_impact": 12,
                "cascade": 18,
                "recoverability": 10,
            },
        },
    }


def run_verifier(tmp_path: Path, report: dict) -> subprocess.CompletedProcess[str]:
    report_path = tmp_path / "report.json"
    report_path.write_text(json.dumps(report), encoding="utf-8")
    return subprocess.run(
        [sys.executable, str(VERIFIER), str(report_path)],
        check=False,
        capture_output=True,
        text=True,
    )


def test_trueforge_verifier_accepts_deterministic_demo_report(tmp_path: Path) -> None:
    completed = run_verifier(tmp_path, demo_report())

    assert completed.returncode == 0
    result = json.loads(completed.stdout)
    assert result["verification"] == "PASSED"
    assert result["checks"]["total_rows"] == 292
    assert result["recommendation"] == "REJECT"


def test_trueforge_verifier_rejects_inconsistent_report(tmp_path: Path) -> None:
    report = demo_report()
    report["impact"]["total_rows"] = 291

    completed = run_verifier(tmp_path, report)

    assert completed.returncode == 1
    result = json.loads(completed.stdout)
    assert result["verification"] == "FAILED"
    assert "total_rows does not equal" in " ".join(result["failures"])
