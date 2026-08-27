from app.api.health import health, router


def test_health_endpoint() -> None:
    assert health() == {"status": "ok", "service": "BlastShield"}
    assert any(getattr(route, "path", None) == "/health" for route in router.routes)
