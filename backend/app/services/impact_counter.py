from sqlalchemy import Engine, text
from sqlalchemy.exc import DBAPIError

from app.core.errors import AnalysisQueryTimeoutError
from app.db.analysis_connection import analysis_transaction
from app.schemas.analysis import DirectImpact
from app.services.query_planner import build_direct_count_query
from app.services.sql_parser import ParsedSQL


def count_direct_impact(parsed: ParsedSQL, engine: Engine | None = None) -> DirectImpact:
    count_sql = build_direct_count_query(parsed)
    try:
        with analysis_transaction(engine) as connection:
            rows = connection.execute(text(count_sql)).scalar_one()
    except DBAPIError as exc:
        sqlstate = getattr(exc.orig, "sqlstate", None)
        if sqlstate == "57014":
            raise AnalysisQueryTimeoutError() from exc
        raise

    return DirectImpact(table=parsed.table, rows=int(rows), measurement="EXACT")

