# Hostinger Quick Start Guide

## Your Situation

- ✅ Site created with Hostinger Website Builder
- ❌ Git deployment not available in your plan
- ✅ Need to deploy SvelteKit site

## Recommended Solution: Staging Subdomain + FTP

### Step 1: Create Staging Subdomain

1. **In Hostinger hPanel:**
   - Go to **Domains** → **Subdomains**
   - Click **Create Subdomain**
   - Subdomain: `staging` (or `qa`)
   - Full URL: `staging.quantumcoresolutions.com`
   - Document root: `public_html/staging` (auto-created)
   - Click **Create**

2. **Wait for DNS propagation** (usually 5-15 minutes)

### Step 2: Get FTP Credentials

1. **In hPanel:**
   - Go to **FTP Accounts**
   - If you don't have one, click **Create FTP Account**
   - Username: (create or use existing)
   - Password: (set a strong password)
   - Directory: `public_html` (or `public_html/staging` for staging)
   - Note down: **FTP Host**, **Username**, **Password**

### Step 3: Build Your Site

```bash
# In your project directory
npm run build
```

This creates a `build/` directory with all static files.

### Step 4: Upload to Staging

**Option A: Using FileZilla (Easiest)**

1. **Download FileZilla:** https://filezilla-project.org/

2. **Connect:**
   - Host: `ftp.yourdomain.com` (or IP from Hostinger)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. **Navigate:**
   - Right side: Go to `public_html/staging/` (or your staging directory)

4. **Upload:**
   - Left side: Navigate to your project's `build/` folder
   - Select ALL files and folders in `build/`
   - Drag and drop to `public_html/staging/`
   - Wait for upload to complete

5. **Upload .htaccess:**
   - Copy `.htaccess.example` from project root
   - Rename to `.htaccess`
   - Upload to `public_html/staging/`

**Option B: Using Hostinger File Manager**

1. **In hPanel:**
   - Go to **Files** → **File Manager**
   - Navigate to `public_html/staging/`

2. **Upload:**
   - Click **Upload**
   - Select all files from `build/` directory
   - Upload

3. **Create .htaccess:**
   - Click **New File**
   - Name: `.htaccess`
   - Paste content from `.htaccess.example`

### Step 5: Test Staging

1. **Visit:** `https://staging.quantumcoresolutions.com`
2. **Test:**
   - All pages load
   - Images display
   - Navigation works
   - Studio at `/studio` (note: auth won't work without env vars - see below)

### Step 6: Configure Environment Variables

**Important:** For Studio authentication, you need to build with environment variables.

1. **Create `.env.production`:**
   ```env
   VITE_STUDIO_EMAIL=admin@quantumcoresolutions.com
   VITE_STUDIO_PASSWORD=your-secure-password
   NODE_ENV=production
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Redeploy:**
   - Upload new `build/` contents

### Step 7: Deploy to Production

Once staging is tested and working:

1. **Backup current Website Builder site:**
   - In File Manager, download `public_html/` contents
   - Save as backup

2. **Upload to production:**
   - Upload `build/` contents to `public_html/`
   - Upload `.htaccess`
   - This replaces your Website Builder site

3. **Test production:**
   - Visit `https://quantumcoresolutions.com`
   - Verify everything works

## Alternative: Use Script

If you have `lftp` installed:

1. **Edit `scripts/deploy-ftp.sh`:**
   - Update FTP credentials
   - Update FTP directory paths

2. **Run:**
   ```bash
   ./scripts/deploy-ftp.sh staging  # For staging
   ./scripts/deploy-ftp.sh production  # For production
   ```

## Important Notes

### About Website Builder

- **Replacing:** Uploading to `public_html/` will replace your Website Builder site
- **Backup:** Always backup first
- **Can't use both:** You can't use Website Builder and custom code on same domain

### About Studio CMS

- **Git Operations:** Won't work on static hosting (no server-side Git)
- **Workflow:** Edit locally → Build → Deploy
- **Authentication:** Uses environment variables baked into build

### About Subdomains

- **Staging:** Use `staging.quantumcoresolutions.com` for testing
- **Production:** Use main domain `quantumcoresolutions.com`
- **No extra cost:** Subdomains are free

## Troubleshooting

**Can't find subdomain option:**
- Check if you're on the right hosting plan
- Contact Hostinger support

**FTP connection fails:**
- Check credentials
- Try SFTP (port 22) instead of FTP (port 21)
- Check firewall settings

**Site shows 404:**
- Verify `.htaccess` is uploaded
- Check file permissions (644 for files, 755 for directories)
- Ensure `index.html` exists

**Studio not accessible:**
- Rebuild with environment variables
- Check browser console for errors
- Verify routes are included in build

## Next Steps

1. ✅ Create staging subdomain
2. ✅ Get FTP credentials
3. ✅ Build site: `npm run build`
4. ✅ Upload to staging via FTP
5. ✅ Test staging site
6. ✅ Deploy to production when ready

## Need Help?

- **Hostinger Support:** https://www.hostinger.com/contact
- **FileZilla Guide:** https://filezilla-project.org/documentation
- **Check build output:** `npm run preview` to test locally first

