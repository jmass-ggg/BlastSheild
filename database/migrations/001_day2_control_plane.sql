CREATE SCHEMA IF NOT EXISTS blastshield_control;

CREATE TABLE IF NOT EXISTS blastshield_control.analyses (
    id UUID PRIMARY KEY,
    original_sql TEXT NOT NULL,
    normalized_sql TEXT NOT NULL,
    operation TEXT NOT NULL,
    target_table TEXT NOT NULL,
    source TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL,
    report JSONB NOT NULL DEFAULT '{}'::JSONB,
    risk_score INTEGER,
    risk_level TEXT,
    fingerprint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS analyses_created_at_idx
    ON blastshield_control.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS analyses_status_idx
    ON blastshield_control.analyses(status);

DO $roles$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'blastshield_app') THEN
        CREATE ROLE blastshield_app LOGIN PASSWORD 'app_demo_password'
            NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;
END
$roles$;

GRANT CONNECT ON DATABASE blastshield TO blastshield_app;
REVOKE TEMPORARY ON DATABASE blastshield FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA blastshield_control TO blastshield_app;
GRANT SELECT, INSERT, UPDATE ON blastshield_control.analyses TO blastshield_app;
