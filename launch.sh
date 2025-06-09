#!/bin/bash

# Emerald Plant Tracker Launch Script
echo "🌿 Launching Emerald Plant Tracker..."

# Check if setup has been run
if [ ! -f ".setup-complete" ]; then
    echo "🔧 Running initial setup..."
    ./setup-prod.sh
    if [ $? -eq 0 ]; then
        touch .setup-complete
        echo "✅ Setup complete!"
    else
        echo "❌ Setup failed. Please check the error messages above."
        exit 1
    fi
fi

# Start the container
echo "🚀 Starting Emerald Plant Tracker container..."
docker-compose up -d

# Wait a moment for the container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check if it's running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Emerald Plant Tracker is now running!"
    echo ""
    echo "🌐 Access your application at: http://localhost:420"
    echo "📊 Check status with: ./docker-status.sh"
    echo "📝 View logs with: docker-compose logs -f"
else
    echo "❌ Failed to start Emerald Plant Tracker. Check logs with: docker-compose logs"
    exit 1
fi
