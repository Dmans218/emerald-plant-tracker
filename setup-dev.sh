#!/bin/bash

# Growlogger Development Environment Setup Script
echo "Setting up Growlogger development environment..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install
cd ..

# Create required directories if they don't exist
echo "Creating required directories..."
mkdir -p backend/data
mkdir -p backend/uploads

# Set execute permissions for scripts
echo "Setting execute permissions for scripts..."
chmod +x docker-status.sh

echo "Development environment setup complete!"
echo "Run 'npm run dev' to start the development servers." 