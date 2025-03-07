.PHONY: run-backend
run-backend:
	uv run fastapi dev main.py

.PHONY: run-redis
run-redis:
	docker compose up -d redis

.PHONY: run-tests
run-tests:
	uv run pytest .
