# ---- Build frontend ----
FROM oven/bun:1 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN bun install
COPY frontend/ ./
# Disable parallel processing to avoid worker_threads issues
ENV DISABLE_ESLINT_PLUGIN=true
ENV TERSER_PARALLEL=false
RUN bun run build

# ---- Build backend ----
FROM oven/bun:1 AS backend-build
WORKDIR /app
COPY backend/package.json ./backend/
RUN cd backend && bun install --production

# ---- Final image ----
FROM oven/bun:1
WORKDIR /app

# Copy backend code
COPY backend ./backend

# Copy built frontend into backend/public
COPY --from=frontend-build /app/frontend/build ./backend/public

# Install backend dependencies
RUN cd backend && bun install --production

# Ensure data and uploads directories exist
RUN mkdir -p backend/data backend/uploads

# Expose backend port
EXPOSE 420

# Start the backend server
CMD ["bun", "run", "backend/server.js"] 