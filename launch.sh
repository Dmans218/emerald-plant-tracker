#!/bin/bash

# Emerald Plant Tracker - Local Development Launch Script

set -e  # Exit on any error

echo "🌿 Launching Emerald Plant Tracker for development..."

# Check if we should build locally or use Docker Hub image
if [ "$1" = "--local" ] || [ "$1" = "-l" ]; then
    echo "🔨 Building local Docker image..."
    docker build -t dmans218/emerald-plant-tracker:latest .
    echo "✅ Local build complete!"
fi

# Start the application
echo "🚀 Starting application..."
if [ -f "docker-compose.dev.yml" ]; then
    echo "📋 Using development compose file..."
    docker compose -f docker-compose.dev.yml up -d
elif [ -f "docker-compose.yml" ]; then
    echo "📋 Using production compose file..."
    docker compose up -d
else
    echo "📋 Using direct docker run..."
    docker run -d \
      --name emerald-plant-tracker \
      -p 420:420 \
      -v $(pwd)/backend/data:/app/backend/data \
      -v $(pwd)/backend/uploads:/app/backend/uploads \
      dmans218/emerald-plant-tracker:latest
fi

echo "✅ Application started!"
echo "🌐 Access your app at: http://localhost:420"
echo "📋 To view logs: docker logs emerald-plant-tracker -f"
echo "⏹️  To stop: docker compose down (or docker stop emerald-plant-tracker)"
