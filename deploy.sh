#!/bin/bash

# Hydrogen Frontend Deployment Script for Hetzner Server
# This script should be run on your Hetzner server

set -e

echo "================================================"
echo "Hydrogen Dashboard Frontend Deployment"
echo "================================================"

# Configuration
REPO_URL="https://github.com/zinodacosta/HydrogenDashboard.git"
DEPLOY_DIR="/var/www/hydrogen-frontend"
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Setting up deployment directory...${NC}"

# Create deployment directory if it doesn't exist
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "Creating directory: $DEPLOY_DIR"
    sudo mkdir -p $DEPLOY_DIR
    sudo chown -R $USER:$USER $DEPLOY_DIR
fi

cd $DEPLOY_DIR

echo -e "${YELLOW}Step 2: Cloning/Updating repository...${NC}"

# Clone or pull latest changes
if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    git clone $REPO_URL .
else
    echo "Pulling latest changes..."
    git fetch origin
    git reset --hard origin/$BRANCH
fi

echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"

# Install frontend dependencies if package.json exists in public/
if [ -f "public/package.json" ]; then
    cd public
    npm install
    cd ..
fi

# Install root dependencies if needed
if [ -f "package.json" ]; then
    npm install
fi

echo -e "${YELLOW}Step 4: Setting permissions...${NC}"

# Set proper permissions
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo ""
echo "Frontend files are now in: $DEPLOY_DIR"
echo "Next steps:"
echo "1. Configure Nginx to serve from $DEPLOY_DIR/public"
echo "2. Set up SSL certificate (Let's Encrypt)"
echo "3. Configure your domain DNS"
echo ""
