# BlastShield Day 4 Stabilization and Demo-Readiness Design

## Purpose

Day 4 is a release-hardening day, not a feature day. Its job is to make the
completed Day 1-3 backend reliable, understandable, repeatable, and safe for
the demo and frontend integration.

Allowed work:

- bug fixes;
- frontend/backend integration fixes that preserve the frozen contract;
- deterministic demo reliability;
- security regression checks;
- performance checks;
- README and runbook improvements;
- test coverage for discovered failures.

Not allowed:

- new SQL operation support;
- new risk factors or AI-based scoring;
- undo, sandbox, policy engine, or unrelated product features;
- endpoint renames or response-field changes;
- MCP tools beyond the three specified for Day 3;
- frontend implementation or frontend dependency changes.

## Current entry-gate status

Day 4 must not be declared complete until Day 3 is implemented—not merely
designed. The Day 3 implementation and its entry-gate verification are now
complete.

Current verified baseline:

- Day 1-Day 3 unit and MCP tests pass (`47 passed`);
- Python compilation passes;
- Docker Compose configuration validates;
- all seven PostgreSQL integration tests pass on a fresh disposable stack;
- the real HTTP analyze -> approve -> execute lifecycle passes;
- analyzer, app, and executor database permissions remain isolated;
- the MCP client mirrors HTTP and cannot execute a pending analysis;
- no frontend-owned files were changed.

The Day 4 entry gate is closed and stabilization may begin. Re-run this gate on
the release candidate; if a criterion regresses, stop stabilization and repair
the Day 3 behavior first.

## Day 4 entry criteria

All items below must be green before stabilization begins:

1. `POST /api/v1/analyze` returns the frozen complete report.
2. Approve and reject endpoints enforce valid state transitions.
3. Approval alone changes no domain data.
4. Execution without approval is rejected.
5. Revalidation detects direct, dependent, business, and FK graph drift.
6. Stale analysis never executes.
7. Valid approved execution commits exactly once.
8. Failed execution rolls back.
9. Analyzer, app, and executor credentials remain isolated.
10. All three MCP tools work only through the HTTP gateway.
11. The full disposable end-to-end test passes.
12. No frontend-owned files were changed by backend work.

## Stabilization workflow

Every Day 4 issue follows:

```text
reproduce
   |
classify severity
   |
write or strengthen failing test
   |
make smallest backend-owned fix
   |
run focused test
   |
run full regression suite
   |
record result and API contract status
```

Avoid broad refactors. A refactor is allowed only when it removes a proven
demo blocker and has direct regression coverage.

## Step-by-step Day 4 plan

### Step 1: Freeze scope and capture a release baseline

Create a release checklist containing:

- current commit SHA;
- Python and Docker versions;
- active configuration values with secrets redacted;
- complete unit/integration/end-to-end test counts;
- API route list from OpenAPI;
- migration status;
- expected fixture metrics;
- known limitations.

Tag failures as:

| Severity | Meaning | Day 4 action |
|---|---|---|
| P0 | safety bypass, data corruption, execution without approval | stop everything and fix |
| P1 | demo flow or frozen API is broken | fix before rehearsal |
| P2 | confusing error, docs, logs, or non-critical reliability | fix if low risk |
| P3 | enhancement or cosmetic improvement | defer |

No P0 or P1 item may be deferred.

### Step 2: Verify clean and upgraded database paths

Test two isolated Compose projects:

1. fresh volume: all initialization scripts run in order;
2. Day 2-style existing volume: Day 3 migrations upgrade it idempotently.

For both paths verify:

- `postgres`, `migrate`, and `backend` reach expected health/exit states;
- rerunning migrations exits zero and changes no data;
- demo seed counts are deterministic;
- roles and grants match the security matrix;
- the backend can restart without losing persisted analyses;
- container startup has no unexpected errors or tracebacks.

Never solve migration failures by instructing the user to delete a real
database volume. Destructive volume reset is acceptable only for explicitly
named disposable verification projects.

### Step 3: Audit the frozen HTTP contract

Compare live OpenAPI and real JSON responses with the contract:

```text
POST /api/v1/analyze
GET  /api/v1/analyses
GET  /api/v1/analyses/{analysis_id}
POST /api/v1/analyses/{analysis_id}/approve
POST /api/v1/analyses/{analysis_id}/reject
POST /api/v1/analyses/{analysis_id}/execute
```

Verify:

- route names are exact;
- Day 2 report fields were not renamed or removed;
- timestamps and UUIDs serialize consistently;
- MRR and ARR remain JSON numbers;
- state changes appear in GET responses;
- every documented error uses `{code, message}`;
- CORS allows the configured `http://localhost:3000` origin;
- no internal database, credential, traceback, or raw record data leaks.

If frontend integration reveals a mismatch, prefer an additive backend
compatibility fix. Do not modify frontend-owned files or require frontend code
to calculate impact or risk.

### Step 4: Run the complete safety regression matrix

The final suite must cover:

#### Parsing and analysis

- valid DELETE with and without WHERE;
- invalid SQL;
- multiple statements;
- unsupported INSERT, UPDATE, TRUNCATE, DROP, ALTER, and CREATE;
- dynamic FK recursion and cycle protection;
- exact and estimated measurement branches;
- all ON DELETE behaviors;
- correlated depth-1 and depth-2 counts;
- deterministic business impact, risk, and fingerprint;
- schema-supported safer alternatives only.

#### Authorization and lifecycle

- approve only from `PENDING_APPROVAL`;
- reject only from `PENDING_APPROVAL`;
- approve performs no DELETE;
- rejected, stale, failed, and executed records cannot execute;
- missing analysis returns `NOT_FOUND`;
- duplicate and concurrent execute requests run at most once.

#### Revalidation and execution

- unchanged fingerprint executes;
- changed direct count blocks;
- changed dependent count blocks;
- changed business aggregate blocks;
- changed FK graph or delete rule blocks;
- execution timeout rolls back;
- FK restriction failure rolls back;
- successful execution matches measured direct and cascade deltas;
- status and timeline persist after restart.

#### Security

- analyzer can SELECT/COUNT/EXPLAIN and cannot write or create;
- app role can mutate only control-plane analyses;
- executor can mutate domain tables and cannot mutate control records;
- MCP has no database URL;
- no route or MCP tool executes request-body SQL;
- no generic execute endpoint exists.

### Step 5: Measure demo performance and remove flakiness

Run the main analysis at least 20 times on a fresh fixture and record:

- minimum, median, p95, and maximum duration;
- exact versus estimated measurement mode;
- direct/dependent/business metrics;
- fingerprint stability when data is unchanged.

Target: the demo analysis should normally complete in under one second on the
fixture. If it does not:

1. identify the slow query with EXPLAIN;
2. confirm indexes support root predicates and FK joins;
3. fix only the demonstrated bottleneck;
4. preserve statement and lock timeouts;
5. rerun correctness tests before accepting the optimization.

Do not replace exact demo values with hard-coded responses.

Eliminate timing-dependent tests by using fixed fixture expectations, explicit
health waits, and isolated Compose project names and ports.

### Step 6: Harden errors and operational logs

Logs should make the lifecycle diagnosable without leaking data:

```text
analysis_id
event
status_before
status_after
duration_ms
measurement_mode
error_code
```

Do not log:

- database URLs or passwords;
- full customer rows;
- raw payment/session values;
- executor credentials;
- unredacted exception connection strings.

Verify safe behavior for database unavailable, analysis timeout, migration
failure, stale state, execution timeout, and transaction failure. Expected
failures must produce structured responses rather than generic HTML or stack
traces.

### Step 7: Create the demo preflight and runbook

Add a non-destructive `make demo-check` or equivalent that verifies:

1. required environment variables are present;
2. Docker is available;
3. Compose configuration is valid;
4. PostgreSQL and migrations are ready;
5. backend health succeeds;
6. analyzer and executor roles are the expected users;
7. fixture row counts match the starting state;
8. the analysis endpoint returns the expected report shape;
9. no previously claimed/executed demo analysis will interfere.

The preflight must not approve, execute, reset, truncate, or delete data.

Document two runbooks:

#### Normal demo

```text
start stack
run preflight
analyze inactive-user DELETE
show blast radius and business impact
human approve
separate execution request
show revalidation and committed cascade deltas
```

#### Safe reset

Reset only the explicitly named local demo project/volume. Print a warning and
the exact target before any destructive reset. Never use a broad volume or
directory target.

### Step 8: Rehearse the full story ten times

Run ten clean rehearsals. Each must prove:

- analysis metrics are stable;
- risk score is stable;
- approval does not execute;
- execution revalidates;
- execution occurs once;
- post-execution counts match the report;
- MCP returns the same state as HTTP;
- the story completes within the demo time budget.

Record pass/fail and duration for every run. Any intermittent failure becomes
a P1 issue and must be reproduced and fixed before release.

Prepare a fallback recording only after the live path is green. A recording is
not a substitute for passing tests.

### Step 9: Final documentation and handoff

The root README must include:

- architecture summary;
- prerequisites;
- environment-variable reference;
- fresh install and existing-volume upgrade;
- local startup and shutdown;
- unit, integration, and end-to-end test commands;
- complete API route list;
- MCP configuration and tools;
- demo runbook;
- security model;
- known limitations;
- troubleshooting for ports, migrations, timeouts, and stale analyses.

State the known limits clearly:

- FK analysis does not see triggers, rules, or application-level cascades;
- read-only counts are not a point-in-time snapshot with execution;
- revalidation reduces but cannot eliminate an external TOCTOU race;
- an executor commit followed by control-plane persistence failure requires
  manual reconciliation;
- only the BlastShield/MCP path is protected;
- only the MVP DELETE shape is executable.

Provide the frontend developer with the route list, example success and error
responses, CORS origin, and explicit statement:

```text
API CONTRACT CHANGES: NONE
```

### Step 10: Release gate

Release only when:

- all Day 3 entry criteria pass;
- all automated tests pass from a clean checkout;
- both fresh and upgraded database paths pass;
- no P0 or P1 issue remains;
- 10/10 rehearsals pass;
- OpenAPI and frozen response contract match;
- security role matrix passes;
- migrations are idempotent;
- logs contain no secrets or production records;
- README and demo runbook are accurate;
- no frontend-owned files were modified.

## Recommended Day 4 implementation order

```text
1. verify Day 3 entry gate
2. freeze scope and capture baseline
3. test fresh and upgraded database paths
4. run full safety and contract suites
5. fix P0/P1 issues with regression tests
6. benchmark and remove demonstrated flakiness
7. add non-destructive demo preflight
8. finish README and troubleshooting
9. complete ten rehearsals
10. publish final handoff
```

## Required phase report

After each Day 4 phase, report:

```text
FILES CHANGED: ...
WHAT WORKS: ...
TESTS: ...
OPEN ISSUES: ...
API CONTRACT CHANGES: NONE
```

## Definition of done

Day 4 is complete when BlastShield can repeatedly demonstrate:

```text
propose DELETE
    -> analyze live schema and correlated impact
    -> calculate deterministic business risk
    -> wait for human approval
    -> approve without executing
    -> separately request execution
    -> revalidate unchanged production state
    -> execute once in a transaction
    -> persist and display EXECUTED
```

The result must be reproducible from a clean checkout without live debugging,
without API contract changes, without credential leakage, and without touching
frontend-owned files.
