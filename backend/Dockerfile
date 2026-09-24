# ------------------------------------------------------------------------------
# Stage 1: Build stage (installs dependencies, compiles TypeScript)
# ------------------------------------------------------------------------------
FROM node:20-slim AS builder
WORKDIR /app

# Install native build tools for sharp & better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Stage 2: Production runtime stage (lean, no build tools or devDependencies)
# ------------------------------------------------------------------------------
FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/echo.db
ENV UPLOADS_PATH=/app/data/uploads

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001
VOLUME ["/app/data"]

# Native fetch healthcheck supported in Node 20
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
