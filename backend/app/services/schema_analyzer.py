from collections import defaultdict

from sqlalchemy import Engine

from app.db.analysis_connection import analysis_transaction
from app.db.metadata_queries import (
    COLUMNS_QUERY,
    FOREIGN_KEYS_QUERY,
    PRIMARY_KEYS_QUERY,
    TABLES_QUERY,
)
from app.schemas.graph import (
    ColumnMetadata,
    ForeignKeyRelationship,
    SchemaMetadata,
    TableMetadata,
)


def discover_schema(schema: str = "public", engine: Engine | None = None) -> SchemaMetadata:
    with analysis_transaction(engine) as connection:
        table_rows = connection.execute(TABLES_QUERY, {"schema": schema}).mappings().all()
        column_rows = connection.execute(COLUMNS_QUERY, {"schema": schema}).mappings().all()
        primary_key_rows = (
            connection.execute(PRIMARY_KEYS_QUERY, {"schema": schema}).mappings().all()
        )
        foreign_key_rows = (
            connection.execute(FOREIGN_KEYS_QUERY, {"schema": schema}).mappings().all()
        )

    columns_by_table: dict[str, list[ColumnMetadata]] = defaultdict(list)
    for row in column_rows:
        columns_by_table[row["table_name"]].append(
            ColumnMetadata(
                name=row["column_name"],
                data_type=row["data_type"],
                nullable=row["nullable"],
            )
        )

    primary_keys_by_table: dict[str, list[str]] = defaultdict(list)
    for row in primary_key_rows:
        primary_keys_by_table[row["table_name"]].append(row["column_name"])

    tables = [
        TableMetadata(
            schema_name=row["table_schema"],
            name=row["table_name"],
            columns=columns_by_table[row["table_name"]],
            primary_key=primary_keys_by_table[row["table_name"]],
        )
        for row in table_rows
    ]

    foreign_keys = [
        ForeignKeyRelationship(
            constraint_name=row["constraint_name"],
            parent_schema=row["parent_schema"],
            parent_table=row["parent_table"],
            parent_column=row["parent_column"],
            child_schema=row["child_schema"],
            child_table=row["child_table"],
            child_column=row["child_column"],
            on_delete=row["on_delete"],
            on_update=row["on_update"],
        )
        for row in foreign_key_rows
    ]

    return SchemaMetadata(tables=tables, foreign_keys=foreign_keys)

