# BlastShield Day 2 Backend Design

## Goal and ownership

Day 2 turns the Day 1 parser, catalog reader, and FK graph into a complete,
persisted analysis report for the frozen `POST /api/v1/analyze` contract.
Only backend-owned files are in scope. Approval, rejection, revalidation,
execution, and MCP remain Day 3 work, and `frontend/` remains untouched.

## Step-by-step implementation

### 1. Separate control-plane persistence

Create `blastshield_control.analyses` and a third, least-privileged
`blastshield_app` role. This role can write analysis records but cannot mutate
the demo/business tables. The analyzer still receives only read access, and
the executor does not receive access to the control schema.

The record lifecycle used on Day 2 is:

```text
ANALYZING -> PENDING_APPROVAL
     |
     +-----> FAILED
```

Each successful record stores the original and normalized SQL, complete JSON
report, deterministic risk result, and a SHA-256 analysis fingerprint.

### 2. Build correlated queries from FK paths

For every path produced by the dynamic Day 1 graph, generate a new SQLGlot
`SELECT COUNT(*)` AST. A path such as `users -> orders -> payments` becomes a
join from payments back to the targeted users. The original root predicate is
qualified against the root alias so `WHERE id < 20` cannot become ambiguous.

No submitted `DELETE` node is executed or embedded in an analysis query.

### 3. Protect exact counts with EXPLAIN

Every count follows this policy in the same read-only transaction:

```text
generated COUNT
      |
EXPLAIN (FORMAT JSON)
      |
total cost <= configured ceiling?
      | yes                    | no
      v                        v
execute COUNT             use plan estimate
measurement=EXACT         measurement=ESTIMATED
```

The demo ceiling favors exact results. Statement and lock timeouts from Day 1
still apply independently.

### 4. Preserve FK behavior

Each dependency report carries the discovered `ON DELETE` behavior and a
deterministic effect:

| FK behavior | Reported effect |
|---|---|
| `CASCADE` | `DELETE` |
| `SET NULL` | `SET_NULL` |
| `SET DEFAULT` | `SET_DEFAULT` |
| `RESTRICT` / `NO ACTION` | `BLOCK` |

If an earlier path edge stops propagation, deeper nodes are marked `NONE`.
Related rows are still measured so the report explains the blocking or
correlated data rather than silently hiding it.

### 5. Calculate configured business impact

Business semantics are explicit settings, not inferred by an LLM. The default
rule maps `subscriptions.status = 'active'` and
`subscriptions.monthly_price` to:

- active subscriptions at risk;
- MRR at risk;
- ARR at risk (`MRR * 12`).

The aggregate query uses the same root predicate and FK path as dependency
counting and returns aggregates only—never customer rows.

### 6. Score deterministic risk

Pure Python scoring allocates exactly the maxima required by `backend.md`:

| Factor | Maximum |
|---|---:|
| operation | 25 |
| direct impact | 20 |
| dependent impact | 20 |
| cascade | 15 |
| business impact | 15 |
| recoverability | 5 |

The sum is clamped to 100 and mapped to LOW, MEDIUM, HIGH, or CRITICAL using
the frozen boundaries. A DELETE without WHERE receives at least 85 points,
independent of demo database size.

### 7. Generate only schema-supported alternatives

If the target has `deleted_at`, generate a SQLGlot UPDATE assigning `NOW()`.
Otherwise use `is_deleted = TRUE` when present. If neither column exists, no
alternative is offered. The alternative is scored by the same risk engine as
an UPDATE with no cascade propagation.

### 8. Orchestrate and publish the frozen report

`BlastShieldAnalyzer` performs parse -> persist ANALYZING -> schema/graph ->
counts -> business impact -> risk -> alternative -> fingerprint -> persist
PENDING_APPROVAL. The route only validates the request and invokes this
service; business logic does not live in FastAPI handlers.

Read-only `GET /api/v1/analyses` and
`GET /api/v1/analyses/{analysis_id}` return persisted reports. Mutation routes
for approval and execution are deliberately absent until their Day 3 safety
invariants exist.

## Failure behavior

- Invalid, unsupported, or multi-statement SQL fails before database analysis.
- Analysis query timeout returns `ANALYSIS_QUERY_TIMEOUT`.
- A missing target table returns `INVALID_SQL`.
- A created analysis that later fails is marked `FAILED`.
- Missing persisted reports return `NOT_FOUND`.
- Unknown failures remain HTTP 500 and are never converted into approval.

## Day 2 acceptance checks

1. Correlated counts match independently calculated fixture values at depths
   one and two.
2. EXPLAIN chooses both EXACT and ESTIMATED branches under configured limits.
3. All five FK actions map to correct effects.
4. Business aggregates match the fixture.
5. Risk buckets and the no-WHERE critical rule are deterministic.
6. Alternatives depend strictly on discovered columns.
7. `POST /api/v1/analyze` matches every frozen field and persists the same
   report returned by GET.
8. The analyzer database role still cannot execute writes.

