import pytest

from app.services.action_classifier import ActionClassification, classify_action


@pytest.mark.parametrize(
    ("operation", "expected"),
    [
        ("SELECT", ActionClassification.SAFE),
        ("INSERT", ActionClassification.MUTATING),
        ("UPDATE", ActionClassification.MUTATING),
        ("DELETE", ActionClassification.DESTRUCTIVE),
        ("TRUNCATE", ActionClassification.DESTRUCTIVE),
        ("DROP", ActionClassification.DDL),
        ("ALTER", ActionClassification.DDL),
    ],
)
def test_classifies_supported_operations(
    operation: str, expected: ActionClassification
) -> None:
    assert classify_action(operation) == expected


def test_unknown_operation_fails_closed_to_unknown() -> None:
    assert classify_action("MERGE") == ActionClassification.UNKNOWN

