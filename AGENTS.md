# BlastShield — Repository Engineering Rules
#
# Qodo reads this file before reviewing any pull request so that
# project-specific standards are enforced automatically.
# Agents working in this repo MUST read this file before generating code.

## Purpose

BlastShield is a **safety gateway** for destructive PostgreSQL operations
proposed by AI agents. Every change here can affect whether a production
database survives an AI-generated DELETE. Treat every PR as high-stakes.

---

## Branching & Pull-Request Rules

- **Never push directly to `main`**. All work goes through a feature branch
  and a pull request, even solo contributors.
- Branch names: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`.
- One logical change per PR. Split unrelated fixes into separate branches.
- Qodo agentic review runs automatically on every open PR.
  Fix every valid **HIGH** severity finding before merging.
  Dismissals of HIGH findings must include a written reason in the Qodo thread.

---

## Security Rules (automatically enforced by Qodo)

1. **No credentials in source code.** No passwords, tokens, or connection
   strings — not even demo values — outside of `.env.example`.
2. **No secrets in logs.** Log IDs, states, durations, and error codes; never
   SQL row values or credentials.
3. **SQL must be parsed through SQLGlot** before execution. Raw string
   interpolation into SQL is forbidden.
4. **Authentication middleware must validate token expiry** before accepting
   any request in protected routes.
5. **Executor role (`blastshield_executor`) must never touch the control plane**
   tables (`analyses`, `findings`). Any cross-role query is a critical defect.
6. **Analyzer role (`blastshield_analyzer`) must be read-only.** Any INSERT,
   UPDATE, DELETE, or DDL from the analyzer is a critical defect.
7. **Execution requires a valid APPROVED analysis.** There must be no path that
   executes SQL without a preceding human-approved analysis record.
8. **Revalidation must run before every execution.** TOCTOU risk must be
   explicitly guarded.

---

## Code Quality Rules

- Every new feature must have unit tests. Every new API endpoint must have
  integration tests using the PostgreSQL fixture.
- Do not modify public API shapes (`/api/v1/*`) without updating the contract
  comment in `README.md`.
- Prefer existing utilities over creating duplicates (`app/core`, `app/db`).
- Functions over 40 lines should be split; cyclomatic complexity > 10 is a
  review blocker.
- All Python code must pass `ruff` and `mypy` (strict) without suppressions.
- TypeScript/Next.js code must pass `tsc --noEmit` and ESLint.
- Remove all `TODO`, `FIXME`, and `HACK` comments before merging to main.

---

## Blast-Radius–Specific Rules

- **Analysis** and **execution** must use separate database connections with
  separate roles; they must never share a connection or session.
- The `affected_rows` count in an execution result must come from the database
  engine (`rowcount` / `RETURNING`), not from pre-analysis estimates.
- Risk scoring logic (`app/services/risk.py`) must not be changed without
  updating the corresponding unit tests.
- The MCP layer must not receive or pass SQL directly to the executor; it can
  only pass `analysis_id`.

---

## Dependency Rules

- Add no new dependencies without a comment in the PR description explaining
  why an existing utility is insufficient.
- Pin minor versions in `pyproject.toml` and `package.json`; do not use
  wildcard (`*`) or unbounded (`>=`) ranges.

---

## Documentation Rules

- All public Python functions and classes must have docstrings.
- API changes go into `README.md` (API contract section) in the same PR.
- Architecture changes go into `docs/blastshield-trd-v2.md`.
