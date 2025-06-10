#!/bin/bash

# Emerald Plant Tracker - Docker Build and Push Script
# This script builds the local Docker image and pushes it to Docker Hub

set -e  # Exit on any error

echo "🌿 Building and pushing Emerald Plant Tracker Docker image..."

# Build the Docker image locally with the HTTP fixes
echo "📦 Building Docker image with HTTP fixes..."
docker build -t dmans218/emerald-plant-tracker:latest .

# Tag with version numbers
echo "🏷️  Tagging image versions..."
docker tag dmans218/emerald-plant-tracker:latest dmans218/emerald-plant-tracker:v1.0.1
docker tag dmans218/emerald-plant-tracker:latest dmans218/emerald-plant-tracker:v1.0
docker tag dmans218/emerald-plant-tracker:latest dmans218/emerald-plant-tracker:v1

# Login to Docker Hub (you'll be prompted for credentials)
echo "🔐 Logging into Docker Hub..."
docker login

# Push all tags to Docker Hub
echo "⬆️  Pushing images to Docker Hub..."
docker push dmans218/emerald-plant-tracker:latest
docker push dmans218/emerald-plant-tracker:v1.0.1
docker push dmans218/emerald-plant-tracker:v1.0
docker push dmans218/emerald-plant-tracker:v1

echo "✅ Successfully pushed updated image to Docker Hub!"
echo "🚀 Your server can now pull the fixed version with:"
echo "   docker pull dmans218/emerald-plant-tracker:latest"
echo "   docker compose pull && docker compose up -d"
