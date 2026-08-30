from typing import Any

import httpx


class BlastShieldAPIClient:
    def __init__(
        self,
        base_url: str,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        timeout: float = 15.0,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._transport = transport
        self._timeout = timeout

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        async with httpx.AsyncClient(
            base_url=self._base_url,
            transport=self._transport,
            timeout=self._timeout,
        ) as client:
            response = await client.request(method, path, json=json_body)
        try:
            payload = response.json()
        except ValueError:
            payload = {
                "code": "BLASTSHIELD_API_ERROR",
                "message": "BlastShield returned a non-JSON response.",
            }
        if response.is_error:
            payload.setdefault("http_status", response.status_code)
        return payload

    async def analyze(
        self,
        sql: str,
        *,
        source: str = "trueforge",
        reason: str | None = None,
    ) -> dict[str, Any]:
        return await self._request(
            "POST",
            "/api/v1/analyze",
            json_body={"sql": sql, "source": source, "reason": reason},
        )

    async def get_report(self, analysis_id: str) -> dict[str, Any]:
        return await self._request("GET", f"/api/v1/analyses/{analysis_id}")

    async def approve(
        self,
        analysis_id: str,
        *,
        actor: str,
        reason: str,
    ) -> dict[str, Any]:
        return await self._request(
            "POST",
            f"/api/v1/analyses/{analysis_id}/approve",
            json_body={"actor": actor, "reason": reason},
        )

    async def request_execution(self, analysis_id: str) -> dict[str, Any]:
        return await self._request(
            "POST", f"/api/v1/analyses/{analysis_id}/execute"
        )
