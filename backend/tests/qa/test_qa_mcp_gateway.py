import httpx
import pytest
from app.main import app
from blastshield_mcp.client import BlastShieldAPIClient
from blastshield_mcp.server import (
    mcp,
)


@pytest.mark.anyio
async def test_mcp_tools_with_asgi_backend(analyzer_engine, app_engine):
    """Test MCP tools communicating directly with ASGI app transport."""
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://testserver"
    ):
        client = BlastShieldAPIClient(
            "http://testserver",
            transport=httpx.ASGITransport(app=app),
        )

        # 1. blastshield_analyze
        report = await client.analyze(
            "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years'",
            source="trueforge_agent",
            reason="Cleanup",
        )
        assert report["status"] == "PENDING_APPROVAL"
        assert report["action"]["operation"] == "DELETE"
        analysis_id = report["analysis_id"]

        # 2. blastshield_get_report
        fetched_report = await client.get_report(analysis_id)
        assert fetched_report["analysis_id"] == analysis_id
        assert fetched_report["status"] == "PENDING_APPROVAL"

        # 3. blastshield_request_execution before approval -> 409 APPROVAL_REQUIRED
        exec_attempt = await client.request_execution(analysis_id)
        assert exec_attempt["code"] == "APPROVAL_REQUIRED"
        assert exec_attempt["http_status"] == 409


def test_mcp_tool_surface_and_metadata():
    """Verify tool signatures, parameters, and descriptions on FastMCP server."""
    tools = mcp._tool_manager.list_tools()
    tool_map = {t.name: t for t in tools}

    assert "blastshield_analyze" in tool_map
    assert "blastshield_get_report" in tool_map
    assert "blastshield_request_execution" in tool_map

    # Ensure dangerous tools are strictly NOT present
    forbidden_tools = ["run_sql", "execute_sql", "blastshield_approve", "approve_analysis", "run_raw_query"]
    for forbidden in forbidden_tools:
        assert forbidden not in tool_map
