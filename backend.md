# BlastShield — Developer 1: Backend + System

## Role

You are the Backend/System engineer working on a two-developer, four-day hackathon project called BlastShield. Another developer is simultaneously building the frontend. Your responsibility is the entire BlastShield execution and analysis system. You must stay strictly inside your ownership boundary.

---

## 0. Absolute Team Rules

### You OWN

```
backend/
mcp_server/
database/
docker-compose.yml
.env.example
Makefile
root README.md
```

### You DO NOT OWN

```
frontend/
```

You must NEVER modify:

- `frontend/app/`
- `frontend/components/`
- `frontend/lib/`
- `frontend/types/`
- `frontend/package.json`
- `frontend/tailwind.config.*`
- `frontend/*` unless explicitly told to

The frontend developer is working there simultaneously. Never "fix" frontend code. Never regenerate frontend files. Never install frontend dependencies. Never change frontend types.

---

## 1. Your Interface With the Frontend Developer

Your responsibility is to expose a **stable HTTP API**. The frontend developer should not need to understand PostgreSQL, SQLGlot, FK traversal, MCP, or execution internals.

```
Frontend
   │
   │ HTTP JSON
   ▼
FastAPI
   │
   ├── SQL analysis
   ├── PostgreSQL
   ├── FK graph
   ├── impact counting
   ├── business impact
   ├── risk
   ├── approval
   ├── revalidation
   └── execution
```

Do not expose internal implementation details unnecessarily.

---

## 2. Product

BlastShield is a pre-execution safety gateway for destructive AI-agent database actions.

TrueForge may propose:

```sql
DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';
```

BlastShield must NOT immediately execute this.

**Correct flow:**

```
TrueForge
     ↓
Proposed SQL
     ↓
BlastShield
     ↓
Parse SQL
     ↓
Read live PostgreSQL schema
     ↓
Build FK dependency graph
     ↓
Count target rows
     ↓
Count correlated dependent rows
     ↓
Analyze cascade behavior
     ↓
Calculate business impact
     ↓
Calculate deterministic risk
     ↓
Return report
     ↓
Human approval
     ↓
Revalidate
     ↓
Execute
```

BlastShield is NOT a sandbox. Analysis occurs against the live/demo PostgreSQL database through a read-only analysis connection.

---

## 3. Core Principle

Always preserve:

```
LLM           → PROPOSE
BlastShield   → MEASURE
Human         → AUTHORIZE
Execution Layer → ENFORCE
```

The LLM never calculates the final safety/risk decision. Risk scoring must be **deterministic Python code**.

---

## 4. Technology

Use:

- Python 3.12+
- FastAPI
- Pydantic
- SQLGlot
- SQLAlchemy 2.x
- psycopg 3
- PostgreSQL
- pytest
- Python MCP server
- Docker Compose

---

## 5. MVP SQL Scope

**Fully support:**

```sql
DELETE FROM table WHERE condition;
```

Especially:

```sql
DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';
```

**Detect but do not fully analyze:**

- `INSERT`
- `UPDATE`
- `TRUNCATE`
- `DROP`
- `ALTER`
- `CREATE`

Return structured unsupported responses. Do not expand the project scope unless `DELETE` works completely end-to-end.

---

## 6. Backend Structure

```
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── analyze.py
│   │   ├── analyses.py
│   │   ├── approvals.py
│   │   ├── execution.py
│   │   └── health.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── security.py
│   │
│   ├── db/
│   │   ├── analysis_connection.py
│   │   ├── execution_connection.py
│   │   ├── app_database.py
│   │   ├── models.py
│   │   └── metadata_queries.py
│   │
│   ├── schemas/
│   │   ├── analysis.py
│   │   ├── impact.py
│   │   ├── risk.py
│   │   ├── approval.py
│   │   └── graph.py
│   │
│   ├── services/
│   │   ├── blastshield_analyzer.py
│   │   ├── action_classifier.py
│   │   ├── sql_parser.py
│   │   ├── schema_analyzer.py
│   │   ├── fk_graph.py
│   │   ├── query_planner.py
│   │   ├── impact_counter.py
│   │   ├── business_impact.py
│   │   ├── risk_engine.py
│   │   ├── safer_alternative.py
│   │   ├── revalidator.py
│   │   └── executor.py
│   │
│   └── repositories/
│       └── analysis_repository.py
│
└── tests/
```

Keep business logic out of route handlers.

---

## 7. Demo Database

Create:

- `users`
- `orders`
- `payments`
- `subscriptions`
- `sessions`

**Relationships:**

```
users
 │
 ├── orders
 │      │
 │      └── payments
 │
 ├── subscriptions
 │
 └── sessions
```

Use real PostgreSQL foreign keys.

**Recommended:**

```sql
users.id
 │
 ├─ orders.user_id        ON DELETE CASCADE
 │     │
 │     └─ payments.order_id  ON DELETE CASCADE
 │
 ├─ subscriptions.user_id ON DELETE CASCADE
 │
 └─ sessions.user_id      ON DELETE CASCADE
```

Create `users.deleted_at` for soft-delete alternative generation.

---

## 8. Database Security

Create two PostgreSQL roles.

### Analyzer — `blastshield_analyzer`

**Allowed:**

- `SELECT`
- `EXPLAIN`
- `COUNT`, `SUM`, `AVG`
- metadata inspection

**Forbidden:**

- `DELETE`
- `UPDATE`
- `INSERT`
- `DROP`
- `ALTER`
- `TRUNCATE`
- `CREATE`

Analysis transactions should also use:

```sql
BEGIN;
SET TRANSACTION READ ONLY;
```

Configure: `statement_timeout`, `lock_timeout`

The database itself must reject writes.

### Executor — `blastshield_executor`

Only executor code receives these credentials. Never pass executor credentials into:

- schema analyzer
- impact analyzer
- FK graph
- business impact
- risk engine
- query planner

---

## 9. SQL Parser

Implement using **SQLGlot AST**. Never regex parse SQL.

**Input:**

```sql
DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';
```

**Produce:**

```json
{
  "operation": "DELETE",
  "schema": "public",
  "table": "users",
  "where": "last_login < NOW() - INTERVAL '2 years'",
  "has_where": true,
  "supported": true
}
```

Reject multiple statements. Example — this must fail:

```sql
DELETE FROM users; DROP TABLE payments;
```

---

## 10. Action Classifier

Classify:

| Operation  | Classification |
|------------|----------------|
| `SELECT`   | SAFE           |
| `INSERT`   | MUTATING       |
| `UPDATE`   | MUTATING       |
| `DELETE`   | DESTRUCTIVE    |
| `TRUNCATE` | DESTRUCTIVE    |
| `DROP`     | DDL            |
| `ALTER`    | DDL            |

For current MVP: `DELETE` = full impact analysis. `DELETE` without `WHERE` must receive near-maximum risk.

---

## 11. Live Schema Discovery

Create dynamic PostgreSQL introspection. **Never hard-code the dependency graph.**

Discover:

- tables
- PKs
- FKs
  - parent table
  - child table
  - parent column
  - child column
  - `ON DELETE` rule
  - `ON UPDATE` rule

Handle:

- `CASCADE`
- `RESTRICT`
- `NO ACTION`
- `SET NULL`
- `SET DEFAULT`

Use PostgreSQL metadata / `pg_catalog`.

---

## 12. FK Dependency Graph

Generate a Python graph.

**Example edge:**

```json
{
  "source": "users",
  "target": "orders",
  "parent_column": "id",
  "child_column": "user_id",
  "on_delete": "CASCADE"
}
```

Support recursive traversal. MVP max depth: **3**. Prevent cycles.

---

## 13. Direct Impact

Transform:

```sql
DELETE FROM users WHERE last_login < ...;
```

Into:

```sql
SELECT COUNT(*) FROM users WHERE last_login < ...;
```

**The DELETE must never execute during analysis.**

---

## 14. Correlated Impact

This is a **CORE** feature.

If 12,000 users are targeted, do NOT count every order in the database — count only their orders.

**Generate:**

```sql
SELECT COUNT(*) FROM orders o
JOIN users u ON o.user_id = u.id
WHERE <original users condition>;
```

Then deeper dependencies:

```sql
SELECT COUNT(*) FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN users u ON o.user_id = u.id
WHERE <original users condition>;
```

Generate these dynamically from FK paths.

---

## 15. FK Behavior

Correctly distinguish:

| On Delete      | Behavior                                    |
|----------------|---------------------------------------------|
| `CASCADE`      | Related rows may be deleted                 |
| `SET NULL`     | Rows remain, FK becomes NULL                |
| `SET DEFAULT`  | FK may change                               |
| `RESTRICT`     | Original DELETE may fail                    |
| `NO ACTION`    | Original DELETE may fail                    |

Do not label every dependency as deletion.

---

## 16. Query Protection

Before expensive exact COUNT queries, use:

```sql
EXPLAIN (FORMAT JSON)
```

**Flow:**

```
COUNT query
     ↓
EXPLAIN
     ↓
cost
     ↓
cheap? ──┬── yes → COUNT
         └── no  → estimate
```

For demo DB, exact counts are preferred. Support `EXACT` / `ESTIMATED` in API output.

---

## 17. Business Impact

Implement configuration-driven logic.

For demo:

- `subscriptions.status = 'active'`
- `subscriptions.monthly_price`

Calculate:

- active subscriptions at risk
- MRR at risk
- ARR at risk

Do not claim generic AI semantic understanding.

---

## 18. Risk Engine

Risk must be **deterministic**.

| Factor              | Max Score |
|---------------------|-----------|
| Operation severity  | 0–25      |
| Direct rows         | 0–20      |
| Dependent rows      | 0–20      |
| Cascade severity    | 0–15      |
| Business impact     | 0–15      |
| Recoverability      | 0–5       |
| **Total**           | **100**   |

**Levels:**

| Score   | Level    |
|---------|----------|
| 0–24    | LOW      |
| 25–49   | MEDIUM   |
| 50–74   | HIGH     |
| 75–100  | CRITICAL |

Return score AND breakdown. Do not call an LLM for scoring.

---

## 19. Safer Alternative

For `DELETE`:

- If `deleted_at` exists:
  ```sql
  UPDATE users SET deleted_at = NOW() WHERE <same condition>;
  ```
- If `is_deleted` exists:
  ```sql
  UPDATE users SET is_deleted = TRUE WHERE <same condition>;
  ```
- If neither exists:
  ```json
  { "available": false }
  ```

Do not invent arbitrary alternatives.

---

## 20. Analysis Persistence

Create analysis records.

**States:** `ANALYZING` · `PENDING_APPROVAL` · `APPROVED` · `REJECTED` · `STALE` · `EXECUTED` · `FAILED`

Store at minimum:

```
analysis_id
original_sql
normalized_sql
operation
target_table
report
risk_score
risk_level
fingerprint
created_at
approved_at
executed_at
```

---

## 21. Frozen API Contract

This contract is extremely important. The frontend developer is building against it. Do not casually rename fields. If a field must change, explain before changing it.

### `POST /api/v1/analyze`

**Request:**

```json
{
  "sql": "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';",
  "source": "ui",
  "reason": "Remove inactive users"
}
```

**Response:**

```json
{
  "analysis_id": "uuid",
  "status": "PENDING_APPROVAL",

  "action": {
    "operation": "DELETE",
    "table": "users",
    "has_where": true
  },

  "impact": {
    "direct_rows": 12481,
    "dependent_rows": 49233,
    "total_rows": 61714
  },

  "dependencies": [
    {
      "table": "orders",
      "rows": 21003,
      "depth": 1,
      "path": ["users", "orders"],
      "on_delete": "CASCADE",
      "effect": "DELETE",
      "measurement": "EXACT"
    }
  ],

  "business_impact": {
    "active_subscriptions": 347,
    "mrr_at_risk": 6116,
    "arr_at_risk": 73392
  },

  "risk": {
    "score": 88,
    "level": "CRITICAL",

    "breakdown": {
      "operation": 20,
      "direct_impact": 20,
      "dependent_impact": 20,
      "cascade": 15,
      "business_impact": 10,
      "recoverability": 4
    },

    "reasons": [
      "12,481 users match the DELETE condition."
    ]
  },

  "graph": {
    "nodes": [
      {
        "id": "users",
        "table": "users",
        "rows": 12481,
        "depth": 0
      }
    ],

    "edges": [
      {
        "id": "users-orders",
        "source": "users",
        "target": "orders",
        "on_delete": "CASCADE"
      }
    ]
  },

  "safer_alternative": {
    "available": true,
    "sql": "UPDATE users SET deleted_at = NOW() WHERE ...",
    "risk_score": 32,
    "risk_level": "MEDIUM"
  },

  "requires_approval": true,

  "timeline": [
    {
      "key": "intercepted",
      "label": "SQL intercepted",
      "status": "complete"
    }
  ]
}
```

---

## 22. Other Frozen Endpoints

Implement:

```
GET  /api/v1/analyses
GET  /api/v1/analyses/{analysis_id}
POST /api/v1/analyses/{analysis_id}/approve
POST /api/v1/analyses/{analysis_id}/reject
POST /api/v1/analyses/{analysis_id}/execute
```

The frontend developer will use these exact routes.

---

## 23. Approval

Approval **DOES NOT** equal execution.

**Correct:**

```
PENDING_APPROVAL
     ↓
  APPROVED
     ↓
user separately executes
```

**Never:**

```
Approve button
     ↓
immediate destructive SQL
```

---

## 24. Revalidation

Before execution, rerun relevant analysis.

**Fingerprint should include:**

- normalized SQL
- FK graph
- direct count
- dependency counts
- business-impact counts

If changed:

```
APPROVED
   ↓
 STALE
```

**Return:**

```json
{
  "executed": false,
  "status": "STALE",
  "code": "ANALYSIS_STALE",
  "message": "Production state changed after approval. Re-analysis is required."
}
```

---

## 25. Execution

Only execute when:

- analysis exists AND
- `status == APPROVED` AND
- revalidation succeeds

Use a transaction.

- Failure → `ROLLBACK` → `FAILED`
- Success → `COMMIT` → `EXECUTED`

There must be no generic `/execute-any-sql` endpoint.

---

## 26. MCP Server

You also own `mcp_server/`.

Expose:

- `blastshield_analyze`
- `blastshield_get_report`
- `blastshield_request_execution`

**TrueForge flow:**

```
User
 ↓
TrueForge
 ↓
proposes DELETE
 ↓
blastshield_analyze
 ↓
BlastShield report
 ↓
WAIT FOR HUMAN
 ↓
approved
 ↓
blastshield_request_execution
```

Never create an MCP execution bypass.

---

## 27. CORS

Allow the frontend local origin via configuration.

**Expected:** `http://localhost:3000`

Do not use unrestricted production CORS defaults.

---

## 28. Errors

Use consistent JSON:

```json
{
  "code": "APPROVAL_REQUIRED",
  "message": "Human approval is required before execution."
}
```

**Possible codes:**

- `UNSUPPORTED_SQL`
- `INVALID_SQL`
- `MULTIPLE_STATEMENTS`
- `APPROVAL_REQUIRED`
- `ANALYSIS_STALE`
- `ANALYSIS_QUERY_TIMEOUT`
- `EXECUTION_FAILED`
- `NOT_FOUND`

The frontend will display these.

---

## 29. Important Backend Tests

Must test:

- `DELETE` parser
- `DELETE` without `WHERE`
- Multiple statements rejected
- FK graph recursion
- Cycle protection
- Correlated counts
- Risk buckets
- Analysis role cannot `DELETE`
- Execution without approval fails
- Stale approval blocks execution
- Approved valid action executes

---

## 30. Do Not Leak Production Data

Prefer:

```sql
COUNT(...)
SUM(...)
AVG(...)
```

Do not return:

```sql
SELECT * FROM users;
```

The frontend needs impact metrics, not sensitive records.

---

## 31. Developer Coordination Rules

You are Developer 1. Developer 2 consumes your API. Therefore:

- Never modify frontend files
- Never change endpoint names without explicitly reporting it
- Never rename JSON fields casually
- Never move business calculations to frontend
- Never tell frontend to query PostgreSQL
- Never make frontend calculate the risk score

**Backend is the source of truth.**

---

## 32. Integration Contract

Frontend may temporarily use mock responses. Mocks must follow the frozen API contract. As soon as backend endpoints work, frontend will switch to real HTTP calls. Your job is to make this possible without frontend rewrites.

---

## 33. Four-Day Work Plan

### Day 1

Build:

- PostgreSQL schema
- Seed data
- DB roles
- FastAPI
- SQLGlot classifier
- Schema introspection
- FK graph
- Direct impact

**Target:**

```
DELETE
 ↓
parse
 ↓
target count
 ↓
FK graph
```

### Day 2

Build:

- Correlated impact
- Cascade semantics
- EXPLAIN
- Business impact
- Risk engine
- Safer alternative
- Analysis persistence
- Complete `/analyze` API

**Target:**

```
SQL
 ↓
complete BlastShield report
```

### Day 3

Build:

- Approve
- Reject
- Revalidation
- Execution
- MCP
- TrueForge integration
- End-to-end tests

**Target:**

```
TrueForge
 ↓
Analyze
 ↓
Approve
 ↓
Revalidate
 ↓
Execute
```

### Day 4

Backend work is only:

- Bug fixes
- Integration fixes
- Demo reliability
- README
- Testing

**Do NOT add major new backend features on Day 4.** Frontend developer owns UI polish.

---

## 34. How to Work

Do not generate everything blindly.

For every phase:

```
inspect
 ↓
implement
 ↓
run
 ↓
test
 ↓
fix
 ↓
report
```

**After each phase report:**

```
FILES CHANGED: ...
WHAT WORKS: ...
TESTS: ...
API CONTRACT CHANGES: NONE
```

If there is no API contract change, explicitly write: `API CONTRACT CHANGES: NONE`

This helps the frontend developer.

---

## 35. Start Now

Start with **backend/system Day 1 only**.

Before editing: inspect repository, identify existing files, preserve working code. Do not touch `frontend/`.

**Then implement:**

- PostgreSQL schema
- Seed data
- Analyzer role
- Executor role
- FastAPI setup
- SQLGlot parser
- Action classifier
- Direct impact
- Schema introspection
- FK graph

**Verify:**

- Postgres runs
- FastAPI runs
- Analyzer `SELECT` works
- Analyzer `DELETE` fails
- `DELETE` SQL parses
- Target row count works
- FK graph comes dynamically from PostgreSQL

Do not start MCP before this works. Do not touch frontend. Do not expand beyond the BlastShield plan.
