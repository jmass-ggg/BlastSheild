from types import SimpleNamespace

from app.db.models import AnalysisRecord
from app.services.revalidator import Revalidator


def record(fingerprint: str) -> AnalysisRecord:
    return AnalysisRecord(
        normalized_sql="DELETE FROM users WHERE id = 1",
        operation="DELETE",
        target_schema="public",
        target_table="users",
        fingerprint=fingerprint,
    )


class FakePipeline:
    def __init__(self, fingerprint: str) -> None:
        self.fingerprint = fingerprint

    def measure(self, _parsed):
        return SimpleNamespace(fingerprint=self.fingerprint)


def test_revalidation_matches_identical_fingerprint() -> None:
    assert Revalidator(FakePipeline("same")).revalidate(record("same")) is True


def test_revalidation_rejects_changed_fingerprint() -> None:
    assert Revalidator(FakePipeline("new")).revalidate(record("old")) is False
