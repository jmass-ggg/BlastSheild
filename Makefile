.PHONY: install test test-unit test-qa test-integration test-all db-up up down logs demo-up demo-down demo-check demo-rehearse demo-reset clean

DEMO_PROJECT ?= blastshield-demo
POSTGRES_PORT ?= $(shell grep POSTGRES_PORT .env 2>/dev/null | cut -d= -f2 || echo 5432)

install:
	python3 -m venv .venv
	.venv/bin/pip install -e './backend[test]'
	.venv/bin/pip install -e './mcp_server[test]'

test: test-unit test-qa

test-unit:
	.venv/bin/pytest backend/tests/unit mcp_server/tests

test-qa:
	.venv/bin/pytest backend/tests/qa

test-integration:
	BLASTSHIELD_TEST_DATABASE_URL="postgresql+psycopg://blastshield_analyzer:analyzer_demo_password@localhost:$(POSTGRES_PORT)/blastshield" \
	BLASTSHIELD_TEST_APP_DATABASE_URL="postgresql+psycopg://blastshield_app:app_demo_password@localhost:$(POSTGRES_PORT)/blastshield" \
	BLASTSHIELD_TEST_EXECUTION_DATABASE_URL="postgresql+psycopg://blastshield_executor:executor_demo_password@localhost:$(POSTGRES_PORT)/blastshield" \
	BLASTSHIELD_TEST_ADMIN_DATABASE_URL="postgresql+psycopg://postgres:postgres_demo_password@localhost:$(POSTGRES_PORT)/blastshield" \
	.venv/bin/pytest backend/tests/integration

test-all: test-unit test-qa test-integration

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
	POSTGRES_PORT=$(POSTGRES_PORT) .venv/bin/python backend/scripts/demo_check.py

demo-rehearse:
	docker --version
	docker compose config -q
	POSTGRES_PORT=$(POSTGRES_PORT) .venv/bin/python backend/scripts/demo_check.py --rehearse

demo-reset:
	@echo "WARNING: removing only Compose project '$(DEMO_PROJECT)' and its volumes"
	docker compose -p $(DEMO_PROJECT) down -v

clean:
	find backend mcp_server -type d \
		\( -name '__pycache__' -o -name '.pytest_cache' -o -name '*.egg-info' \) \
		-prune -exec rm -rf -- {} +
	rm -rf .pytest_cache .coverage htmlcov build dist
