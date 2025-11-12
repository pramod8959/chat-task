#!/bin/bash

# Production deployment script

set -e

echo "🚀 Deploying Chat Application..."

# Check environment
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Copy .env.example to .env and configure it first"
    exit 1
fi

# Build backend
echo "📦 Building backend..."
cd backend
npm install --production=false
npm run build
npm prune --production

# Start with PM2
echo "🔄 Starting backend with PM2..."
npm run pm2:start

# Build frontend
echo "📦 Building frontend..."
cd ../frontend
npm install
npm run build

echo "✅ Deployment complete!"
echo ""
echo "Services:"
echo "  Backend: http://localhost:4000"
echo "  Frontend: Serve 'dist' folder with nginx"
echo ""
echo "PM2 Commands:"
echo "  pm2 logs chat-backend"
echo "  pm2 monit"
echo "  pm2 restart chat-backend"
