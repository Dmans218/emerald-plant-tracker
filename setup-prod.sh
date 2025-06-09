#!/bin/bash

# Growlogger Production Environment Setup Script
echo "🌿 Setting up Growlogger production environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose first."
    echo "   Ubuntu/Debian: sudo apt update && sudo apt install docker.io docker-compose"
    echo "   CentOS/RHEL: sudo yum install docker docker-compose"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping any existing Growlogger containers..."
docker-compose down 2>/dev/null || true

# Build the unified Docker container
echo "🔨 Building Growlogger unified container..."
docker-compose build --no-cache

echo "✅ Production environment setup complete!"
echo ""
echo "To start Growlogger:"
echo "  docker-compose up -d"
echo ""
echo "To check status:"
echo "  ./docker-status.sh"
echo ""
echo "Access your application at: http://localhost:420"

echo "Production environment setup complete!"
echo "Run 'docker-compose up -d' to start the application in detached mode."
echo "Access the application at http://localhost:420" 