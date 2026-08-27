# BlastShield Day 3 Backend Design

## Goal and boundary

Day 3 completes the protected destructive-action lifecycle:

```text
TrueForge
    |
    v
BlastShield analysis
    |
    v
PENDING_APPROVAL
    |
    +---- reject ----> REJECTED
    |
    +---- approve ---> APPROVED
                          |
                    separate execute request
                          |
                     claim execution
                          |
                       revalidate
                    /      |       \
                 stale   valid     error
                   |       |          |
                 STALE  transaction  FAILED
                           |
                        EXECUTED
```

Day 3 owns approval, rejection, revalidation, transactional execution, MCP,
and end-to-end tests. It does not add new SQL operations, risk heuristics, UI
features, undo, or a generic SQL execution endpoint. `DELETE FROM table WHERE
condition` remains the only fully executable SQL shape.

The `frontend/` directory remains outside backend ownership.

## Core invariants

1. Approval never executes SQL.
2. Execution accepts only an existing analysis ID, never arbitrary SQL.
3. Only `APPROVED` analyses can enter the execution path.
4. The SQL executed is the normalized, single DELETE stored during analysis.
5. Revalidation uses the read-only analyzer role and reruns all fingerprinted
   measurements immediately before execution.
6. A fingerprint difference changes the state to `STALE`; no destructive SQL
   is sent to PostgreSQL.
7. Only `executor.py` and `execution_connection.py` may access executor
   credentials.
8. Execution runs in one database transaction: failure rolls back; success
   commits.
9. A record is atomically claimed before revalidation so two execute requests
   cannot both run the DELETE.
10. MCP talks to the HTTP API and cannot bypass human approval.

## State machine

### Allowed transitions

| Current state | Action | Next state |
|---|---|---|
| `PENDING_APPROVAL` | approve | `APPROVED` |
| `PENDING_APPROVAL` | reject | `REJECTED` |
| `APPROVED` | revalidation differs | `STALE` |
| `APPROVED` | valid execution succeeds | `EXECUTED` |
| `APPROVED` | revalidation/execution fails | `FAILED` |

Every other transition is rejected. In particular:

- `REJECTED` cannot be approved or executed;
- `STALE` cannot be re-approved—submit a new analysis;
- `EXECUTED` cannot be executed again;
- `FAILED` requires a new analysis rather than a blind retry.

### Execution claim

Keep the public states frozen. Add an internal `execution_claimed_at` column
instead of exposing a new `EXECUTING` state. Claiming uses one atomic update:

```sql
UPDATE blastshield_control.analyses
SET execution_claimed_at = NOW()
WHERE id = :analysis_id
  AND status = 'APPROVED'
  AND execution_claimed_at IS NULL
RETURNING ...;
```

If no row is returned, the operation is not executable or another execution
request already owns the claim. A process crash leaves the record safely
claimed rather than risking a duplicate DELETE; automated abandoned-claim
recovery is outside the four-day MVP.

## Step-by-step implementation

### Step 1: Extend control-plane persistence

Add an idempotent Day 3 migration with:

```text
rejected_at
rejection_reason
execution_claimed_at
failure_code
failure_message
```

Extend `AnalysisRecord` and `AnalysisRepository` with explicit transition
methods rather than generic status updates:

```text
approve_pending(id)
reject_pending(id, reason)
claim_approved_for_execution(id)
mark_stale(id)
mark_executed(id, executed_at)
mark_failed(id, code, message)
```

Each method must include the expected current status in its SQL predicate.
This provides optimistic concurrency and prevents route handlers from
inventing transitions.

The repository also updates the persisted report status and timeline so GET
responses never disagree with the database row.

### Step 2: Add approval and rejection schemas

Create `schemas/approval.py`:

```json
{
  "actor": "human@example.com",
  "reason": "Reviewed blast radius"
}
```

Both fields are optional for the demo, but timestamps and the resulting state
come from the server.

Return a compact transition response:

```json
{
  "analysis_id": "uuid",
  "status": "APPROVED",
  "approved_at": "2026-08-27T12:00:00Z"
}
```

Rejection returns the same ID with `REJECTED` and `rejected_at`.

### Step 3: Implement approval routes

Add `api/approvals.py`:

```text
POST /api/v1/analyses/{analysis_id}/approve
POST /api/v1/analyses/{analysis_id}/reject
```

Handlers validate input and call repository transition methods only. They
must not import the executor, execution engine, or executor configuration.

Approving a report performs no reanalysis and no domain-table query. It is an
authorization record, not an execution shortcut.

### Step 4: Extract a reusable measurement pipeline

Day 2 `BlastShieldAnalyzer` currently combines measurement, response assembly,
fingerprinting, and persistence. Refactor without changing its public output:

```text
AnalysisPipeline.measure(parsed SQL)
    -> schema metadata
    -> FK graph
    -> direct impact
    -> dependency impacts
    -> business impact
    -> fingerprint payload
```

`BlastShieldAnalyzer` uses the result to create the original report.
`Revalidator` uses the same result without creating a second analysis record.
There must be one fingerprint implementation and one canonical JSON encoding.

Fingerprint inputs remain:

- normalized SQL;
- discovered FK graph including delete rules;
- direct count and measurement type;
- correlated dependency counts and measurement types;
- business-impact aggregates.

Risk and timeline are excluded because they are derived presentation data.

### Step 5: Implement revalidation

Create `services/revalidator.py`:

1. Load the claimed `APPROVED` record.
2. Parse the stored normalized SQL again with SQLGlot.
3. Rerun the shared measurement pipeline through the analyzer engine.
4. Calculate a new fingerprint.
5. Compare it with the approved fingerprint using constant-time comparison.
6. Return `VALID` only when they match exactly.

If any count, estimate/exact mode, business aggregate, FK edge, or FK action
changes, persist `STALE` and return:

```json
{
  "executed": false,
  "status": "STALE",
  "code": "ANALYSIS_STALE",
  "message": "Production state changed after approval. Re-analysis is required."
}
```

Revalidation never updates the old report with new measurements; the user
must create and review a new analysis.

### Step 6: Isolate the execution connection

Create `db/execution_connection.py` with a dedicated engine built only from:

```text
BLASTSHIELD_EXECUTION_DATABASE_URL
```

Do not add this URL to analyzer settings passed into schema, graph, impact,
business, risk, or revalidation services. Only the execution service imports
the engine factory.

At startup or in a health diagnostic, verify `current_user` is
`blastshield_executor`. Never log the URL or password.

### Step 7: Implement the transactional executor

Create `services/executor.py`:

1. Accept an already claimed analysis record, not raw SQL.
2. Parse the stored normalized SQL again.
3. Require exactly one supported DELETE AST.
4. Confirm operation, schema, and table match persisted fields.
5. Begin an executor transaction.
6. Apply local `statement_timeout` and `lock_timeout`.
7. Execute the stored normalized SQL once.
8. Capture the direct affected-row count.
9. Commit on success.
10. Roll back and raise `EXECUTION_FAILED` on any error.

The executor exposes no method named `execute_sql(sql)` to routes or MCP. Its
public method should accept an analysis record or strongly typed execution
command assembled by the execution coordinator.

### Step 8: Coordinate execution

Create a coordinator service used by the route:

```text
claim APPROVED analysis
        |
        v
read-only revalidation
   | stale       | valid
   v             v
 mark STALE   executor transaction
                  | failure   | success
                  v           v
               FAILED      EXECUTED
```

Failure before SQL begins and failure during SQL both end in `FAILED`, but
store a precise internal failure code and safe user-facing message.

Because the executor and control plane use separate least-privileged roles,
their commits cannot be one PostgreSQL transaction. The safe ordering is:

1. persist the execution claim;
2. revalidate;
3. execute and commit the DELETE;
4. persist `EXECUTED`.

This ordering prevents duplicate execution. A crash after step 3 can leave a
claimed `APPROVED` record even though data changed; Day 4 should add a manual
reconciliation diagnostic. Never automatically retry a claimed execution.

### Step 9: Add the execution route

Add `api/execution.py`:

```text
POST /api/v1/analyses/{analysis_id}/execute
```

The request contains no SQL. Success returns:

```json
{
  "analysis_id": "uuid",
  "executed": true,
  "status": "EXECUTED",
  "affected_rows": 40,
  "executed_at": "2026-08-27T12:01:00Z"
}
```

An analysis that is not approved returns HTTP 409:

```json
{
  "code": "APPROVAL_REQUIRED",
  "message": "Human approval is required before execution."
}
```

Database failure returns `EXECUTION_FAILED`; missing IDs return `NOT_FOUND`.
There must be no `/execute-any-sql`, query parameter, or request-body SQL.

### Step 10: Keep persisted reports synchronized

After approve, reject, stale detection, failure, or successful execution,
update these stored report fields:

- top-level `status`;
- `requires_approval` where appropriate;
- timeline entries and statuses.

Do not recalculate the risk score after approval. GET detail and list remain
compatible with the Day 2 frozen report contract.

### Step 11: Build the MCP server only after HTTP execution passes

Create `mcp_server/` with exactly these tools:

| Tool | HTTP behavior |
|---|---|
| `blastshield_analyze` | calls `POST /api/v1/analyze` |
| `blastshield_get_report` | calls `GET /api/v1/analyses/{id}` |
| `blastshield_request_execution` | calls the execute endpoint for an approved ID |

The MCP process stores only the BlastShield API base URL. It receives no
PostgreSQL credentials.

Tool behavior:

- `blastshield_analyze` returns the risk report and explicitly says human
  approval is required;
- `blastshield_get_report` exposes the current persisted state;
- `blastshield_request_execution` forwards the analysis ID and faithfully
  returns approval-required, stale, failed, or executed responses;
- no MCP tool approves an analysis;
- no MCP tool accepts arbitrary SQL for execution;
- no execution bypass exists.

TrueForge flow:

```text
propose DELETE
      |
blastshield_analyze
      |
WAIT FOR HUMAN
      |
human calls approve endpoint
      |
blastshield_request_execution
      |
revalidate -> execute or stop
```

### Step 12: End-to-end verification

Use a fresh disposable PostgreSQL volume. Tests must verify:

1. execution without approval returns `APPROVAL_REQUIRED` and changes no rows;
2. approve changes only analysis state and changes no business-table rows;
3. reject changes state and permanently blocks execution;
4. unchanged approved analysis revalidates and executes;
5. successful execution deletes exactly 40 users plus the measured fixture
   cascades (`100 orders`, `100 payments`, `20 subscriptions`, `32 sessions`);
6. a changed direct count makes the approval `STALE` and blocks execution;
7. a changed dependency count makes the approval `STALE`;
8. a changed FK delete rule makes the approval `STALE`;
9. two simultaneous execute requests result in at most one DELETE;
10. executor failure rolls back and stores `FAILED`;
11. analyzer still cannot DELETE and app role still cannot read business data;
12. executor cannot update `blastshield_control.analyses`;
13. multiple-statement stored SQL is rejected before execution;
14. MCP tools mirror HTTP behavior and cannot approve or bypass execution;
15. the complete TrueForge-style analyze -> human approve -> request execution
    flow passes end to end.

## Error and status matrix

| Situation | HTTP | Code/status | Destructive SQL sent? |
|---|---:|---|---|
| analysis missing | 404 | `NOT_FOUND` | no |
| pending/rejected/stale/failed | 409 | `APPROVAL_REQUIRED` or state error | no |
| execution already claimed | 409 | `EXECUTION_FAILED` | no |
| fingerprint changed | 409 | `ANALYSIS_STALE` / `STALE` | no |
| revalidation timeout | 503 | `ANALYSIS_QUERY_TIMEOUT` / `FAILED` | no |
| DELETE fails | 500 | `EXECUTION_FAILED` / `FAILED` | attempted, rolled back |
| valid approved DELETE | 200 | `EXECUTED` | once |

## Implementation order and stopping rules

Implement in this order:

```text
1. migration + repository transitions
2. approve/reject routes and tests
3. shared measurement pipeline refactor
4. revalidator and stale tests
5. isolated execution engine
6. transactional executor
7. execution coordinator and route
8. concurrency and rollback tests
9. complete HTTP end-to-end test
10. MCP server and mocked HTTP tests
11. TrueForge-style end-to-end test
12. README and integration handoff
```

Do not start MCP while approval, stale blocking, rollback, or successful HTTP
execution is failing. Do not add Day 4 features while a Day 3 acceptance test
is red.

After each phase report:

```text
FILES CHANGED: ...
WHAT WORKS: ...
TESTS: ...
API CONTRACT CHANGES: NONE
```

## Day 3 definition of done

Day 3 is complete only when all of the following are true:

- approval and rejection enforce the state machine;
- approval alone never changes domain rows;
- execution without approval is impossible;
- revalidation detects live database drift;
- stale approval never executes;
- valid execution commits once in one transaction;
- failure rolls back and is persisted;
- executor credentials remain isolated;
- the frozen endpoint names and Day 2 report fields remain unchanged;
- all three MCP tools work through HTTP with no bypass;
- the disposable end-to-end flow passes repeatedly;
- no frontend files were modified.

