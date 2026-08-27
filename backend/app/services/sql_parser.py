from dataclasses import dataclass

from sqlglot import exp, parse
from sqlglot.errors import ParseError

from app.core.errors import (
    InvalidSQLError,
    MultipleStatementsError,
    UnsupportedSQLError,
)
from app.schemas.analysis import ParsedSQLView


@dataclass(frozen=True, slots=True)
class ParsedSQL:
    operation: str
    schema_name: str
    table: str
    where_sql: str | None
    has_where: bool
    supported: bool
    normalized_sql: str
    expression: exp.Expression
    target: exp.Table

    def to_view(self) -> ParsedSQLView:
        return ParsedSQLView(
            operation=self.operation,
            schema_name=self.schema_name,
            table=self.table,
            where=self.where_sql,
            has_where=self.has_where,
            supported=self.supported,
            normalized_sql=self.normalized_sql,
        )


def _operation_name(statement: exp.Expression) -> str:
    operation_types: tuple[tuple[type[exp.Expression], str], ...] = (
        (exp.Select, "SELECT"),
        (exp.Insert, "INSERT"),
        (exp.Update, "UPDATE"),
        (exp.Delete, "DELETE"),
        (exp.Drop, "DROP"),
        (exp.Alter, "ALTER"),
        (exp.Create, "CREATE"),
    )
    truncate_type = getattr(exp, "TruncateTable", None)
    if truncate_type is not None and isinstance(statement, truncate_type):
        return "TRUNCATE"
    for expression_type, name in operation_types:
        if isinstance(statement, expression_type):
            return name
    return statement.key.upper()


def parse_sql(sql: str) -> ParsedSQL:
    if not sql or not sql.strip():
        raise InvalidSQLError("SQL must not be empty.")

    try:
        statements = [statement for statement in parse(sql, read="postgres") if statement]
    except ParseError as exc:
        raise InvalidSQLError("The SQL statement could not be parsed.") from exc

    if len(statements) != 1:
        raise MultipleStatementsError()

    statement = statements[0]
    operation = _operation_name(statement)
    if not isinstance(statement, exp.Delete):
        raise UnsupportedSQLError(
            f"{operation} is detected but only DELETE is fully supported in the MVP."
        )

    target = statement.this
    if not isinstance(target, exp.Table) or not target.name:
        raise UnsupportedSQLError("DELETE must target one concrete table.")

    unsupported_features = (
        statement.args.get("using"),
        statement.args.get("returning"),
        statement.args.get("with"),
        statement.args.get("with_"),
    )
    if any(unsupported_features):
        raise UnsupportedSQLError(
            "DELETE with USING, RETURNING, or CTE clauses is outside the MVP scope."
        )

    where_expression = statement.args.get("where")
    where_sql = (
        where_expression.this.sql(dialect="postgres")
        if isinstance(where_expression, exp.Where)
        else None
    )

    return ParsedSQL(
        operation="DELETE",
        schema_name=target.db or "public",
        table=target.name,
        where_sql=where_sql,
        has_where=where_expression is not None,
        supported=True,
        normalized_sql=statement.sql(dialect="postgres", pretty=False),
        expression=statement,
        target=target,
    )
