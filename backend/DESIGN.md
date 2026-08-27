# BlastShield Day 1 Backend Design

## Scope and boundaries

This design implements only the Day 1 backend/system scope from `backend.md`:

- a PostgreSQL demo schema and deterministic fixture;
- separate analyzer and executor database roles;
- a FastAPI application foundation with configured CORS and health checks;
- SQLGlot-based single-statement parsing and action classification;
- safe construction and execution of a direct-impact `COUNT` query;
- live PostgreSQL table, column, primary-key, and foreign-key discovery;
- recursive parent-to-child FK traversal to depth three with cycle protection.

It does not implement persistence, dependent-row counting, risk scoring,
approval, revalidation, execution, or MCP. Those are later phases in the
source plan. The frozen `POST /api/v1/analyze` endpoint is intentionally not
published with an incomplete or misleading response. Day 2 can add it once
every frozen response field can be calculated truthfully.

The `frontend/` tree is outside this design and must not be changed.

## Runtime architecture

```text
HTTP health check
       |
       v
    FastAPI

DELETE SQL
   |
   v
SQLGlot parser -- reject invalid/multiple statements
   |
   +--> action classifier
   |
   +--> SELECT COUNT(*) query planner
   |          |
   |          v
   |    read-only analyzer transaction
   |
   +--> pg_catalog introspection --> FK graph traversal (max depth 3)
```

The application owns only analyzer credentials in Day 1. Executor credentials
are provisioned for the later execution layer but are not loaded by analysis
services.

## Security invariants

1. SQL is parsed as a PostgreSQL AST; regex is never used to classify or
   extract a statement.
2. More than one parsed statement is rejected before any database access.
3. Direct impact is measured by generating a new `SELECT COUNT(*)` AST. The
   submitted `DELETE` is never sent to PostgreSQL by the analysis path.
4. Every analysis connection begins a read-only transaction and applies local
   statement and lock timeouts.
5. The `blastshield_analyzer` role receives only schema usage and table
   `SELECT`; PostgreSQL therefore independently rejects writes.
6. FK relationships are discovered from `pg_catalog`, not encoded in Python.
7. Graph traversal is bounded and tracks tables already present in each path,
   preventing cyclic schemas from recursing forever.

## Modules

- `services/sql_parser.py`: parse once, normalize, and extract DELETE target and
  predicate.
- `services/action_classifier.py`: deterministic operation classification.
- `services/query_planner.py`: build the direct count query from AST nodes.
- `services/impact_counter.py`: execute only the generated count query through
  the analyzer transaction.
- `db/metadata_queries.py`: parameterized `pg_catalog` queries.
- `services/schema_analyzer.py`: convert catalog rows into typed metadata.
- `services/fk_graph.py`: traverse discovered relationships and produce API-
  ready nodes, edges, and paths.
- `db/analysis_connection.py`: the sole Day 1 database capability.

## Day 1 verification

Unit tests cover DELETE parsing, missing predicates, multi-statement rejection,
classification, count-query generation, recursive graph traversal, depth
limits, and cycles. PostgreSQL integration tests additionally prove that the
analyzer can select but cannot delete, direct counts work, and the expected FK
graph is obtained from live catalog metadata.

