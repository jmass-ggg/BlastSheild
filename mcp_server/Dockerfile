FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY pyproject.toml ./
COPY blastshield_mcp ./blastshield_mcp
RUN pip install --no-cache-dir .

EXPOSE 8001

CMD ["blastshield-mcp"]
