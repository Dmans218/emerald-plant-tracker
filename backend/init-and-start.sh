#!/bin/sh

# Script to ensure database initialization in production
echo "🔧 Database initialization script starting..."

DB_PATH="/app/backend/data/emerald-plant-tracker.db"
DATA_DIR="/app/backend/data"

# Ensure data directory exists
echo "📁 Ensuring data directory exists: $DATA_DIR"
mkdir -p "$DATA_DIR"

# Check if database file exists
if [ ! -f "$DB_PATH" ]; then
    echo "⚠️  Database file not found at $DB_PATH"
    echo "🔨 Creating empty database file..."
    touch "$DB_PATH"
    
    # Set proper permissions
    chmod 644 "$DB_PATH"
    echo "✅ Database file created with proper permissions"
else
    echo "✅ Database file already exists at $DB_PATH"
fi

# Check database file permissions
echo "📊 Database file info:"
ls -la "$DB_PATH"

# Check data directory permissions
echo "📊 Data directory info:"
ls -la "$DATA_DIR"

echo "🚀 Starting Node.js application..."
cd /app/backend
exec node server.js
