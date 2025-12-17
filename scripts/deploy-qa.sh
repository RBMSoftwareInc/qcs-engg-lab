#!/bin/bash

# QA/Staging Deployment Script
# Usage: ./scripts/deploy-qa.sh

set -e  # Exit on error

echo "🚀 Starting QA/Staging Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ] && [ "$CURRENT_BRANCH" != "qa" ]; then
    echo -e "${YELLOW}Warning: You're not on staging/qa branch. Current: $CURRENT_BRANCH${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    exit 1
fi

# Build the site
echo -e "${GREEN}Building site...${NC}"
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo -e "${RED}Error: Build directory not found. Build may have failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Push to Git: git push origin $CURRENT_BRANCH"
echo "2. If using Hostinger Git deployment, it will auto-deploy"
echo "3. Or manually upload the 'build/' directory to Hostinger"
echo ""
echo "Build output is in: $(pwd)/build"

