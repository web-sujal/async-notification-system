FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm add esbuild@0.28.0 msgpackr-extract@3.0.4 --allow-build=esbuild --allow-build=msgpackr-extract && pnpm install --frozen-lockfile

COPY . .

RUN CI=true pnpm run build

EXPOSE 8080

CMD ["node", "dist/src/index.js"]