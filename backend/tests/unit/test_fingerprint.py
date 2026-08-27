from app.services.fingerprint import analysis_fingerprint


def test_fingerprint_is_order_independent_and_changes_with_counts() -> None:
    first = analysis_fingerprint({"sql": "DELETE", "rows": 10})
    reordered = analysis_fingerprint({"rows": 10, "sql": "DELETE"})
    changed = analysis_fingerprint({"sql": "DELETE", "rows": 11})

    assert first == reordered
    assert first != changed
    assert len(first) == 64

