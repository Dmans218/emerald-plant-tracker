#!/bin/bash

echo "🚀 Pushing Emerald Plant Tracker to Docker Hub..."
echo "Repository: https://hub.docker.com/repository/docker/dmans218/emerald-plant-tracker"
echo ""

# Push all tags
echo "📤 Pushing latest tag..."
docker push dmans218/emerald-plant-tracker:latest

echo "📤 Pushing v1.0.0 tag..."
docker push dmans218/emerald-plant-tracker:v1.0.0

echo "📤 Pushing stable tag..."
docker push dmans218/emerald-plant-tracker:stable

echo ""
echo "✅ All tags pushed successfully!"
echo ""
echo "🌐 Your image is now available on Docker Hub:"
echo "• docker pull dmans218/emerald-plant-tracker:latest"
echo "• docker pull dmans218/emerald-plant-tracker:stable"
echo "• docker pull dmans218/emerald-plant-tracker:v1.0.0"
echo ""
echo "🔗 View on Docker Hub: https://hub.docker.com/repository/docker/dmans218/emerald-plant-tracker"
