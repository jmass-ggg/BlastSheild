# BlastShield — Qodo Code Review Customization
#
# Docs: https://docs.qodo.ai/code-review/review-customization
#
# Place this file in the repository root. Qodo reads it before every review
# and uses it to produce findings that are specific to this codebase.

## About this project

BlastShield is a safety gateway for destructive PostgreSQL operations proposed
by AI agents. It analyzes blast radius, calculates risk, waits for human
approval, revalidates, and executes in a single transaction. The codebase
separates concerns across three PostgreSQL roles (analyzer, app, executor)
and enforces human-in-the-loop approval before any DELETE runs on production.

## Focus areas for review

When reviewing any pull request, pay special attention to:

1. **Role isolation** — analyzer must not write; executor must not read control
   plane tables; app must not touch domain tables.
2. **Approval gate** — no execution path must skip the APPROVED state check or
   the revalidation step.
3. **SQL injection** — all SQL must go through SQLGlot parsing. Flag any raw
   string interpolation as HIGH severity.
4. **Secret hygiene** — flag any hardcoded password, token, or connection
   string (even demo values) as HIGH severity.
5. **Test coverage** — flag any new public function, class, or API endpoint
   that lacks a corresponding test as MEDIUM severity.
6. **Error handling** — all database errors must return a safe JSON envelope
   (`{"code": "...", "message": "..."}`); no stack traces in API responses.
7. **Concurrency safety** — revalidation must run inside the same transaction
   window as execution; flag TOCTOU gaps as HIGH severity.
8. **MCP boundary** — the MCP layer must pass only `analysis_id` to the
   executor, never SQL text.

## Severity guidance

| Severity | Examples for this repo |
|----------|------------------------|
| CRITICAL | Role boundaries violated, approval gate bypassed |
| HIGH     | SQL injection path, secret in code, TOCTOU gap, auth token not validated |
| MEDIUM   | Missing tests for new feature, unbounded dependency range |
| LOW      | Missing docstring, TODO comment left in |

## Do not flag

- Changes inside `docs/`, `*.md`, `database/fixtures/` — documentation noise.
- Demo passwords in `.env.example` — they are intentionally public placeholders.
- Lines prefixed with `# noqa:` that already have a suppression reason comment.
