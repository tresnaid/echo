# ------------------------------------------------------------------------------
# Backend Container (Node 20 + native build tools for sharp & better-sqlite3)
# ------------------------------------------------------------------------------
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/echo.db
ENV UPLOADS_PATH=/app/data/uploads

EXPOSE 3001
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["npm", "start"]
