FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3000

ENV NODE_ENV=production
ENV DB_PATH=/data

CMD ["node", ".output/server/index.mjs"]
