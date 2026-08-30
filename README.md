# BlastShield

> **An AI agent proposed `DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years'`.**
> BlastShield intercepted it, calculated **40 direct rows → 252 cascading dependents → 14 active subscriptions → $406 MRR at risk → Risk 60 / HIGH**, showed the human a dependency graph and a safe soft-delete alternative, waited for approval, revalidated against production, then executed — all in one auditable lifecycle.

BlastShield is a **safety gateway and visual intelligence dashboard** for destructive PostgreSQL operations proposed by AI agents. It turns a dangerous one-liner into a fully-audited, human-approved action with zero guesswork.

```
AI Agent proposes DELETE
        │
        ▼  (MCP intercept)
  BlastShield analyzes
  ├─ FK blast-radius DAG    → 40 direct + 252 cascade rows
  ├─ Business impact        → 14 subscriptions, $406 MRR at risk
  ├─ Risk score             → 60 / HIGH
  └─ Safer alternative      → previewed + copyable soft-delete SQL
        │
        ▼  (human reviews the visual dashboard)
  Human: Approve original DELETE  ─or─  Reject
        │  (safer SQL is previewed and copied to run separately)
        ▼  (revalidation against live production)
  Execution committed — 40 rows deleted, cascades measured
```

This repository contains the complete full-stack platform: **Next.js** interactive frontend (React Flow blast-radius DAG, risk gauge, side-by-side safer-alternative diff), **FastAPI** safety gateway, PostgreSQL schema fixture and control-plane migrations, controlled MCP bridge, **81-test suite** (53 unit + MCP, 28 QA integration), and demo preflight/rehearsal tooling.

## Architecture

```text
Next.js Frontend / MCP Agent
           │
           ▼
    FastAPI Gateway
     ┌─────┼────────┐
     ▼     ▼        ▼
  analyzer app   executor
(read-only) (control) (isolated DELETE)
     │     │        │
     └─────┴────────┴──► PostgreSQL Demo DB
```

The complete TrueForge-controlled path is:

```text
User asks to delete data
          │
          ▼
TrueForge agent ──MCP──► blastshield_analyze
                              │
                              ▼
                 BlastShield production-aware analysis
                    ├─ SQL parser
                    ├─ live foreign-key measurement
                    ├─ deterministic risk policy
                    └─ persisted approval fingerprint
                              │
                              ▼
                 TrueForge sandbox verification
                 (isolated arithmetic/policy check;
                    no database credentials)
                              │
                              ▼
                 Dashboard + agent risk explanation
                              │
                              ▼
             blastshield_request_execution is attempted
                              │
                              ▼
                 TrueForge human approval gate
                       [ DENY ] [ ALLOW ]
                              │
                    ALLOW records approval
                              │
                              ▼
                 BlastShield live revalidation
                              │
                              ▼
                 Constrained PostgreSQL executor
```

The responsibilities are intentionally separate. BlastShield provides
production-aware deterministic analysis. The TrueForge sandbox independently
checks the returned evidence in an isolated code environment. TrueForge owns
the human Deny/Allow checkpoint. BlastShield's executor accepts only a stored
analysis ID, revalidates it, and runs through a restricted database role.

- `blastshield_analyzer` can inspect schema and data but cannot write.
- `blastshield_app` can store lifecycle reports but cannot read domain tables.
- `blastshield_executor` can modify domain tables but cannot access the control
  plane.
- MCP knows only the HTTP API URL and has no database credentials.

The supported executable shape is one PostgreSQL `DELETE FROM table [WHERE
condition]`. SQLGlot parsing rejects multiple statements and unsupported SQL.
Schema metadata, foreign keys, correlated row counts, risk, and
safer alternatives are calculated from the live database.

## Prerequisites

- Python 3.12+
- Node.js 20+ and npm
- Docker
- Docker Compose

## Configuration

Copy the local demo defaults:

```bash
cp .env.example .env
```

| Variable | Purpose | Demo default |
|---|---|---|
| `POSTGRES_PORT` | PostgreSQL host port | `5432` |
| `BACKEND_PORT` | FastAPI host port | `8000` |
| `BLASTSHIELD_ANALYSIS_DATABASE_URL` | Read-only analyzer connection | local demo analyzer |
| `BLASTSHIELD_APP_DATABASE_URL` | Control-plane connection | local demo app role |
| `BLASTSHIELD_EXECUTION_DATABASE_URL` | Transactional executor connection | local demo executor |
| `BLASTSHIELD_CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000` |
| `BLASTSHIELD_STATEMENT_TIMEOUT_MS` | Analysis statement timeout | `5000` |
| `BLASTSHIELD_LOCK_TIMEOUT_MS` | Analysis lock timeout | `1000` |
| `BLASTSHIELD_EXACT_COUNT_MAX_COST` | EXPLAIN cost threshold for exact counts | `100000` |
| `BLASTSHIELD_EXECUTION_STATEMENT_TIMEOUT_MS` | Execution statement timeout | `10000` |
| `BLASTSHIELD_EXECUTION_LOCK_TIMEOUT_MS` | Execution lock timeout | `2000` |
| `BLASTSHIELD_API_URL` | MCP HTTP gateway | `http://localhost:8000` |

The committed passwords are for the disposable local fixture only. Replace all
three role credentials outside the demo environment.

## Quickstart & Installation

The PostgreSQL database, migrations, FastAPI backend, and MCP server are containerized with Docker Compose. The Next.js frontend runs with hot reload for local development.

### 1. Configure Environment

Copy the default local configuration:

```bash
cp .env.example .env
```

*(Optional)* If port `5432` is occupied on your host, customize `POSTGRES_PORT` in `.env`.

### 2. Install Dependencies

Install Python backend tools and frontend node modules:

```bash
make install
cd frontend && npm ci && cd ..
```

### 3. Start Core Services

Build and launch PostgreSQL, control-plane migrations, the FastAPI safety gateway, and the MCP server:

```bash
make up
```

Verify backend health:

```bash
curl http://localhost:8000/api/v1/health
# Response: {"status":"ok","service":"BlastShield"}
```

- **Safety Gateway API:** `http://localhost:8000` (Swagger docs at `/docs`)
- **MCP Streamable HTTP Endpoint:** `http://localhost:8001/mcp`
- **PostgreSQL Database:** `localhost:5432` (seeded with multi-tier roles & relations)

### 4. Launch the Dashboard

In a separate terminal, start the Next.js visual intelligence dashboard:

```bash
cd frontend
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Interactive Verification & Walkthrough

1. **Enter / Select a Query:** Select the *Inactive Users* preset or enter:
   ```sql
   DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';
   ```
2. **Run Impact Analysis:** Click **Run Impact Analysis**. BlastShield intercepts the query read-only, traverses the live foreign-key graph, measures 40 direct rows and 252 cascading dependents, and generates a risk score of `60 / HIGH`.
3. **Inspect Blast Radius:** The interactive React Flow DAG renders the full cascade propagation tree (`users` → `orders` → `payments`, `subscriptions`, `sessions`).
4. **Evaluate Safer Alternatives:** View the synthesized soft-delete `UPDATE` statement side-by-side with the original query.
5. **Approval & Controlled Execution:**
   - Click **Approve** to transition lifecycle status to `APPROVED` (no database modification occurs).
   - Click **Execute** to trigger live revalidation against production and commit within an isolated transactional session.

### 6. Teardown

Stop all services without losing persisted database volume:

```bash
make down
```

To reset the demo database to a pristine starting state:

```bash
make demo-reset
```

## Tests

```bash
make test
make db-up
make test-integration
```

`make test` runs unit and MCP tests. Integration tests require the demo
PostgreSQL fixture and verify live metadata, metrics, lifecycle safety,
rollback, stale detection, concurrency, and database permissions.

## API contract

```text
GET  /api/v1/health
POST /api/v1/analyze
GET  /api/v1/analyses
GET  /api/v1/analyses/{analysis_id}
POST /api/v1/analyses/{analysis_id}/approve
POST /api/v1/analyses/{analysis_id}/reject
POST /api/v1/analyses/{analysis_id}/execute
```

Execution accepts only the path `analysis_id`; there is no request-body SQL and
no generic execution endpoint.

Example lifecycle:

```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H 'Content-Type: application/json' \
  -d '{"sql":"DELETE FROM users WHERE last_login < NOW() - INTERVAL '\''2 years'\''","source":"demo"}'

curl -X POST http://localhost:8000/api/v1/analyses/ANALYSIS_ID/approve \
  -H 'Content-Type: application/json' \
  -d '{"actor":"reviewer@example.com","reason":"Blast radius reviewed"}'

curl -X POST http://localhost:8000/api/v1/analyses/ANALYSIS_ID/execute
```

Success:

```json
{
  "analysis_id": "uuid",
  "executed": true,
  "status": "EXECUTED",
  "affected_rows": 40,
  "executed_at": "2026-08-27T12:01:00Z"
}
```

Errors consistently use safe JSON:

```json
{
  "code": "APPROVAL_REQUIRED",
  "message": "Human approval is required before execution."
}
```

The configured frontend CORS origin is `http://localhost:3000`. State changes
are visible through the GET endpoints.

## MCP and TrueForge

Compose exposes the MCP server over Streamable HTTP for TrueForge at:

```text
http://localhost:8001/mcp
```

Start TrueForge locally (Node.js 22.14+), then open `http://localhost:8790`:

```bash
HOST=127.0.0.1 npx @truefoundry/trueforge@latest
```

Then configure the demo:

1. Open **Settings → Connectors → Add MCP Server**. Name it `BlastShield`, use
   `http://localhost:8001/mcp`, and select no authentication for this loopback
   demo.
2. Open **Settings → Sandbox providers** and configure a Daytona provider.
   Enable the sandbox on the BlastShield agent. TrueForge provisions this
   isolated environment only when the verifier runs; database and MCP
   credentials stay in the harness.
3. Open **Settings → Skills** and register this Git repository with the path
   `trueforge/skills/blastshield-demo`. Attach the `blastshield-demo` skill to
   the agent.
4. Create the agent from `trueforge/agent-manifest.example.json`, replacing the
   model placeholder with a model configured in your TrueForge instance. The
   important setting is:

   ```json
   "require_approval_for_tools": ["blastshield_request_execution"]
   ```

   TrueForge currently exposes the exact per-tool approval policy through its
   API agent specification. The example manifest makes analysis autonomous and
   pauses exactly at destructive execution.

The MCP tools publish explicit safety annotations. Report retrieval is
read-only, analysis is a non-destructive control-plane write, and execution is
marked `destructiveHint: true`. That final annotation also prevents the
execution tool from being hidden inside TrueForge Code Mode; it must be called
directly so the human checkpoint can appear.

The loopback-only port mapping keeps the unauthenticated demo MCP endpoint off
the LAN. For stdio MCP clients, run the original transport directly:

```bash
BLASTSHIELD_API_URL=http://localhost:8000 .venv/bin/blastshield-mcp
```

It exposes exactly:

- `blastshield_analyze`
- `blastshield_get_report`
- `blastshield_request_execution`

MCP exposes no standalone approval tool and cannot provide SQL to execution.
After the human reviews and approves the analysis, the dispatched
`blastshield_request_execution(analysis_id)` call revalidates the persisted
fingerprint and executes only the stored SQL in an isolated transaction. The
loopback-only demo trusts TrueForge as the MCP host. A production deployment
must additionally restrict and authenticate the MCP endpoint so untrusted
clients cannot invoke it directly.

## Demo runbook

Start the explicitly named demo project and run the non-destructive preflight:

```bash
make demo-up
make demo-check
```

The preflight validates Docker, Compose, database identities, starting fixture
counts, backend health, report shape, frozen metrics, and the human-approval
stop. It creates one pending analysis but never approves or executes it.

To rehearse the requested agent story without changing the demo database, run:

```bash
make demo-agent
```

This runs the same verifier bundled with the TrueForge skill and prints:

```text
TrueForge sandbox verification: PASSED

Agent:
"I found 292 total affected records.
Risk = HIGH.

40 target rows match the DELETE condition.
252 dependent rows are connected by foreign keys.

I recommend rejecting this operation."

Next direct tool call: blastshield_request_execution(analysis_id)
Expected TrueForge checkpoint: Tool requires approval [DENY] [ALLOW]
```

The local command prints the checkpoint but never approves or executes the
DELETE. Run the same request in TrueForge to demonstrate the real interactive
Deny/Allow tool gate. The dashboard polls the backend for the newest persisted
report, so the MCP-created analysis appears at `http://localhost:3000` without
re-entering the SQL.

During the demo:

1. Tell the TrueForge agent: `Delete inactive users older than two years.`
2. The agent calls `blastshield_analyze`, retrieves the persisted report, and
   runs the bundled verifier in the TrueForge sandbox.
3. Show 40 direct rows, 252 dependent rows, risk 68/HIGH, the dependency graph,
   and the agent's recommendation to reject.
4. The agent directly requests `blastshield_request_execution`. TrueForge must
   stop before invocation and display **Deny** and **Allow**.
5. Choose **Deny** to prove that production remains unchanged, or choose
   **Allow** to record the human approval and continue.
6. On **Allow**, show BlastShield revalidation, `EXECUTED`, 40 directly affected
   rows, and the measured database cascades.

Stop the demo without deleting its volume:

```bash
make demo-down
```

Reset only the named disposable demo project:

```bash
make demo-reset
```

`demo-reset` prints the exact Compose project before removing its containers
and volume. Do not use it for a real database.

## Known limitations

- FK analysis does not discover triggers, PostgreSQL rules, or application-level
  cascades.
- Analysis counts and execution are not one point-in-time transaction.
- Revalidation reduces but cannot eliminate an external TOCTOU race.
- A committed DELETE followed by control-plane persistence failure requires
  manual reconciliation.
- Only actions routed through BlastShield/MCP are protected.
- Only the MVP single-table DELETE shape is executable.
- An abandoned execution claim is not retried automatically, preventing an
  accidental duplicate DELETE.

## Troubleshooting

- Port conflict: set `POSTGRES_PORT` or `BACKEND_PORT` in `.env`.
- Migration failure: inspect `docker compose logs migrate`; rerun
  `docker compose run --rm migrate`. Do not delete a real volume.
- Analysis timeout: inspect query cost/indexes before increasing
  `BLASTSHIELD_STATEMENT_TIMEOUT_MS`.
- Execution timeout: the transaction rolls back; submit a new analysis after
  fixing the database issue.
- `ANALYSIS_STALE`: production data or schema changed after approval. Create and
  review a new analysis.
- Claimed `APPROVED` record after a crash: do not retry blindly; reconcile the
  domain state manually.
- Logs: `make logs`. Lifecycle logs contain IDs, states, duration, measurement
  mode, and error codes, but not SQL rows or credentials.

---

## Qodo Code Review Evidence

Every substantive merge runs through a Qodo-reviewed pull request before
landing on `main`. Direct pushes to `main` are not counted as reviewed work.

### How we use Qodo

1. **Automatic reviews** — Qodo is installed on this repository via
   *Integrations → SaaS → GitHub*. A review fires automatically when a PR is
   opened, reopened, or marked ready for review.
2. **Manual trigger** — any team member can comment `/agentic_review` on any
   PR to request an on-demand review.
3. **Severity policy** — we fix every valid **HIGH** severity finding before
   merging. If a HIGH finding is wrong or intentionally deferred, we dismiss it
   in the Qodo thread and record the reason. MEDIUM / LOW are our engineering
   call; we note our decision in the PR body.
4. **Follow-up review** — after addressing findings we push to the branch and
   let Qodo review again so the PR history shows the resolved state.

### Configuration files

| File | Purpose |
|------|---------|
| [`.pr_agent.toml`](.pr_agent.toml) | Enables agentic review, routes HIGH inline, sets ignore paths |
| [`REVIEW.md`](REVIEW.md) | Project-specific focus areas Qodo reads before every review |
| [`AGENTS.md`](AGENTS.md) | Engineering rules read by Qodo and by coding agents |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | CI that must pass (unit tests, lint, type-check) before merge |

### Representative reviewed PRs

| PR | What Qodo surfaced | Our decision |
|----|-------------------|--------------|
| [#2 — fix: improve BlastShield backend safety checks](https://github.com/jmass-ggg/BlastSheild/pull/2) | 3 HIGH + 2 MEDIUM findings: (1) polling swapped execution target during review, (2) verifier trusted claimed risk breakdown without derivation, (3) forged host approval in MCP execution tool, (4) out-of-order polling reverted status, (5) raw SQL literals exposed in unauthenticated response | Fixed all 5 findings: guarded polling during active review/modal, derived risk components independently in verifier, removed auto-approval from MCP, locked status transitions, and removed raw SQL from response schema |
| [#3 — docs: README hook + why-blastshield section](https://github.com/jmass-ggg/BlastSheild/pull/3) | 3 MEDIUM bugs: (1) flow diagram implied safer-SQL was executable via BlastShield when it is preview+copy only; (2) test count stated as 53 instead of 81; (3) PR evidence row linked to /pulls instead of a specific PR | All three fixed in follow-up commit on this branch before merge |
| [#4 — feat(ui): add cancelled subscriptions preset query](https://github.com/jmass-ggg/BlastSheild/pull/4) | 0 bugs / clean review — verified safe query preset expansion and frontend type consistency | Approved and merged cleanly |
| [#5 — feat(api): add structured error remediation guidance](https://github.com/jmass-ggg/BlastSheild/pull/5) | 2 HIGH bugs: (1) remediation guidance captured by client but never displayed in UI, (2) ExecutionFailedError advised blind retries risking duplicate deletions | Fixed both HIGH findings: added remediation UI alerts in dashboard/modal and corrected retry safety text |

> **How we work with Qodo findings:**
> Every PR opens automatically triggering a Qodo agentic review.
> - **HIGH** findings → fixed before merge, or dismissed in the Qodo thread with a written reason.
> - **MEDIUM / LOW** → our engineering call; decision noted in the PR description.
> - After addressing findings we push a follow-up commit and Qodo re-reviews automatically.

### How to reproduce a review

```bash
# 1. Branch and change something substantive
git checkout -b feat/your-feature
# ... make changes ...
git commit -m "feat: your feature"
git push origin feat/your-feature

# 2. Open a PR on GitHub — Qodo reviews automatically within ~60 seconds.
#    Or trigger on demand by commenting on any open PR:
/agentic_review

# 3. Fix HIGH findings, dismiss with reason if intentional, then push again.
# 4. Qodo re-reviews the updated diff automatically.
# 5. Human merges only after CI passes and no open HIGH findings remain.
```

