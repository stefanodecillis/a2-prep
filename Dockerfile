# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build the Vite frontend ----------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# ---------- Stage 2: runtime ----------
FROM oven/bun:1-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/data/app.db

# Only the bits we actually need at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/index.html ./index.html

# /data is mounted from the host (TrueNAS dataset) and holds the SQLite file.
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3000

CMD ["bun", "server.ts"]
