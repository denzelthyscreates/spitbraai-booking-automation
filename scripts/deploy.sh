
#!/bin/bash

# Spitbraai Automation Deployment Script
# This script helps deploy the automation system to production

set -e  # Exit on any error

echo "🔥 Spitbraai Automation Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo "📋 Checking Node.js version..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm version: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Install TypeScript and build tools
echo "🔧 Installing build dependencies..."
npm install -D typescript ts-node

# Build the project
echo "🏗️ Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if PM2 is installed
echo "🔍 Checking PM2..."
if command_exists pm2; then
    echo "✅ PM2 is already installed"
else
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
echo "🛑 Stopping existing automation process..."
pm2 stop spitbraai-automation 2>/dev/null || echo "No existing process found"
pm2 delete spitbraai-automation 2>/dev/null || echo "No existing process to delete"

# Start the application with PM2
echo "🚀 Starting Spitbraai Automation with PM2..."
pm2 start dist/index.js --name "spitbraai-automation" --time

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
echo "⚙️ Setting up PM2 startup script..."
pm2 startup

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Next Steps:"
echo "1. Run 'pm2 logs spitbraai-automation' to view logs"
echo "2. Run 'pm2 monit' to monitor the process"
echo "3. Configure your webhook endpoints"
echo "4. Test with a sample booking"
echo ""
echo "🔧 Useful Commands:"
echo "- View logs: pm2 logs spitbraai-automation"
echo "- Restart: pm2 restart spitbraai-automation"
echo "- Stop: pm2 stop spitbraai-automation"
echo "- Monitor: pm2 monit"
echo ""
echo "✅ Spitbraai Automation is now running in production!"
