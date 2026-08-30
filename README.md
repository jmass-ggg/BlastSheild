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

## Hackathon presentation script

The following script is designed for a three-to-four-minute project
explanation followed by the live demo.

> Hello everyone. Our project is called **BlastShield**.
>
> AI agents can now generate and execute database queries. That is powerful,
> but it is also dangerous. An AI agent can generate a perfectly valid SQL
> statement that causes serious production damage.
>
> For example, consider this request: *Delete users who have been inactive for
> more than two years.* The generated SQL looks simple:
>
> ```sql
> DELETE FROM users
> WHERE last_login < NOW() - INTERVAL '2 years';
> ```
>
> However, those users may be connected to orders, sessions, subscriptions,
> payments, or other records through foreign keys. A single DELETE can silently
> trigger a much larger cascade.
>
> BlastShield solves this problem by acting as a safety gateway between an AI
> agent and PostgreSQL. The AI can propose a destructive operation, but it does
> not receive unrestricted database access.
>
> The flow starts in **TrueForge**. The user describes the requested operation
> in natural language, and the TrueForge agent calls the BlastShield MCP tool
> `blastshield_analyze` with the proposed SQL.
>
> BlastShield parses the statement, rejects unsupported or multiple statements,
> and then uses a read-only database role to inspect the live PostgreSQL schema
> and data. It measures the directly matching rows, follows foreign-key
> relationships, detects `ON DELETE CASCADE` paths, and counts the dependent
> rows that could be affected.
>
> BlastShield then applies a deterministic risk policy based on the operation,
> direct impact, dependent impact, cascade severity, and recoverability. The
> same SQL and database state produce the same result; the risk score is not an
> AI guess.
>
> In our demo, BlastShield finds 40 directly matching users and 252 dependent
> rows, giving 292 potentially affected rows in total. The result is a risk
> score of 68 out of 100, classified as **HIGH**.
>
> Nothing has been deleted. The analysis is stored as `PENDING_APPROVAL`, and
> the BlastShield dashboard automatically displays the report created through
> TrueForge. The dashboard shows the SQL, affected-row counts, risk factors,
> lifecycle state, and an interactive dependency graph:
>
> ```text
> users
> ├── orders
> │   └── payments
> ├── sessions
> └── subscriptions
> ```
>
> BlastShield also proposes a lower-risk soft-delete alternative when the
> target table supports it. This is presented as a recommendation, not a
> guarantee, because database triggers and application-level behavior may
> require additional review.
>
> Next, the agent attempts to call `blastshield_request_execution`. TrueForge
> stops before invoking this destructive tool and shows the human **Deny** or
> **Allow** approval checkpoint.
>
> If the human denies the tool call, production remains unchanged. If the
> human allows it, BlastShield records the approval, revalidates the stored
> analysis against the current database state, and permits only the exact SQL
> that was analyzed. If the data or schema changed, BlastShield stops the
> operation as stale. Otherwise, the constrained executor runs it in an
> isolated transaction through a restricted database role.
>
> The security model separates responsibilities. The analyzer can read domain
> data but cannot write. The application role manages reports and lifecycle
> state but cannot read domain tables. The executor can perform the approved
> operation but cannot access the control plane. TrueForge and MCP have no
> database credentials.
>
> In short: **TrueForge orchestrates the AI agent and human tool approval,
> BlastShield provides production-aware deterministic analysis and
> revalidation, the dashboard explains the blast radius, and the constrained
> executor runs only the approved operation.**
>
> BlastShield lets AI agents work with production databases without giving
> them unrestricted destructive power. The AI proposes, BlastShield measures,
> the human decides, and the executor remains constrained.

For the safest live presentation, choose **Deny** at the TrueForge checkpoint.
This demonstrates the complete analysis and approval flow while leaving all
demo rows unchanged. Use **Allow** only when intentionally demonstrating the
executor, because it commits the stored DELETE after successful revalidation.

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

## Run the complete application

The PostgreSQL database, migrations, FastAPI backend, and MCP server run with
Docker Compose. The Next.js frontend runs separately with npm so that it has
hot reload during development.

### 1. Create the local configuration

**What you should do:** Open a terminal in the root of this repository. If the
`.env` file does not exist yet, create it from the example configuration:

```bash
cp .env.example .env
```

**What result you should get:** A new `.env` file appears in the repository
root. It tells the application which ports and database connections to use.
The supplied usernames and passwords are only for the disposable local demo;
do not use them in a real environment.

If port `5432` is already occupied, edit `.env` and choose another host port,
for example:

```text
POSTGRES_PORT=55432
```

The containers still communicate with PostgreSQL on port `5432`; this setting
only changes the port exposed on your computer.

### 2. Install the backend and frontend dependencies

**What you should do:** Run these commands from the repository root:

```bash
make install
cd frontend
npm ci
cd ..
```

**What result you should get:** The `make install` command creates a Python
virtual environment named `.venv` and installs the backend and MCP packages.
The `npm ci` command creates `frontend/node_modules` and installs the exact
frontend packages recorded in `frontend/package-lock.json`. Both commands
should finish without an installation error.

### 3. Start the database, backend, and MCP server

**What you should do:** From the repository root, run:

```bash
make up
```

**What result you should get:** Docker builds the project images, starts
PostgreSQL, applies the database migrations, starts the FastAPI backend, and
starts the MCP server. This first startup can take a few minutes while Docker
downloads and builds everything.

When startup is complete, PostgreSQL contains the seeded demo data. The
backend is available at `http://localhost:8000`, the interactive API
documentation is available at `http://localhost:8000/docs`, and the MCP server
is available at `http://localhost:8001/mcp`. PostgreSQL is available on the
`POSTGRES_PORT` configured in `.env`, which is normally `5432`.

**What you should do next:** Check the backend health from the terminal:

```bash
curl http://localhost:8000/api/v1/health
```

**What result you should get:** The command returns:

```json
{"status":"ok","service":"BlastShield"}
```

You can also check the Docker containers with:

```bash
docker compose ps
```

The `postgres`, `backend`, and `mcp` containers should say `healthy`. The
`migrate` container runs only once and should say that it exited with status
`0`. That is a successful result, not an error.

### 4. Start the frontend

**What you should do:** Leave the first terminal and the Docker services
running. Open a second terminal and run:

```bash
cd frontend
npm run dev
```

**What result you should get:** Next.js compiles the frontend and prints a
message containing `Ready` and `Local: http://localhost:3000`. Keep this
terminal running. Open the following address in your browser:

```text
http://localhost:3000
```

The browser should show the BlastShield dashboard. You should see the SQL
editor, preset actions, risk area, database schema explorer, and an empty
analysis area waiting for a query.

### 5. Run a safe end-to-end demo

**What you should do:** In the dashboard, select the inactive-users preset or
enter this SQL statement:

```sql
DELETE FROM users
WHERE last_login < NOW() - INTERVAL '2 years';
```

Click **Analyze**.

**What result you should get:** BlastShield inspects the query but does not
execute the `DELETE`. With an untouched demo database, the report says that 40
`users` rows match directly and 252 dependent rows could also be deleted, for
292 affected rows in total. The generic database risk result is `68 / HIGH`.
It is derived from operation type, direct rows, dependent rows, foreign-key
cascade severity, and recoverability; it does not assume application-specific
revenue or subscription semantics.

The dependency graph shows that `users` affects `orders`, `sessions`, and
`subscriptions`. It also shows that `orders` affects `payments`. This explains
where the 252 dependent rows come from.

BlastShield should also show this lower-risk soft-delete alternative:

```sql
UPDATE users
SET deleted_at = NOW()
WHERE last_login < CURRENT_TIMESTAMP - INTERVAL '2 YEARS';
```

The analysis status remains `PENDING_APPROVAL`. At this point, no user or
dependent record has been deleted.

### 6. Approve or reject the analyzed action

**What you should do:** Review the risk report and dependency graph. Choose
**Reject** if the action should not be allowed. Choose **Approve** only if you
want to permit this action to continue.

**What result you should get after Reject:** The analysis changes to a
rejected state and cannot be executed.

**What result you should get after Approve:** The analysis changes to an
approved state, but the database is still unchanged. BlastShield deliberately
keeps approval and execution as two separate actions.

If you then choose the final **Execute** action, BlastShield checks that the
database has not changed since the analysis and runs the approved statement in
an isolated transaction. With untouched demo data, the result reports 40
directly deleted users and the database applies the related cascades. This
changes the local demo data, so execute only when that is intentional.

This is the dashboard approval path. In the TrueForge path, the destructive
`blastshield_request_execution` tool is paused by TrueForge. Choosing **Allow**
there records the human approval in BlastShield and starts the same
revalidation and constrained execution path. Choosing **Deny** means the MCP
tool never runs and production remains unchanged.

### 7. Stop the application

**What you should do:** In the frontend terminal, press `Ctrl+C`. Then return
to the repository root in another terminal and run:

```bash
make down
```

**What result you should get:** The frontend development server stops and the
Docker containers stop. The PostgreSQL volume is not deleted, so starting the
application again with `make up` keeps the current demo data.

To delete and recreate only the explicitly named disposable demo project, use
the `make demo-reset` workflow described below.

### Starting with an existing database volume

The `migrate` service applies all idempotent control-plane migrations before
the backend starts. If you need to run the migrations manually:

```bash
docker compose run --rm migrate
docker compose up --build -d backend mcp
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
After TrueForge displays the destructive tool call and the human chooses
**Allow**, the dispatched `blastshield_request_execution(analysis_id)` call
records `trueforge-tool-approval`, revalidates the persisted fingerprint, and
executes only the stored SQL. The loopback-only demo trusts TrueForge as the
MCP host. A production deployment must additionally restrict and authenticate
the MCP endpoint so untrusted clients cannot invoke it directly.

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

API route compatibility is unchanged. Analysis responses include the submitted
`sql` string for TrueForge/MCP dashboard synchronization. The former
subscription-specific `business_impact` object and risk-breakdown field were
removed so analysis works across arbitrary PostgreSQL schemas.

---

## Qodo Code Review Evidence

> **Required by the [TrueForge hackathon](https://www.wemakedevs.org/hackathons/trueforge).**
> Every substantive merge runs through a Qodo-reviewed pull request before
> landing on `main`. Direct pushes to `main` are not counted as reviewed work.

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
git push binato feat/your-feature

# 2. Open a PR on GitHub — Qodo reviews automatically within ~60 seconds.
#    Or trigger on demand by commenting on any open PR:
/agentic_review

# 3. Fix HIGH findings, dismiss with reason if intentional, then push again.
# 4. Qodo re-reviews the updated diff automatically.
# 5. Human merges only after CI passes and no open HIGH findings remain.
```

