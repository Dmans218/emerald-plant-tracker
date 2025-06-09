#!/bin/bash

echo "🛑 Stopping Growlogger Development Environment..."

# Stop the development containers
docker compose -f docker-compose.dev.yml down

echo "✅ Development environment stopped!"
