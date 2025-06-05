# ---- Build frontend ----
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Build backend ----
FROM node:18 AS backend-build
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# ---- Final image ----
FROM node:18
WORKDIR /app

# Copy backend code
COPY backend ./backend

# Copy built frontend into backend/public
COPY --from=frontend-build /app/frontend/build ./backend/public

# Install backend dependencies
RUN cd backend && npm ci --only=production

# Ensure data and uploads directories exist
RUN mkdir -p backend/data backend/uploads

# Expose backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "backend/server.js"] 