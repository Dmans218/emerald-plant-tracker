# ---- Build frontend ----
FROM node:24 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Build backend ----
FROM node:24 AS backend-build
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# ---- Final unified container ----
FROM node:24
WORKDIR /app

# Copy backend code
COPY backend ./backend

# Copy built frontend into backend/public
COPY --from=frontend-build /app/frontend/build ./backend/public

# Install backend dependencies
RUN cd backend && npm ci --only=production

# Ensure data and uploads directories exist with proper permissions
RUN mkdir -p backend/data backend/uploads && \
    chown -R node:node backend/data backend/uploads

# Copy and set permissions for initialization script
COPY backend/init-and-start.sh backend/
RUN chmod +x backend/init-and-start.sh && \
    chown node:node backend/init-and-start.sh

# Set environment variable for port 420
ENV PORT=420
ENV NODE_ENV=production

# Switch to non-root user for security
USER node

# Expose port 420
EXPOSE 420

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:420/ || exit 1

# Start the backend server with initialization script
CMD ["./backend/init-and-start.sh"] 