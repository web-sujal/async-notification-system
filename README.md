# Async Notification System

Express + TypeScript API that creates notifications in PostgreSQL and delivers them asynchronously via BullMQ.

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL
- Redis

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm migration:run
```

Run the API and worker in **separate terminals**:

```bash
pnpm dev          # http://localhost:8080
pnpm dev:worker   # processes delivery jobs
```

## Environment

See `.env.example`. Required variables:

| Variable | Description |
| -------- | ----------- |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `PORT` | HTTP port (default `8080`) |

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | API with hot reload |
| `pnpm dev:worker` | Worker with hot reload |
| `pnpm migration:run` | Apply SQL migrations |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Run compiled API |
| `pnpm worker` | Run compiled worker |
| `pnpm test` | Run tests |

## API

Create a notification (saved to DB, enqueued for delivery):

```bash
curl -sS -X POST "http://localhost:8080/api/v1/notifications" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "content": "World"}' | jq
```

Health check:

```bash
curl http://localhost:8080/health
```

## Architecture

For layer responsibilities, request flow, error handling, logging, and DB conventions, see [ARCHITECTURE.md](./ARCHITECTURE.md).
