#!/bin/bash

# Growlogger Production Environment Setup Script
echo "Setting up Growlogger production environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and Docker Compose first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create required directories if they don't exist
echo "Creating required directories..."
mkdir -p backend/data
mkdir -p backend/uploads

# Set execute permissions for scripts
echo "Setting execute permissions for scripts..."
chmod +x docker-status.sh

# Build Docker containers
echo "Building Docker containers..."
docker-compose build

echo "Production environment setup complete!"
echo "Run 'docker-compose up -d' to start the application in detached mode."
echo "Access the application at http://localhost:420" 