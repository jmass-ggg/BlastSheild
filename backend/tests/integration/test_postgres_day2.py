import os

import pytest
from app.core.config import Settings
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import AnalyzeRequest
from app.services.blastshield_analyzer import BlastShieldAnalyzer
from app.services.impact_counter import measure_count_query
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

ANALYSIS_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_DATABASE_URL")
APP_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_APP_DATABASE_URL")
pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        not ANALYSIS_DATABASE_URL or not APP_DATABASE_URL,
        reason="Day 2 database URLs are not configured",
    ),
]


@pytest.fixture(scope="module")
def engines():
    analysis_engine = create_engine(ANALYSIS_DATABASE_URL, pool_pre_ping=True)
    app_engine = create_engine(APP_DATABASE_URL, pool_pre_ping=True)
    try:
        yield analysis_engine, app_engine
    finally:
        analysis_engine.dispose()
        app_engine.dispose()


def test_explain_selects_exact_and_estimated_paths(engines) -> None:
    analysis_engine, _ = engines

    exact = measure_count_query(
        "SELECT COUNT(*) FROM users", analysis_engine, exact_cost_limit=100_000
    )
    estimated = measure_count_query(
        "SELECT COUNT(*) FROM users", analysis_engine, exact_cost_limit=0
    )

    assert exact.rows == 100
    assert exact.measurement == "EXACT"
    assert estimated.rows > 0
    assert estimated.measurement == "ESTIMATED"


def test_complete_analysis_is_correlated_scored_and_persisted(engines) -> None:
    analysis_engine, app_engine = engines
    repository = AnalysisRepository(
        sessionmaker(bind=app_engine, expire_on_commit=False, autoflush=False)
    )
    analyzer = BlastShieldAnalyzer(
        analysis_engine=analysis_engine,
        repository=repository,
        settings=Settings(
            analysis_database_url=ANALYSIS_DATABASE_URL,
            app_database_url=APP_DATABASE_URL,
        ),
    )

    report = analyzer.analyze(
        AnalyzeRequest(
            sql="DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';",
            source="integration-test",
            reason="Verify Day 2",
        )
    )

    assert report.status == "PENDING_APPROVAL"
    assert report.impact.direct_rows == 40
    assert report.impact.dependent_rows == 252
    assert report.impact.total_rows == 292
    assert {item.table: item.rows for item in report.dependencies} == {
        "orders": 100,
        "payments": 100,
        "subscriptions": 20,
        "sessions": 32,
    }
    assert all(item.measurement == "EXACT" for item in report.dependencies)
    assert report.business_impact.active_subscriptions == 14
    assert report.business_impact.mrr_at_risk == 406
    assert report.business_impact.arr_at_risk == 4_872
    assert report.risk.score == 60
    assert report.risk.level == "HIGH"
    assert report.safer_alternative.available is True
    assert report.safer_alternative.sql is not None
    assert report.requires_approval is True

    stored = repository.get(report.analysis_id)
    assert stored.status == "PENDING_APPROVAL"
    assert stored.risk_score == report.risk.score
    assert stored.fingerprint is not None and len(stored.fingerprint) == 64
    assert stored.report["analysis_id"] == str(report.analysis_id)
