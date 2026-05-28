# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm add esbuild@0.28.0 msgpackr-extract@3.0.4 --allow-build=esbuild --allow-build=msgpackr-extract && pnpm install --frozen-lockfile

COPY . .

RUN CI=true pnpm run build

RUN pnpm prune --prod

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

USER node

CMD ["node", "dist/src/index.js"]