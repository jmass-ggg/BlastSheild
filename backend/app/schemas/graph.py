from pydantic import BaseModel, Field


class ColumnMetadata(BaseModel):
    name: str
    data_type: str
    nullable: bool


class TableMetadata(BaseModel):
    schema_name: str
    name: str
    columns: list[ColumnMetadata] = Field(default_factory=list)
    primary_key: list[str] = Field(default_factory=list)


class ForeignKeyRelationship(BaseModel):
    constraint_name: str
    parent_schema: str
    parent_table: str
    parent_column: str
    child_schema: str
    child_table: str
    child_column: str
    on_delete: str
    on_update: str


class SchemaMetadata(BaseModel):
    tables: list[TableMetadata] = Field(default_factory=list)
    foreign_keys: list[ForeignKeyRelationship] = Field(default_factory=list)


class GraphNode(BaseModel):
    id: str
    table: str
    schema_name: str
    depth: int


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    parent_column: str
    child_column: str
    on_delete: str
    on_update: str


class DependencyPath(BaseModel):
    tables: list[str]
    depth: int
    edge_ids: list[str]


class ForeignKeyGraph(BaseModel):
    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)
    paths: list[DependencyPath] = Field(default_factory=list)

