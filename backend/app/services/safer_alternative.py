from sqlglot import exp

from app.schemas.analysis import SaferAlternative
from app.schemas.graph import TableMetadata
from app.services.risk_engine import calculate_risk
from app.services.sql_parser import ParsedSQL


def _build_update_sql(parsed: ParsedSQL, column_name: str) -> str:
    value = exp.func("NOW") if column_name == "deleted_at" else exp.true()
    update = exp.Update(
        this=parsed.target.copy(),
        expressions=[exp.EQ(this=exp.column(column_name), expression=value)],
    )
    where_expression = parsed.expression.args.get("where")
    if isinstance(where_expression, exp.Where):
        update.set("where", where_expression.copy())
    return update.sql(dialect="postgres", pretty=False)


def generate_safer_alternative(
    parsed: ParsedSQL,
    target_metadata: TableMetadata,
    *,
    direct_rows: int,
) -> SaferAlternative:
    column_names = {column.name for column in target_metadata.columns}
    if "deleted_at" in column_names:
        sql = _build_update_sql(parsed, "deleted_at")
    elif "is_deleted" in column_names:
        sql = _build_update_sql(parsed, "is_deleted")
    else:
        return SaferAlternative(available=False)

    alternative_risk = calculate_risk(
        operation="UPDATE",
        direct_rows=direct_rows,
        dependencies=[],
        has_where=parsed.has_where,
        recoverable=True,
    )
    return SaferAlternative(
        available=True,
        sql=sql,
        risk_score=alternative_risk.score,
        risk_level=alternative_risk.level,
    )
