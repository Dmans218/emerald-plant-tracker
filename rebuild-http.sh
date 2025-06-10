#!/bin/bash

echo "🔄 Rebuilding Growlogger for HTTP-only serving..."

# Stop any running containers
echo "Stopping existing containers..."
docker compose down

# Remove any existing images to force rebuild
echo "Removing existing images..."
docker rmi dmans218/emerald-plant-tracker:latest 2>/dev/null || true

# Clear browser cache related warnings
echo "Building fresh containers..."

# Build new image
docker compose build --no-cache

# Start the application
echo "Starting application..."
docker compose up -d

echo "✅ Rebuild complete!"
echo "Your app should now be available at http://192.168.1.221:420"
echo "Please clear your browser cache or use an incognito window to avoid cached HTTPS redirects."
echo ""
echo "To monitor logs: docker compose logs -f"
echo "To check status: docker compose ps"
