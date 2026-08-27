# BlastShield Day 4 Release Record

## Baseline

- Baseline commit: `649451b0a9f5dd956153674cd5211edff0fa03e1`
- Backend version: `0.4.0`
- Python: `3.12.3`
- Docker: `29.0.0`
- Docker Compose: `2.40.3`
- Verification date: `2026-08-27`

Configuration was verified with credentials redacted. Analyzer timeout was
5,000 ms, analyzer lock timeout 1,000 ms, executor timeout 10,000 ms, executor
lock timeout 2,000 ms, exact-count cost threshold 100,000, FK depth 3, and CORS
origin `http://localhost:3000`.

## Frozen routes

```text
GET  /api/v1/health
POST /api/v1/analyze
GET  /api/v1/analyses
GET  /api/v1/analyses/{analysis_id}
POST /api/v1/analyses/{analysis_id}/approve
POST /api/v1/analyses/{analysis_id}/reject
POST /api/v1/analyses/{analysis_id}/execute
```

OpenAPI contains no execution request body and no generic execution route.

## Verification results

- Unit/API/MCP: `50 passed`
- Fresh PostgreSQL integration: `8 passed`
- Fresh initialization: passed
- Simulated Day 3 volume upgrade: passed; 11/11 reports preserved and
  `target_schema` backfilled to `public`
- Migration rerun/idempotency: passed
- Non-destructive `make demo-check`: passed
- Live HTTP analyze -> approve -> execute: passed
- Approval data delta: 0 users
- Execution direct delta: 40 users
- Persisted state after backend restart: `EXECUTED`
- Duplicate execution: blocked with `APPROVAL_REQUIRED`
- MCP report state: matched HTTP `EXECUTED`
- Role security matrix: passed
- Credential/traceback log inspection: passed
- Database outage response: HTTP 503 `DATABASE_UNAVAILABLE`; no traceback or
  connection string leaked
- Frontend files changed: none

The integration matrix covers direct, dependent, business, and FK-graph drift;
stale blocking; concurrent claims; statement-timeout rollback; FK-restriction
rollback; exact cascades; and analyzer/app/executor permission isolation.

## Performance

Twenty unchanged analyses on the fresh fixture:

| Statistic | Duration |
|---|---:|
| Minimum | 27.38 ms |
| Median | 33.72 ms |
| p95 | 53.37 ms |
| Maximum | 62.28 ms |

All metrics and fingerprints were stable. Every dependency measurement was
`EXACT`. Frozen fixture result: 292 total rows, 406 MRR, risk 60/HIGH.

## Rehearsal

Ten isolated databases were cloned from one pristine fixture. Every rehearsal
performed analyze -> human approve -> revalidate -> execute -> persisted GET ->
duplicate block.

- Result: `10/10 passed`
- Median full lifecycle: `214.31 ms`
- Maximum full lifecycle: `260.26 ms`
- Every run: 292-row report, risk 60, approval delta 0, direct execution delta
  40, final state `EXECUTED`

## Release gate

- P0 issues: none
- P1 issues: none
- API contract changes: none
- Known limitations: documented in the root README

FILES CHANGED: Day 4 schema migration, schema verification, safe error
handlers, lifecycle logs, preflight, regression tests, Makefile, README, and
this release record.

WHAT WORKS: complete protected DELETE lifecycle from live analysis through
human approval, revalidation, execute-once transaction, persistence, HTTP, and
MCP.

TESTS: all automated, live, performance, upgrade, restart, security, and
rehearsal gates above passed.

OPEN ISSUES: no release-blocking issue. Known architectural limits are
explicitly documented.

API CONTRACT CHANGES: NONE.
