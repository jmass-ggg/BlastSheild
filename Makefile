.PHONY: install test test-unit test-integration db-up up down logs demo-up demo-down demo-check demo-reset clean

DEMO_PROJECT ?= blastshield-demo

install:
	python3 -m venv .venv
	.venv/bin/pip install -e './backend[test]'
	.venv/bin/pip install -e './mcp_server[test]'

test: test-unit

test-unit:
	.venv/bin/pytest backend/tests/unit mcp_server/tests

test-integration:
	BLASTSHIELD_TEST_DATABASE_URL="postgresql+psycopg://blastshield_analyzer:analyzer_demo_password@localhost:$${POSTGRES_PORT:-5432}/blastshield" \
	BLASTSHIELD_TEST_APP_DATABASE_URL="postgresql+psycopg://blastshield_app:app_demo_password@localhost:$${POSTGRES_PORT:-5432}/blastshield" \
	BLASTSHIELD_TEST_EXECUTION_DATABASE_URL="postgresql+psycopg://blastshield_executor:executor_demo_password@localhost:$${POSTGRES_PORT:-5432}/blastshield" \
	BLASTSHIELD_TEST_ADMIN_DATABASE_URL="postgresql+psycopg://postgres:postgres_demo_password@localhost:$${POSTGRES_PORT:-5432}/blastshield" \
	.venv/bin/pytest backend/tests/integration

db-up:
	docker compose up -d postgres migrate

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f backend postgres

demo-up:
	docker compose -p $(DEMO_PROJECT) up --build -d

demo-down:
	docker compose -p $(DEMO_PROJECT) down

demo-check:
	docker --version
	docker compose config -q
	.venv/bin/python backend/scripts/demo_check.py

demo-reset:
	@echo "WARNING: removing only Compose project '$(DEMO_PROJECT)' and its volumes"
	docker compose -p $(DEMO_PROJECT) down -v

clean:
	rm -rf .pytest_cache backend/.pytest_cache backend/*.egg-info
