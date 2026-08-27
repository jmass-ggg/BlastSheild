ALTER TABLE blastshield_control.analyses
    ADD COLUMN IF NOT EXISTS approved_by TEXT,
    ADD COLUMN IF NOT EXISTS approval_reason TEXT,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_by TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS execution_claimed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS execution_affected_rows INTEGER,
    ADD COLUMN IF NOT EXISTS failure_code TEXT,
    ADD COLUMN IF NOT EXISTS failure_message TEXT;

GRANT SELECT, INSERT, UPDATE ON blastshield_control.analyses TO blastshield_app;

