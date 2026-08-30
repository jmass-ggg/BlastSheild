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


def _expected_row_score(rows: float) -> float:
    if rows <= 0:
        return 0.0
    if rows <= 10:
        return 4.0
    if rows <= 100:
        return 8.0
    if rows <= 1_000:
        return 12.0
    if rows <= 10_000:
        return 16.0
    return 20.0


def _expected_cascade_score(dependencies: list[dict[str, Any]]) -> float:
    if not dependencies:
        return 0.0
    if any(item.get("effect") == "BLOCK" for item in dependencies):
        return 25.0
    deletion_depths = [
        int(item.get("depth", 1))
        for item in dependencies
        if item.get("effect") == "DELETE" and isinstance(item.get("depth"), (int, float))
    ]
    if deletion_depths:
        maximum_depth = max(deletion_depths)
        return 12.0 if maximum_depth == 1 else 18.0 if maximum_depth == 2 else 25.0
    if any(item.get("effect") in {"SET_NULL", "SET_DEFAULT"} for item in dependencies):
        return 8.0
    return 0.0


def verify(report: dict[str, Any]) -> dict[str, Any]:
    failures: list[str] = []
    impact = object_at(report, "impact", failures)
    risk = object_at(report, "risk", failures)
    action = object_at(report, "action", failures)
    safer = object_at(report, "safer_alternative", failures)
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

    # Independently compute expected risk components
    operation = str(action.get("operation", "DELETE")).upper()
    has_where = bool(action.get("has_where", True))
    recoverable = bool(safer.get("available", False))

    if operation == "DELETE" and not has_where:
        expected_op_score = 25.0
        expected_dir_score = 20.0
        expected_dep_score = 20.0
        expected_casc_score = 25.0
        expected_recov_score = 10.0
    else:
        expected_op_score = 20.0 if operation == "DELETE" else 10.0
        expected_dir_score = _expected_row_score(direct)
        expected_dep_score = _expected_row_score(dependency_sum)
        expected_casc_score = _expected_cascade_score(dependencies)
        expected_recov_score = 2.0 if recoverable else 10.0

    expected_score = min(
        100.0,
        expected_op_score
        + expected_dir_score
        + expected_dep_score
        + expected_casc_score
        + expected_recov_score,
    )

    score = number(risk.get("score"), "risk.score", failures)
    if score != expected_score:
        failures.append(
            f"risk score ({score}) does not match independently derived policy score ({expected_score})"
        )

    level = risk.get("level")
    expected_level = expected_risk_level(int(expected_score))
    if not isinstance(level, str):
        failures.append("risk.level must be a string")
        level = "UNKNOWN"
    elif level != expected_level:
        failures.append(
            f"risk level ({level}) does not match derived policy level ({expected_level})"
        )

    if not report.get("analysis_id"):
        failures.append("analysis_id is required")
    if report.get("status") != "PENDING_APPROVAL":
        failures.append("new analysis must be PENDING_APPROVAL before human review")
    if report.get("requires_approval") is not True:
        failures.append("requires_approval must be true before execution")

    passed = not failures
    recommendation = "REJECT" if expected_level in {"HIGH", "CRITICAL"} else "REVIEW"
    return {
        "verification": "PASSED" if passed else "FAILED",
        "checks": {
            "total_rows": int(total),
            "dependency_sum": int(dependency_sum),
            "derived_score": int(expected_score),
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
