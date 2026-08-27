import os
from typing import Any

from mcp.server.fastmcp import FastMCP

from blastshield_mcp.client import BlastShieldAPIClient

mcp = FastMCP("BlastShield")


def _client() -> BlastShieldAPIClient:
    return BlastShieldAPIClient(
        os.getenv("BLASTSHIELD_API_URL", "http://localhost:8000")
    )


@mcp.tool()
async def blastshield_analyze(
    sql: str,
    source: str = "trueforge",
    reason: str | None = None,
) -> dict[str, Any]:
    """Analyze a proposed DELETE; never execute it and wait for human approval."""
    report = await _client().analyze(sql, source=source, reason=reason)
    if report.get("status") == "PENDING_APPROVAL":
        report["instruction"] = "WAIT FOR HUMAN APPROVAL before requesting execution."
    return report


@mcp.tool()
async def blastshield_get_report(analysis_id: str) -> dict[str, Any]:
    """Get the current persisted BlastShield report and lifecycle status."""
    return await _client().get_report(analysis_id)


@mcp.tool()
async def blastshield_request_execution(analysis_id: str) -> dict[str, Any]:
    """Request execution by approved analysis ID; approval cannot be bypassed."""
    return await _client().request_execution(analysis_id)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()

