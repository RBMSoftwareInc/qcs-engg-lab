# Hostinger FTP/SFTP Deployment Guide

Since Git deployment may not be available with Hostinger Website Builder, here's how to deploy using FTP/SFTP.

## Option 1: Use Existing Domain (Replace Website Builder Site)

If you want to replace your current Website Builder site with your SvelteKit site:

### Step 1: Access File Manager or FTP

1. **In Hostinger hPanel:**
   - Go to **Websites** → Select `quantumcoresolutions.com`
   - Click **Manage** or **File Manager**
   - Or use **FTP Accounts** to create FTP credentials

2. **Get FTP Credentials:**
   - Go to **FTP Accounts** in hPanel
   - Create a new FTP account (or use existing)
   - Note: FTP host, username, password, and port

### Step 2: Build Your Site

```bash
# Build the site locally
npm run build
```

### Step 3: Upload via FTP/SFTP

**Using FileZilla (or similar FTP client):**

1. **Connect to Hostinger:**
   - Host: `ftp.yourdomain.com` or IP provided by Hostinger
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Navigate to public_html:**
   - Connect and navigate to `public_html/` directory
   - This is where your website files should be

3. **Backup Current Site (Important!):**
   - Download current `public_html/` contents as backup
   - Or rename `public_html` to `public_html_backup`

4. **Upload Build Files:**
   - Upload **all contents** of your `build/` directory
   - Upload to `public_html/`
   - Make sure `.htaccess` is uploaded

5. **Set Permissions:**
   - Files: 644
   - Directories: 755
   - `.htaccess`: 644

### Step 4: Configure .htaccess

1. **Upload `.htaccess`:**
   - Copy `.htaccess.example` from your project
   - Upload to `public_html/.htaccess`

2. **Or create manually in File Manager:**
   - Go to File Manager in hPanel
   - Navigate to `public_html/`
   - Create new file: `.htaccess`
   - Paste content from `.htaccess.example`

## Option 2: Create Staging Subdomain

For testing before replacing production:

### Step 1: Create Subdomain in Hostinger

1. **In hPanel:**
   - Go to **Domains** → **Subdomains**
   - Create subdomain: `staging.quantumcoresolutions.com` or `qa.quantumcoresolutions.com`
   - Document root: `public_html/staging` (or similar)

### Step 2: Deploy to Subdomain

1. **Build your site:**
   ```bash
   npm run build
   ```

2. **Upload to subdomain directory:**
   - Connect via FTP
   - Navigate to subdomain directory (e.g., `public_html/staging/`)
   - Upload all `build/` contents

3. **Test:**
   - Visit `https://staging.quantumcoresolutions.com`
   - Test all functionality

### Step 3: Deploy to Production

Once staging is tested:
1. Upload `build/` contents to `public_html/`
2. This replaces the Website Builder site

## Option 3: Enable Git on Hostinger (If Available)

Some Hostinger plans support Git. To check:

1. **Look for Git option:**
   - In hPanel, check **Advanced** section
   - Look for **Git** or **Version Control**
   - May require upgrading to VPS or Business plan

2. **If Git is available:**
   - Follow `HOSTINGER_SETUP.md` for Git deployment
   - Connect your repository
   - Set up auto-deployment

## Recommended Approach

### For QA/Staging Testing:

1. **Create subdomain:**
   - `staging.quantumcoresolutions.com` or `qa.quantumcoresolutions.com`
   - Deploy there first for testing

2. **Deploy via FTP:**
   - Build locally: `npm run build`
   - Upload via FTP to subdomain directory
   - Test thoroughly

### For Production:

1. **Backup current site:**
   - Download all files from `public_html/`
   - Keep as backup

2. **Deploy new site:**
   - Upload `build/` contents to `public_html/`
   - Upload `.htaccess`
   - Test immediately

3. **Rollback if needed:**
   - Restore backup files

## FTP Upload Script

Create a simple script to automate uploads:

```bash
#!/bin/bash
# deploy-ftp.sh

FTP_HOST="ftp.yourdomain.com"
FTP_USER="your-ftp-username"
FTP_PASS="your-ftp-password"
FTP_DIR="public_html"

# Build first
npm run build

# Upload using lftp (install: brew install lftp on Mac)
lftp -c "
open -u $FTP_USER,$FTP_PASS $FTP_HOST
cd $FTP_DIR
mirror -R build/ .
bye
"
```

Or use `rsync` over SSH if SFTP is enabled.

## Environment Variables for Studio

Since you're using FTP, environment variables need to be set differently:

### Option A: Build with Environment Variables

1. **Create `.env.production`:**
   ```env
   VITE_STUDIO_EMAIL=admin@quantumcoresolutions.com
   VITE_STUDIO_PASSWORD=your-password
   NODE_ENV=production
   ```

2. **Build with production env:**
   ```bash
   npm run build
   ```
   Variables are baked into the build.

### Option B: Use Hostinger Environment Variables (If Available)

1. **In hPanel:**
   - Check **Advanced** → **Environment Variables**
   - Add variables if available
   - Note: Vite variables need to be set at build time

## Important Notes

- **Website Builder Conflict:** Your current site uses Website Builder. Replacing it will remove the builder site.
- **Backup First:** Always backup before replacing production.
- **Studio Authentication:** Since it's static, Studio auth uses environment variables baked into the build.
- **No Server-Side Git:** Studio's Git operations won't work on static hosting. You'll need to commit locally and redeploy.

## Troubleshooting

**Can't find public_html:**
- Check File Manager in hPanel
- Look for `domains/yourdomain.com/public_html/`
- Or check FTP root directory

**Site shows 404:**
- Verify `.htaccess` is uploaded
- Check file permissions
- Ensure `index.html` is in root

**Studio not working:**
- Environment variables must be set before build
- Rebuild with correct variables
- Redeploy

## Next Steps

1. **Create staging subdomain** (recommended)
2. **Get FTP credentials** from Hostinger
3. **Test deployment** to staging
4. **Deploy to production** when ready

