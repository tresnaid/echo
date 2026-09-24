# ------------------------------------------------------------------------------
# Build stage (React / Vite)
# ------------------------------------------------------------------------------
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY vendor/ ./vendor/
RUN npm install
COPY . .
ARG VITE_API_URL="http://localhost:3001"
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ------------------------------------------------------------------------------
# Production stage (Nginx)
# ------------------------------------------------------------------------------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
