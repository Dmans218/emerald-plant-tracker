#!/bin/bash

echo "🚀 Starting Growlogger Development Environment..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker compose -f docker-compose.dev.yml down

# Build and start the development environment
echo "🔨 Building and starting development containers..."
docker compose -f docker-compose.dev.yml up --build

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "💡 To stop: Ctrl+C or run 'docker compose -f docker-compose.dev.yml down'"
