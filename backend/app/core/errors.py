"""Domain-specific error hierarchy for the BlastShield gateway.

Every custom exception carries an error code, user-friendly message,
HTTP status code, and optional actionable remediation guidance.
"""


class BlastShieldError(Exception):
    """Base exception for all BlastShield gateway errors."""

    def __init__(
        self,
        code: str,
        message: str,
        *,
        status_code: int = 400,
        remediation: str | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.remediation = remediation


class InvalidSQLError(BlastShieldError):
    """Raised when the submitted SQL cannot be parsed by SQLGlot."""

    def __init__(self, message: str = "The SQL statement is invalid.") -> None:
        super().__init__(
            "INVALID_SQL",
            message,
            status_code=400,
            remediation="Ensure the SQL is a syntactically valid PostgreSQL statement.",
        )


class MultipleStatementsError(BlastShieldError):
    """Raised when more than one SQL statement is submitted."""

    def __init__(self) -> None:
        super().__init__(
            "MULTIPLE_STATEMENTS",
            "Exactly one SQL statement is allowed.",
            status_code=400,
            remediation="Submit each SQL statement in a separate analysis request.",
        )


class UnsupportedSQLError(BlastShieldError):
    """Raised when a non-DELETE SQL statement or unsupported DDL/DML is submitted."""

    def __init__(self, message: str) -> None:
        super().__init__(
            "UNSUPPORTED_SQL",
            message,
            status_code=422,
            remediation="BlastShield currently validates and executes single-table DELETE statements.",
        )


class AnalysisQueryTimeoutError(BlastShieldError):
    """Raised when the read-only analysis exceeds its configured timeout."""

    def __init__(self) -> None:
        super().__init__(
            "ANALYSIS_QUERY_TIMEOUT",
            "The read-only analysis query exceeded its configured timeout.",
            status_code=503,
            remediation="Optimize indexes or narrow the WHERE clause to reduce query cost.",
        )


class NotFoundError(BlastShieldError):
    """Raised when the requested analysis record is not found."""

    def __init__(self, message: str = "Analysis not found.") -> None:
        super().__init__(
            "NOT_FOUND",
            message,
            status_code=404,
            remediation="Verify the analysis UUID is correct and exists in the control plane.",
        )


class InvalidStateError(BlastShieldError):
    """Raised when an operation is invalid for the analysis record's current state."""

    def __init__(self, message: str) -> None:
        super().__init__(
            "INVALID_STATE",
            message,
            status_code=409,
            remediation="Check the analysis lifecycle status via GET /api/v1/analyses/{id}.",
        )


class ApprovalRequiredError(BlastShieldError):
    """Raised when execution is requested without prior human approval."""

    def __init__(self) -> None:
        super().__init__(
            "APPROVAL_REQUIRED",
            "Human approval is required before execution.",
            status_code=409,
            remediation="Submit POST /api/v1/analyses/{id}/approve before requesting execution.",
        )


class ExecutionFailedError(BlastShieldError):
    """Raised when the approved execution transaction fails or rolls back."""

    def __init__(self, message: str = "The approved database action failed.") -> None:
        super().__init__(
            "EXECUTION_FAILED",
            message,
            status_code=500,
            remediation="Do not retry blindly; inspect database logs and reconcile domain state before attempting another operation.",
        )
