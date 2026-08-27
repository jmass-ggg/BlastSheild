import httpx
import pytest

from blastshield_mcp.client import BlastShieldAPIClient
from blastshield_mcp.server import mcp


def test_mcp_exposes_exactly_three_tools_and_no_approval_bypass() -> None:
    names = {tool.name for tool in mcp._tool_manager.list_tools()}
    assert names == {
        "blastshield_analyze",
        "blastshield_get_report",
        "blastshield_request_execution",
    }


@pytest.mark.anyio
async def test_mcp_client_uses_only_frozen_http_routes() -> None:
    requests: list[tuple[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append((request.method, request.url.path))
        return httpx.Response(200, json={"status": "ok"})

    client = BlastShieldAPIClient(
        "http://blastshield.test",
        transport=httpx.MockTransport(handler),
    )
    await client.analyze("DELETE FROM users WHERE id = 1")
    await client.get_report("analysis-id")
    await client.request_execution("analysis-id")

    assert requests == [
        ("POST", "/api/v1/analyze"),
        ("GET", "/api/v1/analyses/analysis-id"),
        ("POST", "/api/v1/analyses/analysis-id/execute"),
    ]


@pytest.mark.anyio
async def test_mcp_client_preserves_approval_required_error() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            409,
            json={
                "code": "APPROVAL_REQUIRED",
                "message": "Human approval is required before execution.",
            },
        )

    client = BlastShieldAPIClient(
        "http://blastshield.test",
        transport=httpx.MockTransport(handler),
    )
    response = await client.request_execution("analysis-id")

    assert response["code"] == "APPROVAL_REQUIRED"
    assert response["http_status"] == 409
