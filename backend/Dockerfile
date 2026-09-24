# ------------------------------------------------------------------------------
# Stage 1: Build stage (compiles TypeScript to JavaScript)
# ------------------------------------------------------------------------------
FROM node:20-slim AS builder
WORKDIR /app

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

# ------------------------------------------------------------------------------
# Stage 2: Production runtime stage
# Installs production dependencies and native addons directly in the runtime environment
# ------------------------------------------------------------------------------
FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/echo.db
ENV UPLOADS_PATH=/app/data/uploads

COPY package*.json ./

# Install temporary build tools to compile production native addons, then purge
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && npm install --omit=dev \
    && apt-get purge -y --auto-remove python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3001
VOLUME ["/app/data"]

# Native fetch healthcheck supported in Node 20
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
