#!/bin/bash

# Clean up development artifacts and rebuild

echo "🧹 Cleaning up development environment..."

# Remove node_modules
echo "Removing node_modules..."
rm -rf backend/node_modules
rm -rf frontend/node_modules

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf backend/dist
rm -rf frontend/dist

# Remove logs
echo "Clearing logs..."
rm -f backend/logs/*.log

# Remove Docker volumes (optional - commented out)
# echo "Removing Docker volumes..."
# docker-compose down -v

echo "✅ Cleanup complete!"
echo ""
echo "To rebuild:"
echo "  docker-compose up --build"
