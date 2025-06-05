#!/bin/bash

echo "🐳 Emerald Plant Tracker Docker Status"
echo "=========================="

# Check if containers are running
sudo docker-compose ps

echo ""
echo "🌐 Frontend Status:"
if curl -s http://localhost:420 > /dev/null; then
    echo "✅ Frontend is accessible on http://localhost:420"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "📊 Container Logs (last 10 lines):"
echo "Frontend:"
sudo docker-compose logs --tail=10 frontend

echo ""
echo "Backend:"
sudo docker-compose logs --tail=10 backend

echo ""
echo "🔧 Quick Commands:"
echo "Restart all:     sudo docker-compose restart"
echo "View logs:       sudo docker-compose logs -f"
echo "Stop all:        sudo docker-compose down"
echo "Start all:       sudo docker-compose up -d" 