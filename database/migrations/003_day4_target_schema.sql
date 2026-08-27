ALTER TABLE blastshield_control.analyses
    ADD COLUMN IF NOT EXISTS target_schema TEXT NOT NULL DEFAULT 'public';

GRANT SELECT, INSERT, UPDATE ON blastshield_control.analyses TO blastshield_app;
