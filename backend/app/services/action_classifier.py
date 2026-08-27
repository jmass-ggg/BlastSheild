from enum import StrEnum


class ActionClassification(StrEnum):
    SAFE = "SAFE"
    MUTATING = "MUTATING"
    DESTRUCTIVE = "DESTRUCTIVE"
    DDL = "DDL"
    UNKNOWN = "UNKNOWN"


CLASSIFICATIONS: dict[str, ActionClassification] = {
    "SELECT": ActionClassification.SAFE,
    "INSERT": ActionClassification.MUTATING,
    "UPDATE": ActionClassification.MUTATING,
    "DELETE": ActionClassification.DESTRUCTIVE,
    "TRUNCATE": ActionClassification.DESTRUCTIVE,
    "DROP": ActionClassification.DDL,
    "ALTER": ActionClassification.DDL,
    "CREATE": ActionClassification.DDL,
}


def classify_action(operation: str) -> ActionClassification:
    return CLASSIFICATIONS.get(operation.upper(), ActionClassification.UNKNOWN)

