# ------------------------------------------------------------------------------
# Base Node image with build dependencies for native modules (sharp, better-sqlite3)
# ------------------------------------------------------------------------------
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------------------------
# Dependencies stage
# ------------------------------------------------------------------------------
FROM base AS dependencies
COPY package*.json ./
COPY vendor/ ./vendor/
RUN npm install

# ------------------------------------------------------------------------------
# Build stage (builds React/Vite SPA and compiles TypeScript)
# ------------------------------------------------------------------------------
FROM dependencies AS builder
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Target: Unified Fullstack Container (Default)
# Serves both Express API & built static frontend on port 3001
# ------------------------------------------------------------------------------
FROM base AS unified
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/echo.db
ENV UPLOADS_PATH=/app/data/uploads

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY vendor/ ./vendor/
COPY server/ ./server/
COPY tsconfig.json ./

EXPOSE 3001
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["npm", "start"]

# ------------------------------------------------------------------------------
# Target: Backend-only Container
# ------------------------------------------------------------------------------
FROM base AS backend
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/echo.db
ENV UPLOADS_PATH=/app/data/uploads

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY vendor/ ./vendor/
COPY server/ ./server/
COPY tsconfig.json ./

EXPOSE 3001
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["npm", "start"]

# ------------------------------------------------------------------------------
# Target: Frontend-only Container (Nginx)
# ------------------------------------------------------------------------------
FROM nginx:alpine AS frontend
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=3s --retries=3 \
  CMD wget --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
