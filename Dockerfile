# Builder — full deps + compile (also used as dev compose target)
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
  && pnpm add esbuild@0.28.0 msgpackr-extract@3.0.4 --allow-build=esbuild --allow-build=msgpackr-extract \
  && pnpm install --frozen-lockfile

COPY . .

RUN CI=true pnpm run build

# Prod deps — prune on builder filesystem; stage is discarded except node_modules copy
FROM builder AS prod-deps

RUN corepack enable pnpm && pnpm prune --prod

# Runner — slim runtime only (no corepack / pnpm)
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=prod-deps /app/node_modules ./node_modules

RUN apk add --no-cache curl \
  && mkdir /app/logs \
  && chown node:node /app/logs

EXPOSE 8080

USER node

CMD ["node", "dist/src/index.js"]
