# BlastShield — TRD v2 (Revised Scope)

**Product:** BlastShield — consequence-aware execution for AI agents with database access
**Version:** 2.0 · supersedes v1.0
**Window:** 4 days

> Every AI guardrail answers *"is the agent allowed to run this?"* None answer *"what will it actually destroy, and can I get it back?"* BlastShield answers both — read-only, against live production, in under a second.

---

## 1. Changes from v1

| Change | Reason |
|---|---|
| **Cut** the sandbox, second Postgres, `pg_dump`/`pg_restore`, 400k-row seed | ~1.5 days of work; the fragile part of the demo; produces stale numbers |
| **Cut** production revalidation as a feature | Only existed to patch snapshot drift; recounting is now free, so it's just a step |
| **Swap** simulation → FK-graph counting against live prod | Read-only, no locks, sub-second, exactly correct for cascades |
| **Add** undo capture / restore | Makes destructive ops reversible — the strongest demo beat |
| **Swap** risk score as display → risk score as policy decision | Avoids approval fatigue; turns a speed bump into a product |
| **Add** `npx` packaging against any `DATABASE_URL` | Judges can run it on their own DB |

Positioning: **consequence + reversibility.** Permission gating is the crowded part of the market.

---

## 2. Architecture

```
USER → TRUEFORGE AGENT → MCP SERVER (chokepoint)
                              │
                    ┌─────────┴─────────┐
                 SAFE                DESTRUCTIVE
                    │                    │
              run_read_query      request_database_change
                                         │
                                  BLASTSHIELD API
                                         │
              ┌──────────────┬───────────┼──────────────┐
              ▼              ▼           ▼              ▼
        SQL PARSER     FK GRAPH    BUSINESS IMPACT  RISK ENGINE
        (sqlglot)      COUNTER     (from config)    (deterministic)
                                         │
                                   POLICY ENGINE
                              ┌──────────┴──────────┐
                        risk < 24              risk ≥ 25
                              │                     │
                        AUTO-EXECUTE         HUMAN APPROVAL
                              └──────────┬──────────┘
                                         ▼
                                  UNDO CAPTURE
                                         ▼
                                    RECOUNT
                              (differs → INVALIDATED)
                                         ▼
                                  EXECUTE ON PROD
                                         ▼
                                    UNDO AVAILABLE
```

**Stack:** Python · FastAPI · sqlglot · SQLAlchemy · PostgreSQL (one instance) · Next.js · TypeScript · Tailwind · shadcn/ui · React Flow

---

## 3. Impact Analysis (replaces the sandbox)

Walk `pg_constraint` to build the FK graph, then count with correlated `EXISTS` queries. Read-only, no locks, live data.

```sql
-- direct
SELECT count(*) FROM users WHERE last_login < NOW() - INTERVAL '2 years';

-- cascade level 1
SELECT count(*) FROM orders o WHERE EXISTS (
  SELECT 1 FROM users u
  WHERE u.id = o.user_id AND u.last_login < NOW() - INTERVAL '2 years');

-- recurse to depth 3
```

**Requirements**
- Traversal depth capped at 3.
- `ON DELETE RESTRICT` on any edge → flag **"this operation will fail partway through"** before it runs.
- Unparseable SQL fails closed (treated as destructive).

**Stated limit:** FK counting does not see triggers, rules, or application-level cascades. Documented fallback for those cases: `BEGIN; …; ROLLBACK;` with a `lock_timeout`. Not built in the MVP.

---

## 4. Undo

Before any approved destructive operation:

```sql
CREATE SCHEMA bs_undo_a1b2;
CREATE TABLE bs_undo_a1b2.users  AS SELECT * FROM users WHERE <predicate>;
CREATE TABLE bs_undo_a1b2.orders AS SELECT o.* FROM orders o WHERE EXISTS (...);
-- one capture table per cascade table, then execute
```

`POST /api/analysis/{id}/undo` re-inserts in reverse FK order.

- Capture is skipped only when the operation is non-destructive.
- Refuse execution if capture fails.
- Undo schemas are retained for the session; TTL cleanup is out of scope.

This makes hard delete reversible, so soft delete drops from headline recommendation to one option among several. (Soft delete is contested — GDPR erasure, storage, and every downstream query needing `WHERE deleted_at IS NULL`.)

---

## 5. Policy Engine

`blastshield.yaml`:

```yaml
tables:
  users:    { critical: true, revenue_link: subscriptions.monthly_price }
  sessions: { critical: false }

auto_approve:
  max_risk: 24
  max_rows: 100

require_approval_above: 25
block_always: [TRUNCATE, DROP]
```

Below threshold: execute, log, capture undo, no human involved. Above: hard stop with risk report. This is the answer to approval fatigue — the tool only interrupts when interruption is warranted.

Table criticality and revenue mapping are an explicit config surface, not inferred.

---

## 6. Risk Engine

Deterministic. No model involvement.

| Factor | Max |
|---|---|
| Operation severity | 25 |
| Rows affected | 25 |
| Cascade impact | 20 |
| Business-critical data (from config) | 20 |
| Reversibility (undo captured → near 0) | 10 |

| Range | Level |
|---|---|
| 0–24 | LOW (auto-approve) |
| 25–49 | MEDIUM |
| 50–74 | HIGH |
| 75–100 | CRITICAL |

---

## 7. MCP Tools

| Tool | Behavior |
|---|---|
| `get_schema()` | Tables, columns, PKs, FKs, cascade rules |
| `run_read_query(sql)` | `SELECT`/`EXPLAIN` only — **parser-enforced**, not string-matched |
| `request_database_change(sql)` | Never executes; returns `{analysis_id, status}` |
| `execute_approved_change(id)` | Only when status is `APPROVED` or auto-approved by policy |
| `undo_change(id)` | Restores from capture schema |

**No `run_any_sql` may exist in the agent's tool surface.**

*Threat model note:* BlastShield protects the MCP path only. It does nothing if the agent holds a second connection string, a shell, or migration-file write access. The chokepoint is only as good as its exclusivity.

---

## 8. Data Model

**`analyses`** — `id`, `session_id`, `original_sql`, `operation_type`, `target_table`, `risk_score`, `risk_level`, `direct_rows`, `indirect_rows`, `status`, `undo_schema`, `alternatives`, `created_at`, `approved_at`, `executed_at`, `undone_at`

```
ANALYZING → WAITING_APPROVAL → APPROVED → EXECUTED → UNDONE
     │              │                          │
     └─ AUTO_APPROVED ──────────────────────────┘
                    ├─ REJECTED
                    └─ INVALIDATED (recount differed)
```

**`impact_items`** — `analysis_id`, `table_name`, `relationship`, `affected_rows`, `impact_type`
**`audit_events`** — `analysis_id`, `event_type`, `payload`, `created_at`

---

## 9. API

```
POST /api/analysis              → { analysis_id }
GET  /api/analysis/{id}         → risk, level, direct_rows, indirect_rows,
                                   arr_at_risk, alternatives, undo_available
POST /api/analysis/{id}/approve
POST /api/analysis/{id}/execute → recount → capture undo → execute
POST /api/analysis/{id}/undo
GET  /api/analysis/{id}/events
```

---

## 10. Alternatives

Three templates, not one:

| Original | Alternative |
|---|---|
| `DELETE FROM users WHERE …` | Soft delete (`SET deleted_at = NOW()`) |
| Unbounded `DELETE` | Add `LIMIT` / batch |
| Broad predicate | Narrowed predicate (e.g. exclude active subscribers) |

Each alternative is scored through the same pipeline. No alternative is offered for `TRUNCATE`/`DROP` — those are `block_always`.

---

## 11. Frontend

Three-pane operations console at 1440×1024 — sidebar 220px, agent chat ~600px, impact panel remaining. Register: Linear / Datadog / Sentry, not chatbot.

**Screens:** Agent Workspace → Risk Report → Comparison → Execution + Undo

**Custom components only:** `BlastRadiusGraph` (React Flow), `RiskGauge`, `ImpactTimeline`, `UndoBar`. Everything else from shadcn/ui.

**Signature interactions (both must be flawless):**
1. Selecting an alternative: `85 CRITICAL → 34 MEDIUM`, cascades `3 → 0`
2. Undo: counts restore across every affected table, live

All displayed numbers come from the API.

---

## 12. Demo Fixture

A fixture, not the product. `users → {subscriptions, orders → payments, invoices, sessions}` with `ON DELETE CASCADE` on at least three edges.

~5,000 users. The impressive number is the **cascade multiplier**, not the absolute count. Deterministic seed.

Ships as `npx blastshield --db $DATABASE_URL` — introspects any schema, no seeding required.

---

## 13. Four-Day Plan

**Day 1 — Chokepoint.** Repo, single Postgres, fixture, MCP server (4 tools), sqlglot parser, classifier.
*Done when:* "delete inactive users" returns `🛡 intercepted`.

**Day 2 — Intelligence.** FK graph from `pg_constraint`, recursive counting, RESTRICT detection, business impact from YAML, risk engine, policy engine with auto-approve.
*Done when:* true blast radius in <1s, and a low-risk op auto-executes untouched.

**Day 3 — Undo + UI.** Capture, execute, restore, verified end to end. Then risk gauge, metric cards, React Flow graph, approval bar, undo button, wired to real API.
*Done when:* delete → impact → approve → execute → undo → counts verified restored.

**Day 4 — Polish + pitch.** Three alternative templates, audit trail, loading/empty/error states, `npx` packaging, 10 clean rehearsals, fallback recording.
*Done when:* full story in under 5 minutes with zero live debugging.

---

## 14. Priorities

**P0** — MCP chokepoint · parser · FK cascade counting · risk score · undo capture + restore · policy auto-approve · risk report UI · approval flow
**P1** — Business impact / ARR · React Flow graph · alternatives · audit trail · recount-before-execute · `npx` packaging
**P2** — Animations · multi-agent · dashboard · accounts · trigger-aware analysis

If a P0 item breaks, all feature work stops.

---

## 15. Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | Destructive SQL never reaches prod without approval or policy auto-approval |
| AC-2 | `run_read_query` rejects all non-read operations via parser |
| AC-3 | Cascade counts match actual post-execution deltas exactly |
| AC-4 | `ON DELETE RESTRICT` is detected and surfaced before execution |
| AC-5 | Analysis completes in under 1 second on the fixture |
| AC-6 | Undo restores every affected table to pre-execution counts |
| AC-7 | Execution is refused if undo capture fails |
| AC-8 | Risk score is reproducible for identical inputs |
| AC-9 | Low-risk ops execute without human involvement and are logged |
| AC-10 | Recount at execute time differing from approval → `INVALIDATED` |
| AC-11 | All UI numbers originate from the API |
| AC-12 | Runs against an arbitrary Postgres via `DATABASE_URL` |

---

## 16. Known Limits (state these before you're asked)

- FK counting misses triggers, rules, and app-level cascades. Fallback is rollback-transaction; not built.
- Undo capture is `CREATE TABLE AS` — impractical for very large result sets. Real answer is PITR or logical replication.
- Counting is read-only but not point-in-time consistent; the recount before execute is the mitigation.
- The MCP path is the only protected path.

The analysis substrate is pluggable: FK counting for speed, rollback-transaction for exactness, replica for scale. What BlastShield owns is the layer above — dependency tracing, business impact translation, deterministic policy, and reversibility.
