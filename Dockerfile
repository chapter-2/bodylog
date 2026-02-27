# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# build tools required to compile better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* bun.lockb* ./
RUN npm install

COPY . .
RUN npm run build


# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# runtime build tools needed for better-sqlite3 native .node binary
RUN apk add --no-cache python3 make g++

# .output is fully self-contained — no npm install needed in prod stage
COPY --from=builder /app/.output ./.output

# Data directory — mount a volume here to persist the SQLite database
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3000

ENV NODE_ENV=production
ENV DB_PATH=/data

CMD ["node", ".output/server/index.mjs"]
