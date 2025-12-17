#!/bin/bash

# FTP Deployment Script for Hostinger
# Usage: ./scripts/deploy-ftp.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting FTP Deployment (${ENVIRONMENT})...${NC}"

# Configuration - UPDATE THESE VALUES
FTP_HOST="ftp.yourdomain.com"  # Get from Hostinger FTP Accounts
FTP_USER="your-ftp-username"    # Your FTP username
FTP_PASS="your-ftp-password"    # Your FTP password

if [ "$ENVIRONMENT" = "staging" ]; then
    FTP_DIR="public_html/staging"  # Or your staging subdomain directory
    echo -e "${YELLOW}Deploying to STAGING${NC}"
else
    FTP_DIR="public_html"
    echo -e "${RED}⚠️  Deploying to PRODUCTION${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo -e "${RED}Error: lftp is not installed.${NC}"
    echo "Install it:"
    echo "  macOS: brew install lftp"
    echo "  Linux: sudo apt-get install lftp"
    echo ""
    echo "Or use FileZilla/other FTP client to upload build/ directory manually."
    exit 1
fi

# Build the site
echo -e "${GREEN}Building site...${NC}"
npm run build

if [ ! -d "build" ]; then
    echo -e "${RED}Error: Build directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}Build complete!${NC}"
echo -e "${YELLOW}Uploading to ${FTP_HOST}/${FTP_DIR}...${NC}"

# Upload using lftp
lftp -c "
set ftp:ssl-allow no
set ssl:verify-certificate no
open -u ${FTP_USER},${FTP_PASS} ${FTP_HOST}
cd ${FTP_DIR}
mirror -R --delete --verbose build/ .
bye
"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit your site to verify"
echo "2. Test all pages"
echo "3. Test Studio at /studio"
echo ""
echo "If using staging subdomain:"
echo "  Visit: https://staging.yourdomain.com"

