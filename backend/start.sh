#!/bin/bash

echo "========================================="
echo "  VayuDrishti Backend Quick Start"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if MongoDB is running (optional)
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running (will use in-memory storage)"
    fi
else
    echo "⚠️  MongoDB not installed (will use in-memory storage)"
fi

echo ""
echo "Starting backend server..."
echo "========================================="
echo ""

# Start the server
npm start
