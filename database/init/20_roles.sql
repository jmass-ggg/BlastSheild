DO $roles$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'blastshield_analyzer') THEN
        CREATE ROLE blastshield_analyzer LOGIN PASSWORD 'analyzer_demo_password'
            NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'blastshield_executor') THEN
        CREATE ROLE blastshield_executor LOGIN PASSWORD 'executor_demo_password'
            NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;
END
$roles$;

GRANT CONNECT ON DATABASE blastshield TO blastshield_analyzer, blastshield_executor;

GRANT USAGE ON SCHEMA public TO blastshield_analyzer;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO blastshield_analyzer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO blastshield_analyzer;
ALTER ROLE blastshield_analyzer SET statement_timeout = '5s';
ALTER ROLE blastshield_analyzer SET lock_timeout = '1s';
ALTER ROLE blastshield_analyzer SET default_transaction_read_only = on;

GRANT USAGE ON SCHEMA public TO blastshield_executor;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO blastshield_executor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO blastshield_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO blastshield_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO blastshield_executor;

