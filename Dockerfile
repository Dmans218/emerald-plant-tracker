# ---- Build frontend ----
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# ---- Final unified container ----
FROM node:22-bookworm-slim
WORKDIR /app

# curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

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
