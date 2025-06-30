FROM oven/bun:1.1-alpine as build

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies with Bun (much faster than npm)
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Build the app with Bun
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 420

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:420 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 