from typing import Any


class BlastShieldError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        *,
        status_code: int = 400,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


class InvalidSQLError(BlastShieldError):
    def __init__(self, message: str = "The SQL statement is invalid.") -> None:
        super().__init__("INVALID_SQL", message)


class MultipleStatementsError(BlastShieldError):
    def __init__(self) -> None:
        super().__init__(
            "MULTIPLE_STATEMENTS",
            "Exactly one SQL statement is allowed.",
        )


class UnsupportedSQLError(BlastShieldError):
    def __init__(self, message: str) -> None:
        super().__init__("UNSUPPORTED_SQL", message, status_code=422)


class AnalysisQueryTimeoutError(BlastShieldError):
    def __init__(self) -> None:
        super().__init__(
            "ANALYSIS_QUERY_TIMEOUT",
            "The read-only analysis query exceeded its configured timeout.",
            status_code=503,
        )

