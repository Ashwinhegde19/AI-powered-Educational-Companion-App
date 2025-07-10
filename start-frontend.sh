#!/bin/bash

# AI-powered Educational Companion App - Frontend Setup & Start Script

echo "🚀 Setting up React Native Development Environment..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo "📱 Starting Metro bundler..."
echo "📝 Note: To run on Android, open a new terminal and run: cd frontend && pnpm android"
echo "📝 Note: To run on iOS, open a new terminal and run: cd frontend && pnpm ios"
echo "📝 Note: Make sure you have an Android emulator running or iOS simulator running"
echo ""

pnpm start

echo "📱 Starting React Native Metro Bundler..."
echo "📋 Available commands:"
echo "  • pnpm android    - Run on Android device/emulator"
echo "  • pnpm ios        - Run on iOS simulator (macOS only)"
echo "  • pnpm start      - Start Metro bundler only"
echo ""
echo "🔧 Backend should be running on: http://localhost:3000"
echo "📱 For Android emulator, backend will be accessible at: http://10.0.2.2:3000"
echo ""

# Start Metro bundler
pnpm start
