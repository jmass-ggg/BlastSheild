#!/usr/bin/env python3
"""Independently verify BlastShield report arithmetic inside TrueForge sandbox."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def expected_risk_level(score: int) -> str:
    if score <= 24:
        return "LOW"
    if score <= 49:
        return "MEDIUM"
    if score <= 74:
        return "HIGH"
    return "CRITICAL"


def number(value: Any, path: str, failures: list[str]) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        failures.append(f"{path} must be a number")
        return 0
    if value < 0:
        failures.append(f"{path} must not be negative")
    return float(value)


def object_at(report: dict[str, Any], key: str, failures: list[str]) -> dict[str, Any]:
    value = report.get(key)
    if not isinstance(value, dict):
        failures.append(f"{key} must be an object")
        return {}
    return value


def verify(report: dict[str, Any]) -> dict[str, Any]:
    failures: list[str] = []
    impact = object_at(report, "impact", failures)
    risk = object_at(report, "risk", failures)
    breakdown = object_at(risk, "breakdown", failures)
    dependencies = report.get("dependencies")
    if not isinstance(dependencies, list):
        failures.append("dependencies must be an array")
        dependencies = []

    direct = number(impact.get("direct_rows"), "impact.direct_rows", failures)
    dependent = number(
        impact.get("dependent_rows"), "impact.dependent_rows", failures
    )
    total = number(impact.get("total_rows"), "impact.total_rows", failures)

    dependency_sum = 0.0
    for index, dependency in enumerate(dependencies):
        if not isinstance(dependency, dict):
            failures.append(f"dependencies[{index}] must be an object")
            continue
        dependency_sum += number(
            dependency.get("rows"), f"dependencies[{index}].rows", failures
        )

    if total != direct + dependent:
        failures.append("total_rows does not equal direct_rows + dependent_rows")
    if dependent != dependency_sum:
        failures.append("dependent_rows does not equal the dependency row sum")

    score = number(risk.get("score"), "risk.score", failures)
    breakdown_sum = sum(
        number(value, f"risk.breakdown.{key}", failures)
        for key, value in breakdown.items()
    )
    if score != min(100.0, breakdown_sum):
        failures.append("risk score does not equal the capped breakdown sum")

    level = risk.get("level")
    if not isinstance(level, str):
        failures.append("risk.level must be a string")
        level = "UNKNOWN"
    elif score.is_integer() and level != expected_risk_level(int(score)):
        failures.append("risk level does not match the deterministic score band")

    if not report.get("analysis_id"):
        failures.append("analysis_id is required")
    if report.get("status") != "PENDING_APPROVAL":
        failures.append("new analysis must be PENDING_APPROVAL before human review")
    if report.get("requires_approval") is not True:
        failures.append("requires_approval must be true before execution")

    passed = not failures
    recommendation = "REJECT" if level in {"HIGH", "CRITICAL"} else "REVIEW"
    return {
        "verification": "PASSED" if passed else "FAILED",
        "checks": {
            "total_rows": int(total),
            "dependency_sum": int(dependency_sum),
            "risk_breakdown_sum": int(breakdown_sum),
            "risk_score": int(score),
            "risk_level": level,
        },
        "recommendation": recommendation,
        "failures": failures,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("report", type=Path, help="BlastShield report JSON file")
    args = parser.parse_args()

    try:
        payload = json.loads(args.report.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(json.dumps({"verification": "FAILED", "failures": [str(exc)]}))
        return 2
    if not isinstance(payload, dict):
        print(json.dumps({"verification": "FAILED", "failures": ["report must be an object"]}))
        return 2

    result = verify(payload)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["verification"] == "PASSED" else 1


if __name__ == "__main__":
    sys.exit(main())
