# Single-stage build — node_modules must stay on disk because better-sqlite3
# is a native addon (.node binary) that cannot be bundled by Rollup/Nitro.
# Node resolves it by walking up from .output/server/ → finds /app/node_modules/better-sqlite3.
FROM node:20-alpine

WORKDIR /app

# build tools required to compile better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* bun.lockb* ./
RUN npm install

COPY . .
RUN npm run build

# Data directory — mount a volume here to persist the SQLite database
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3000

ENV NODE_ENV=production
ENV DB_PATH=/data

CMD ["node", ".output/server/index.mjs"]
