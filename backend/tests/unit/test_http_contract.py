import httpx
import pytest
from app.main import app

pytestmark = pytest.mark.anyio


async def test_frozen_api_routes_and_execute_has_no_request_body() -> None:
    schema = app.openapi()
    paths = schema["paths"]

    assert {
        (method.upper(), path)
        for path, operations in paths.items()
        for method in operations
    } == {
        ("GET", "/api/v1/health"),
        ("POST", "/api/v1/analyze"),
        ("GET", "/api/v1/analyses"),
        ("GET", "/api/v1/analyses/{analysis_id}"),
        ("POST", "/api/v1/analyses/{analysis_id}/approve"),
        ("POST", "/api/v1/analyses/{analysis_id}/reject"),
        ("POST", "/api/v1/analyses/{analysis_id}/execute"),
    }
    assert "requestBody" not in paths[
        "/api/v1/analyses/{analysis_id}/execute"
    ]["post"]


async def test_validation_and_unknown_route_errors_are_structured() -> None:
    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://test"
    ) as client:
        invalid = await client.post("/api/v1/analyze", json={"sql": ""})
        missing_route = await client.get("/api/v1/not-a-route")

    assert invalid.status_code == 422
    assert invalid.json() == {
        "code": "VALIDATION_ERROR",
        "message": "The request payload is invalid.",
    }
    assert missing_route.status_code == 404
    assert missing_route.json() == {"code": "NOT_FOUND", "message": "Not Found"}


async def test_configured_frontend_origin_is_allowed_by_cors() -> None:
    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://test"
    ) as client:
        response = await client.options(
            "/api/v1/analyze",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


async def test_custom_error_responses_include_remediation() -> None:
    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://test"
    ) as client:
        unsupported = await client.post(
            "/api/v1/analyze", json={"sql": "SELECT 1;"}
        )

    assert unsupported.status_code == 422
    body = unsupported.json()
    assert body["code"] == "UNSUPPORTED_SQL"
    assert "remediation" in body
    assert "DELETE" in body["remediation"]

