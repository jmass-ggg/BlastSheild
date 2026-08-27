ANALYSIS_ROLE_NAME = "blastshield_analyzer"
EXECUTION_ROLE_NAME = "blastshield_executor"


def is_analysis_role(role_name: str) -> bool:
    """Make role checks explicit where diagnostics need to assert isolation."""
    return role_name == ANALYSIS_ROLE_NAME

