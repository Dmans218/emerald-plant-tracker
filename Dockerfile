# ---- Build frontend ----
FROM node:26-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# ---- Install backend deps (native modules against bookworm glibc) ----
FROM node:26-bookworm-slim AS backend-deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY backend/package*.json ./
# Build sqlite3 from source so it links against bookworm's glibc (prebuilds may need newer)
RUN npm ci --omit=dev --build-from-source

# ---- Final unified container ----
FROM node:26-bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/
COPY backend ./backend
COPY --from=frontend-build /app/frontend/build ./backend/public

RUN mkdir -p backend/data backend/uploads && \
    chown -R node:node backend/data backend/uploads backend/public

COPY backend/init-and-start.sh backend/
RUN chmod +x backend/init-and-start.sh && chown node:node backend/init-and-start.sh

ENV PORT=420
ENV NODE_ENV=production
ENV ENABLE_PUBLIC_HEALTH=true

USER node

EXPOSE 420

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:420/api/health || exit 1

CMD ["./backend/init-and-start.sh"]
