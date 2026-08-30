import uuid

from fastapi.testclient import TestClient


def test_health_endpoint(qa_client: TestClient):
    """Verify GET /api/v1/health returns status 200 and expected payload."""
    res = qa_client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "BlastShield"


def test_analyze_valid_delete(qa_client: TestClient):
    """Verify POST /api/v1/analyze returns complete valid analysis response."""
    sql = "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';"
    res = qa_client.post("/api/v1/analyze", json={"sql": sql, "source": "qa_suite"})
    assert res.status_code == 200
    data = res.json()

    assert "analysis_id" in data
    assert uuid.UUID(data["analysis_id"])
    assert data["status"] == "PENDING_APPROVAL"
    assert data["action"]["operation"] == "DELETE"
    assert data["action"]["table"] == "users"
    assert data["action"]["has_where"] is True

    # Check impact numbers
    assert data["impact"]["direct_rows"] == 40
    assert data["impact"]["dependent_rows"] == 252  # orders (100) + payments (100) + subscriptions (20) + sessions (32)
    assert data["impact"]["total_rows"] == 292

    # Check risk
    assert data["risk"]["score"] > 0
    assert data["risk"]["level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert "breakdown" in data["risk"]
    assert "reasons" in data["risk"]

    # Check graph
    assert len(data["graph"]["nodes"]) >= 5
    assert len(data["graph"]["edges"]) >= 4

    # Check safer alternative
    assert data["safer_alternative"]["available"] is True
    assert "UPDATE users SET deleted_at" in data["safer_alternative"]["sql"]

    # Check timeline
    timeline_keys = [item["key"] for item in data["timeline"]]
    assert "intercepted" in timeline_keys
    assert "approval" in timeline_keys


def test_analyze_unconditional_delete_high_risk(qa_client: TestClient):
    """Verify unconditional DELETE (no WHERE) receives critical risk flags."""
    res = qa_client.post("/api/v1/analyze", json={"sql": "DELETE FROM users;", "source": "qa_suite"})
    assert res.status_code == 200
    data = res.json()

    assert data["action"]["has_where"] is False
    assert data["impact"]["direct_rows"] == 100
    assert data["risk"]["level"] in ["HIGH", "CRITICAL"]
    assert data["risk"]["score"] >= 75


def test_analyze_empty_sql(qa_client: TestClient):
    """Verify empty SQL fails validation (422) and whitespace SQL returns 400 INVALID_SQL."""
    # Empty string fails pydantic min_length=1
    res = qa_client.post("/api/v1/analyze", json={"sql": "", "source": "qa_suite"})
    assert res.status_code == 422
    assert res.json()["code"] == "VALIDATION_ERROR"

    # Whitespace passes pydantic min_length but fails parser
    res = qa_client.post("/api/v1/analyze", json={"sql": "   \n\t  ", "source": "qa_suite"})
    assert res.status_code == 400
    assert res.json()["code"] == "INVALID_SQL"


def test_analyze_multiple_statements(qa_client: TestClient):
    """Verify multiple SQL statements are rejected with 400 MULTIPLE_STATEMENTS."""
    res = qa_client.post(
        "/api/v1/analyze",
        json={"sql": "DELETE FROM users WHERE id = 1; DELETE FROM orders WHERE id = 1;", "source": "qa_suite"},
    )
    assert res.status_code == 400
    assert res.json()["code"] == "MULTIPLE_STATEMENTS"


def test_analyze_unsupported_statements(qa_client: TestClient):
    """Verify non-DELETE statements are rejected with 422 UNSUPPORTED_SQL."""
    unsupported = [
        "SELECT * FROM users",
        "INSERT INTO users (email, full_name, last_login) VALUES ('a@b.com', 'A B', NOW())",
        "UPDATE users SET full_name = 'test' WHERE id = 1",
        "DROP TABLE users",
        "TRUNCATE TABLE users",
        "ALTER TABLE users ADD COLUMN age INT",
        "CREATE TABLE test (id INT)",
    ]
    for sql in unsupported:
        res = qa_client.post("/api/v1/analyze", json={"sql": sql, "source": "qa_suite"})
        assert res.status_code == 422, f"Failed for {sql}: {res.status_code} {res.text}"
        assert res.json()["code"] == "UNSUPPORTED_SQL"


def test_analyze_unsupported_delete_clauses(qa_client: TestClient):
    """Verify DELETE with USING, RETURNING, or CTE is rejected with 422."""
    unsupported_clauses = [
        "DELETE FROM users USING orders WHERE users.id = orders.user_id",
        "DELETE FROM users WHERE id = 1 RETURNING *",
        "WITH old_users AS (SELECT id FROM users WHERE last_login < NOW()) DELETE FROM users WHERE id IN (SELECT id FROM old_users)",
    ]
    for sql in unsupported_clauses:
        res = qa_client.post("/api/v1/analyze", json={"sql": sql, "source": "qa_suite"})
        assert res.status_code == 422, f"Failed for {sql}: {res.status_code} {res.text}"
        assert res.json()["code"] == "UNSUPPORTED_SQL"


def test_analyze_non_existent_table(qa_client: TestClient):
    """Verify analyzing a non-existent table returns 400 INVALID_SQL."""
    res = qa_client.post(
        "/api/v1/analyze",
        json={"sql": "DELETE FROM ghost_table_999 WHERE id = 1", "source": "qa_suite"},
    )
    assert res.status_code == 400
    assert res.json()["code"] == "INVALID_SQL"
    assert "does not exist" in res.json()["message"]


def test_list_analyses_and_pagination(qa_client: TestClient):
    """Verify GET /api/v1/analyses lists completed reports with limit filtering."""
    # Create 3 analyses
    id1 = qa_client.post("/api/v1/analyze", json={"sql": "DELETE FROM users WHERE id = 1", "source": "qa"}).json()["analysis_id"]
    id2 = qa_client.post("/api/v1/analyze", json={"sql": "DELETE FROM users WHERE id = 2", "source": "qa"}).json()["analysis_id"]
    id3 = qa_client.post("/api/v1/analyze", json={"sql": "DELETE FROM users WHERE id = 3", "source": "qa"}).json()["analysis_id"]

    # List default
    res = qa_client.get("/api/v1/analyses")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    assert len(items) >= 3
    retrieved_ids = [item["analysis_id"] for item in items]
    assert id1 in retrieved_ids and id2 in retrieved_ids and id3 in retrieved_ids

    # List with limit=2
    res_limit = qa_client.get("/api/v1/analyses?limit=2")
    assert res_limit.status_code == 200
    assert len(res_limit.json()) == 2

    # Invalid limits
    assert qa_client.get("/api/v1/analyses?limit=0").status_code == 422
    assert qa_client.get("/api/v1/analyses?limit=101").status_code == 422
    assert qa_client.get("/api/v1/analyses?limit=invalid").status_code == 422


def test_list_analyses_source_filtering(qa_client: TestClient):
    """Verify GET /api/v1/analyses?source=... filters by source and excludes others."""
    # Create analyses with distinct sources
    id_ui = qa_client.post(
        "/api/v1/analyze",
        json={"sql": "DELETE FROM users WHERE id = 10", "source": "ui"},
    ).json()["analysis_id"]
    id_mcp = qa_client.post(
        "/api/v1/analyze",
        json={"sql": "DELETE FROM users WHERE id = 11", "source": "trueforge_agent"},
    ).json()["analysis_id"]

    # Filter by source=ui
    res_ui = qa_client.get("/api/v1/analyses?source=ui")
    assert res_ui.status_code == 200
    ui_ids = [item["analysis_id"] for item in res_ui.json()]
    assert id_ui in ui_ids
    assert id_mcp not in ui_ids

    # Filter by source=trueforge_agent
    res_mcp = qa_client.get("/api/v1/analyses?source=trueforge_agent")
    assert res_mcp.status_code == 200
    mcp_ids = [item["analysis_id"] for item in res_mcp.json()]
    assert id_mcp in mcp_ids
    assert id_ui not in mcp_ids


def test_get_analysis_by_id(qa_client: TestClient):
    """Verify GET /api/v1/analyses/{analysis_id} retrieves exact report and handles 404/422."""
    create_res = qa_client.post(
        "/api/v1/analyze",
        json={"sql": "DELETE FROM users WHERE id = 5", "source": "qa"},
    )
    analysis_id = create_res.json()["analysis_id"]

    res = qa_client.get(f"/api/v1/analyses/{analysis_id}")
    assert res.status_code == 200
    assert res.json()["analysis_id"] == analysis_id

    # Non-existent UUID -> 404
    non_existent_uuid = str(uuid.uuid4())
    res_404 = qa_client.get(f"/api/v1/analyses/{non_existent_uuid}")
    assert res_404.status_code == 404
    assert res_404.json()["code"] == "NOT_FOUND"

    # Malformed UUID -> 422
    res_422 = qa_client.get("/api/v1/analyses/not-a-uuid")
    assert res_422.status_code == 422
    assert res_422.json()["code"] == "VALIDATION_ERROR"


def test_full_approval_and_execution_api_flow(qa_client: TestClient):
    """Verify complete API flow: analyze -> approve -> execute."""
    # 1. Analyze
    analyze_res = qa_client.post(
        "/api/v1/analyze",
        json={"sql": "DELETE FROM users WHERE id = 99", "source": "qa"},
    )
    analysis_id = analyze_res.json()["analysis_id"]

    # 2. Attempt execute before approval -> 409 APPROVAL_REQUIRED
    exec_res = qa_client.post(f"/api/v1/analyses/{analysis_id}/execute")
    assert exec_res.status_code == 409
    assert exec_res.json()["code"] == "APPROVAL_REQUIRED"

    # 3. Approve
    approve_res = qa_client.post(
        f"/api/v1/analyses/{analysis_id}/approve",
        json={"actor": "lead_dba@example.com", "reason": "Verified safe to prune"},
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"
    assert approve_res.json()["approved_at"] is not None

    # Check GET reflects approved status
    get_res = qa_client.get(f"/api/v1/analyses/{analysis_id}")
    assert get_res.json()["status"] == "APPROVED"

    # 4. Execute
    exec_success = qa_client.post(f"/api/v1/analyses/{analysis_id}/execute")
    assert exec_success.status_code == 200
    exec_data = exec_success.json()
    assert exec_data["analysis_id"] == analysis_id
    assert exec_data["executed"] is True
    assert exec_data["status"] == "EXECUTED"
    assert exec_data["affected_rows"] == 1

    # Check GET reflects EXECUTED status
    get_executed = qa_client.get(f"/api/v1/analyses/{analysis_id}")
    assert get_executed.json()["status"] == "EXECUTED"


def test_rejection_api_flow(qa_client: TestClient):
    """Verify analyze -> reject -> execution blocked."""
    analyze_res = qa_client.post(
        "/api/v1/analyze",
        json={"sql": "DELETE FROM users WHERE id = 98", "source": "qa"},
    )
    analysis_id = analyze_res.json()["analysis_id"]

    # Reject
    reject_res = qa_client.post(
        f"/api/v1/analyses/{analysis_id}/reject",
        json={"actor": "security_officer@example.com", "reason": "Rejected by policy"},
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "REJECTED"

    # Check GET reflects REJECTED status
    get_res = qa_client.get(f"/api/v1/analyses/{analysis_id}")
    assert get_res.json()["status"] == "REJECTED"

    # Attempt execute after rejection -> 409 APPROVAL_REQUIRED
    exec_res = qa_client.post(f"/api/v1/analyses/{analysis_id}/execute")
    assert exec_res.status_code == 409
    assert exec_res.json()["code"] == "APPROVAL_REQUIRED"
