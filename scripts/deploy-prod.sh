#!/bin/bash

# Production Deployment Script
# Usage: ./scripts/deploy-prod.sh

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "production" ]; then
    echo -e "${RED}Error: You must be on main/master/production branch for production deployment.${NC}"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Safety confirmation
echo -e "${YELLOW}⚠️  WARNING: This will deploy to PRODUCTION!${NC}"
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "Deployment cancelled."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    exit 1
fi

# Run checks
echo -e "${GREEN}Running pre-deployment checks...${NC}"
npm run check

# Build the site
# For Hostinger (static upload): use BUILD_STATIC=1 to output to build/
# For Netlify: push to Git and let Netlify build (no build/ dir); skip this script or run without BUILD_STATIC
echo -e "${GREEN}Building site for production...${NC}"
if [ -n "$BUILD_STATIC" ]; then
    NODE_ENV=production BUILD_STATIC=1 npm run build
else
    NODE_ENV=production npm run build
fi

# Check if build was successful (for static deploy, build/ must exist)
if [ -n "$BUILD_STATIC" ] && [ ! -d "build" ]; then
    echo -e "${RED}Error: Build directory not found. Build may have failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}"
echo ""
echo "⚠️  Final confirmation required:"
read -p "Push to production? (type 'DEPLOY' to confirm): " final_confirmation
if [ "$final_confirmation" != "DEPLOY" ]; then
    echo "Deployment cancelled."
    exit 1
fi

# Push to Git
echo -e "${GREEN}Pushing to Git...${NC}"
git push origin $CURRENT_BRANCH

echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""
echo "Next steps:"
echo "  • Netlify: Push to Git; Netlify will build and deploy. Studio works."
echo "  • Hostinger (static): Run BUILD_STATIC=1 npm run build, then upload contents of build/ to public_html/"
echo "  See DEPLOYMENT.md for full instructions."

