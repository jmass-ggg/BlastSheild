from pydantic import BaseModel


class ParsedSQLView(BaseModel):
    operation: str
    schema_name: str
    table: str
    where: str | None
    has_where: bool
    supported: bool
    normalized_sql: str


class DirectImpact(BaseModel):
    table: str
    rows: int
    measurement: str = "EXACT"

