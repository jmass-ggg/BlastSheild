CREATE SCHEMA blastshield_control;

CREATE TABLE blastshield_control.analyses (
    id UUID PRIMARY KEY,
    original_sql TEXT NOT NULL,
    normalized_sql TEXT NOT NULL,
    operation TEXT NOT NULL,
    target_schema TEXT NOT NULL DEFAULT 'public',
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
    approved_by TEXT,
    approval_reason TEXT,
    rejected_at TIMESTAMPTZ,
    rejected_by TEXT,
    rejection_reason TEXT,
    execution_claimed_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    execution_affected_rows INTEGER,
    failure_code TEXT,
    failure_message TEXT
);

CREATE INDEX analyses_created_at_idx
    ON blastshield_control.analyses(created_at DESC);
CREATE INDEX analyses_status_idx
    ON blastshield_control.analyses(status);
