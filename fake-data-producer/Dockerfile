FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install --production

ENV NODE_ENV=production

CMD ["bun", "index.ts"]
