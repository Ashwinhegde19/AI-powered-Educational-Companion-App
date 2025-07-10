#!/bin/bash

# AI-powered Educational Companion App Setup Script

set -e

echo "🚀 Setting up AI-powered Educational Companion App..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Node.js version is compatible
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ pnpm version: $(pnpm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

cd backend
pnpm install
cd ..

echo "✅ Dependencies installed successfully"

# Copy environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating environment file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your API keys and configuration"
else
    echo "✅ Environment file already exists"
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB:"
    echo "   sudo systemctl start mongodb"
    echo "   OR"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:7.0"
fi

# Check if Qdrant is running
if ! curl -s http://localhost:6333/health > /dev/null; then
    echo "⚠️  Qdrant is not running. Please start Qdrant:"
    echo "   docker run -d -p 6333:6333 --name qdrant qdrant/qdrant"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Start MongoDB (if not already running)"
echo "3. Start Qdrant (if not already running)"
echo "4. Run: pnpm run backend:dev"
echo ""
echo "API Documentation will be available at: http://localhost:3000/api"
echo "Health check: http://localhost:3000/health"
echo ""
echo "For Docker setup, run: docker-compose up -d"
