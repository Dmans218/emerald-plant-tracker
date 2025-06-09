#!/bin/bash

# Emerald Plant Tracker - Production Deployment Script
# Run this on your server to deploy the latest version

set -e  # Exit on any error

echo "🌿 Deploying Emerald Plant Tracker with HTTP fixes..."

# Pull the latest image from Docker Hub
echo "⬇️  Pulling latest image from Docker Hub..."
docker pull dmans218/emerald-plant-tracker:latest

# Stop existing container if running
echo "⏹️  Stopping existing container..."
docker compose down || docker-compose down || true

# Start with the new image
echo "🚀 Starting updated container..."
if [ -f "docker-compose.yml" ]; then
    docker compose up -d || docker-compose up -d
else
    # Fallback single container run
    docker run -d \
      --name emerald-plant-tracker \
      -p 420:420 \
      -v emerald_data:/app/backend/data \
      -v emerald_uploads:/app/backend/uploads \
      --restart unless-stopped \
      dmans218/emerald-plant-tracker:latest
fi

echo "✅ Deployment complete!"
echo "🌐 Your application should now be running without SSL errors at http://your-server:420"
echo "📋 To check logs: docker logs emerald-plant-tracker -f"
