#!/bin/bash

echo "🌿 Emerald Plant Tracker Docker Status"
echo "====================================="

# Check if container is running
docker-compose ps

echo ""
echo "🌐 Application Status:"
if curl -s http://localhost:420 > /dev/null; then
    echo "✅ Emerald Plant Tracker is accessible on http://localhost:420"
else
    echo "❌ Emerald Plant Tracker is not accessible"
fi

echo ""
echo "� Health Check:"
if curl -s http://localhost:420/api/health > /dev/null; then
    echo "✅ API is healthy"
else
    echo "❌ API is not responding"
fi

echo ""
echo "📊 Container Logs (last 15 lines):"
docker-compose logs --tail=15 growlogger

echo ""
echo "🔧 Quick Commands:"
echo "Restart:         docker-compose restart"
echo "View logs:       docker-compose logs -f"
echo "Stop:            docker-compose down"
echo "Rebuild:         docker-compose build --no-cache && docker-compose up -d"
echo "Start all:       sudo docker-compose up -d" 