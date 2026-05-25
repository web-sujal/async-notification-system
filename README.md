# Express App Template

Opinionated Express + TypeScript starter with config validation, structured errors, file logging, and health checks.

## Quick start

```bash
git clone <this-repo> my-new-app
cd my-new-app
pnpm install
cp .env.example .env
pnpm dev
```

## Using as a template

1. Clone or click **Use this template** on GitHub.
2. Rename `name` in `package.json`.
3. Update this README title and description.
4. Point git remote at your new repo:

```bash
git remote set-url origin git@github.com:you/my-new-app.git
```

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `pnpm dev`     | Start dev server with hot reload |
| `pnpm build`   | Compile TypeScript to `dist/`  |
| `pnpm start`   | Run compiled app               |
| `pnpm test`    | Run tests                      |
| `pnpm lint`    | Lint TypeScript                |
| `pnpm format`  | Format with Prettier           |

## Project layout

```
src/
├── config/          # env validation (zod)
├── middlewares/     # error handler, etc.
├── routes/v1/     # API routes
└── utils/         # logger, ApiError, helpers
```

## Environment

See `.env.example`. Logs are written to `logs/` (file only); HTTP request logs go to the terminal via Morgan.
