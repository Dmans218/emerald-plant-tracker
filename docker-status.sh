#!/bin/bash

# Emerald Plant Tracker - Docker Status Check Script

echo "🌿 Emerald Plant Tracker - Status Check"
echo "========================================"

# Check if container is running
if docker ps | grep -q emerald-plant-tracker; then
    echo "✅ Container Status: RUNNING"
    echo "📊 Container Info:"
    docker ps --filter name=emerald-plant-tracker --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Check HTTP headers to verify HTTP-only serving
    echo "🌐 Testing HTTP Headers (checking for SSL/HTTPS issues):"
    if command -v curl &> /dev/null; then
        echo "Testing: http://localhost:420"
        curl -I http://localhost:420 2>/dev/null | grep -E "(Origin-Agent-Cluster|upgrade-insecure-requests|Strict-Transport-Security)" || echo "✅ No problematic HTTPS headers found!"
    else
        echo "⚠️  curl not available - install curl to test headers"
    fi
    
    echo ""
    echo "📋 Recent Logs:"
    docker logs emerald-plant-tracker --tail 10
    
else
    echo "❌ Container Status: NOT RUNNING"
    echo ""
    echo "📋 Recent stopped containers:"
    docker ps -a --filter name=emerald-plant-tracker --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

echo ""
echo "🔧 Useful Commands:"
echo "   Start:   ./launch.sh"
echo "   Stop:    docker compose down"
echo "   Logs:    docker logs emerald-plant-tracker -f"
echo "   Rebuild: ./rebuild-http.sh"
echo "   Deploy:  ./docker-push.sh"
