# Async Notification System

Express + TypeScript API that stores notifications in PostgreSQL and delivers them asynchronously via a **transactional outbox**, BullMQ, and a background worker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose (recommended)
- Or: Node.js 20+, pnpm, PostgreSQL, and Redis (local dev)

## Quick start (Docker)

```bash
pnpm install

cp .env.docker.example .env.docker
cp .env.docker.development.example .env.docker.development
# optional — only if running the app on the host with pnpm dev
cp .env.example .env
```

**Prod stack** (Nginx, API, worker, relay, migrate, Postgres, Redis):

```bash
pnpm docker:start
```

Open **http://localhost** (Nginx on port 80). Migrations run automatically on first boot.

**Dev stack** (tsx hot reload + Compose file watch, Postgres exposed on `5432` for pgcli):

```bash
pnpm docker:dev
```

## Environment files

| Copy from | To | Used when |
| --------- | -- | --------- |
| `.env.docker.example` | `.env.docker` | `pnpm docker:start` |
| `.env.docker.development.example` | `.env.docker.development` | `pnpm docker:dev` |
| `.env.example` | `.env` | Local `pnpm dev` on the host |

Edit credentials if needed. Defaults are fine for local Docker.

## Scripts

### Docker

| Command | Description |
| ------- | ----------- |
| `pnpm docker:build` | Build images |
| `pnpm docker:start` | Prod stack, detached |
| `pnpm docker:dev` | Dev override + watch |

### Local (host)

Requires Postgres and Redis running locally. Use `.env` with `localhost` URLs.

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | API (`http://localhost:8080`) |
| `pnpm dev:relay` | Outbox relay |
| `pnpm dev:worker` | Delivery worker |
| `pnpm migration:run` | Apply SQL migrations |
| `pnpm build` | Compile to `dist/` |
| `pnpm test` | Run tests |

Run **API + relay + worker** in separate terminals for full delivery locally.

## API

Create a notification (saved to DB, outbox → relay → queue → worker):

**Docker** (via Nginx):

```bash
curl -sS -X POST "http://localhost/api/v1/notifications" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "content": "World"}' | jq
```

**Local `pnpm dev`:**

```bash
curl -sS -X POST "http://localhost:8080/api/v1/notifications" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "content": "World"}' | jq
```

Health check:

```bash
curl http://localhost/health          # Docker
curl http://localhost:8080/health     # local dev
```

Bull Board (dev): **http://localhost/admin/queues** (Docker) or **http://localhost:8080/admin/queues** (local).

## Architecture

Layering, outbox flow, Docker topology, logging, and DB conventions: [ARCHITECTURE.md](./ARCHITECTURE.md).
