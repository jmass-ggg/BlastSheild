import blastshield_mcp.server as server_module
import httpx
import pytest
from blastshield_mcp.client import BlastShieldAPIClient
from blastshield_mcp.server import (
    blastshield_request_execution,
    configured_transport,
    mcp,
)


def test_mcp_exposes_exactly_three_tools_and_no_approval_bypass() -> None:
    tools = mcp._tool_manager.list_tools()
    names = {tool.name for tool in tools}
    assert names == {
        "blastshield_analyze",
        "blastshield_get_report",
        "blastshield_request_execution",
    }

    tool_map = {tool.name: tool for tool in tools}
    analyze = tool_map["blastshield_analyze"].annotations
    report = tool_map["blastshield_get_report"].annotations
    execution = tool_map["blastshield_request_execution"].annotations

    assert analyze is not None
    assert analyze.readOnlyHint is False
    assert analyze.destructiveHint is False
    assert report is not None
    assert report.readOnlyHint is True
    assert report.destructiveHint is False
    assert execution is not None
    assert execution.readOnlyHint is False
    assert execution.destructiveHint is True


def test_mcp_transport_defaults_to_stdio(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BLASTSHIELD_MCP_TRANSPORT", raising=False)

    assert configured_transport() == "stdio"


def test_mcp_supports_trueforge_streamable_http(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("BLASTSHIELD_MCP_TRANSPORT", "streamable-http")

    assert configured_transport() == "streamable-http"


def test_mcp_rejects_unknown_transport(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("BLASTSHIELD_MCP_TRANSPORT", "websocket")

    with pytest.raises(ValueError, match="BLASTSHIELD_MCP_TRANSPORT"):
        configured_transport()


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


@pytest.mark.anyio
async def test_trueforge_approved_execution_records_approval_before_execute() -> None:
    requests: list[tuple[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append((request.method, request.url.path))
        if request.method == "GET":
            return httpx.Response(200, json={"status": "PENDING_APPROVAL"})
        if request.url.path.endswith("/approve"):
            return httpx.Response(200, json={"status": "APPROVED"})
        return httpx.Response(
            200,
            json={"executed": True, "status": "EXECUTED", "affected_rows": 40},
        )

    client = BlastShieldAPIClient(
        "http://blastshield.test",
        transport=httpx.MockTransport(handler),
    )
    response = await client.approve_and_request_execution(
        "analysis-id",
        actor="trueforge-tool-approval",
        reason="Human allowed the tool call.",
    )

    assert response["status"] == "EXECUTED"
    assert requests == [
        ("GET", "/api/v1/analyses/analysis-id"),
        ("POST", "/api/v1/analyses/analysis-id/approve"),
        ("POST", "/api/v1/analyses/analysis-id/execute"),
    ]


@pytest.mark.anyio
async def test_trueforge_approved_execution_refuses_terminal_analysis() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"status": "REJECTED"})

    client = BlastShieldAPIClient(
        "http://blastshield.test",
        transport=httpx.MockTransport(handler),
    )
    response = await client.approve_and_request_execution(
        "analysis-id",
        actor="trueforge-tool-approval",
        reason="Human allowed the tool call.",
    )

    assert response["code"] == "INVALID_STATE"


@pytest.mark.anyio
async def test_execution_tool_reports_trueforge_approval_and_revalidation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class StubClient:
        async def approve_and_request_execution(
            self,
            analysis_id: str,
            *,
            actor: str,
            reason: str,
        ) -> dict:
            assert analysis_id == "analysis-id"
            assert actor == "trueforge-tool-approval"
            assert "Human allowed" in reason
            return {"executed": True, "status": "EXECUTED", "affected_rows": 40}

    monkeypatch.setattr(server_module, "_client", lambda: StubClient())

    response = await blastshield_request_execution("analysis-id")

    assert response["approval_source"] == "TRUEFORGE_TOOL_APPROVAL"
    assert response["revalidation"] == "PASSED"
