import os
from typing import Any, Literal, cast

from mcp.server.fastmcp import FastMCP
from mcp.types import ToolAnnotations

from blastshield_mcp.client import BlastShieldAPIClient

MCPTransport = Literal["stdio", "sse", "streamable-http"]

mcp = FastMCP(
    "BlastShield",
    host=os.getenv("BLASTSHIELD_MCP_HOST", "127.0.0.1"),
    port=int(os.getenv("BLASTSHIELD_MCP_PORT", "8001")),
    streamable_http_path="/mcp",
)


def _client() -> BlastShieldAPIClient:
    return BlastShieldAPIClient(
        os.getenv("BLASTSHIELD_API_URL", "http://localhost:8000")
    )


@mcp.tool(
    title="Analyze a PostgreSQL DELETE",
    annotations=ToolAnnotations(
        readOnlyHint=False,
        destructiveHint=False,
        idempotentHint=False,
        openWorldHint=True,
    ),
)
async def blastshield_analyze(
    sql: str,
    source: str = "trueforge",
    reason: str | None = None,
) -> dict[str, Any]:
    """Measure a proposed DELETE against live data without changing domain rows."""
    report = await _client().analyze(sql, source=source, reason=reason)
    if report.get("status") == "PENDING_APPROVAL":
        report["instruction"] = (
            "Verify this report independently in the TrueForge sandbox, explain "
            "the consequences, and recommend rejection for HIGH or CRITICAL risk. "
            "Request execution only if the user explicitly continues."
        )
    return report


@mcp.tool(
    title="Get a BlastShield report",
    annotations=ToolAnnotations(
        readOnlyHint=True,
        destructiveHint=False,
        idempotentHint=True,
        openWorldHint=True,
    ),
)
async def blastshield_get_report(analysis_id: str) -> dict[str, Any]:
    """Get the current persisted BlastShield report and lifecycle status."""
    return await _client().get_report(analysis_id)


@mcp.tool(
    title="Execute an approved PostgreSQL DELETE",
    annotations=ToolAnnotations(
        readOnlyHint=False,
        destructiveHint=True,
        idempotentHint=False,
        openWorldHint=True,
    ),
)
async def blastshield_request_execution(analysis_id: str) -> dict[str, Any]:
    """Request execution by approved analysis ID; approval cannot be bypassed."""
    return await _client().request_execution(analysis_id)


def configured_transport() -> MCPTransport:
    transport = os.getenv("BLASTSHIELD_MCP_TRANSPORT", "stdio")
    if transport not in {"stdio", "sse", "streamable-http"}:
        raise ValueError(
            "BLASTSHIELD_MCP_TRANSPORT must be stdio, sse, or streamable-http."
        )
    return cast(MCPTransport, transport)


def main() -> None:
    mcp.run(transport=configured_transport())


if __name__ == "__main__":
    main()
