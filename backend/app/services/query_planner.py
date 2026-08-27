from sqlglot import exp

from app.core.errors import UnsupportedSQLError
from app.services.sql_parser import ParsedSQL


def build_direct_count_query(parsed: ParsedSQL) -> str:
    if parsed.operation != "DELETE":
        raise UnsupportedSQLError("Direct impact counting currently supports DELETE only.")

    count_query = exp.select(exp.func("COUNT", exp.Star())).from_(parsed.target.copy())
    where_expression = parsed.expression.args.get("where")
    if isinstance(where_expression, exp.Where):
        count_query = count_query.where(where_expression.this.copy())

    return count_query.sql(dialect="postgres", pretty=False)

