# BlastShield

BlastShield is a pre-execution safety gateway for destructive PostgreSQL
actions proposed by AI agents. This repository currently contains the Day 1
backend/system foundation described in [`backend.md`](backend.md).

## Day 1 capabilities

- PostgreSQL fixture: `users -> orders -> payments`, plus subscriptions and
  sessions, using live `ON DELETE CASCADE` foreign keys.
- Isolated `blastshield_analyzer` and `blastshield_executor` roles.
- Defense-in-depth read-only analysis transactions with statement and lock
  timeouts.
- SQLGlot AST parsing for one DELETE statement and deterministic action
  classification.
- AST-generated direct-impact `SELECT COUNT(*)` queries.
- Dynamic table, column, primary-key, and FK discovery from `pg_catalog`.
- Recursive FK traversal to depth three with cycle protection.
- FastAPI health endpoint at `GET /api/v1/health` and configured local CORS.

The frozen `POST /api/v1/analyze` API is scheduled for Day 2 and is not exposed
with partial data. In particular, Day 1 does not pretend that dependent-row or
risk values are zero when they have not yet been measured.

## Run

Prerequisites: Python 3.12+, Docker, and Docker Compose.

```bash
cp .env.example .env
make install
make db-up
make test
make test-integration
docker compose up --build -d backend
curl http://localhost:8000/api/v1/health
```

To stop the containers:

```bash
make down
```

Database initialization runs only when the Compose volume is first created.
The committed demo credentials are local-only and must be replaced for any
non-demo deployment.

## Day 1 handoff

FILES CHANGED: `backend/`, `database/`, `docker-compose.yml`, `.env.example`,
`Makefile`, and this root `README.md`.

WHAT WORKS: demo schema and roles, FastAPI health, DELETE parsing and
classification, direct count planning/execution, live schema discovery, and FK
graph traversal.

TESTS: unit tests run without PostgreSQL; integration tests verify live role
permissions, counts, and dynamic catalog traversal when the demo database is
running.

API CONTRACT CHANGES: NONE. The frozen analysis endpoints have not been
published prematurely.
