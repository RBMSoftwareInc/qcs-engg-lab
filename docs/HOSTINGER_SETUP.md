# Hostinger Deployment Setup

## Quick Start for QA/Staging

### Step 1: Prepare Your Code

1. **Ensure you're on the right branch:**
   ```bash
   git checkout -b staging  # Create staging branch if needed
   # Or use existing branch
   ```

2. **Test build locally:**
   ```bash
   npm install
   npm run build
   npm run preview  # Test the build
   ```

### Step 2: Configure Hostinger

#### Option A: Git Deployment (Recommended)

1. **In Hostinger hPanel:**
   - Go to **Advanced** → **Git**
   - Click **Create Repository**
   - Enter your Git repository URL
   - Set branch: `staging` (for QA) or `main` (for production)
   - Set deployment path: `public_html/` (or your domain root)

2. **Set up auto-deployment:**
   - Hostinger will auto-pull and build on push
   - Or set up a webhook for manual trigger

3. **Configure build command in Hostinger:**
   - Build command: `npm install && npm run build`
   - Output directory: `build/`
   - Copy `build/*` to `public_html/`

#### Option B: Manual Upload

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload via FTP/SFTP:**
   - Connect to Hostinger via FileZilla or similar
   - Upload **all contents** of `build/` folder to `public_html/`
   - Make sure `.htaccess` is uploaded

3. **Or use Hostinger File Manager:**
   - Go to **Files** → **File Manager**
   - Navigate to `public_html/`
   - Upload `build/` contents

### Step 3: Configure Environment Variables

**In Hostinger hPanel:**

1. Go to **Advanced** → **Environment Variables**
2. Add these variables:

   **For QA/Staging:**
   ```
   VITE_STUDIO_EMAIL=your-staging-email@example.com
   VITE_STUDIO_PASSWORD=your-staging-password
   NODE_ENV=staging
   ```

   **For Production:**
   ```
   VITE_STUDIO_EMAIL=admin@quantumcoresolutions.com
   VITE_STUDIO_PASSWORD=your-secure-password
   NODE_ENV=production
   ```

### Step 4: Configure .htaccess

1. **Copy `.htaccess.example` to `public_html/.htaccess`**
   - This enables SPA routing
   - Handles client-side navigation

2. **Or create manually:**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^(.*)$ /index.html [L]
   </IfModule>
   ```

### Step 5: Test Deployment

1. **Visit your site:**
   - QA: `https://qa.yourdomain.com` or `https://staging.yourdomain.com`
   - Production: `https://quantumcoresolutions.com`

2. **Test Studio:**
   - Go to `/studio`
   - Login with credentials from environment variables
   - Test content editing

3. **Verify:**
   - All pages load correctly
   - Images display properly
   - Studio authentication works
   - Git operations work (if using Git deployment)

## Production Deployment

### Pre-Deployment Checklist

- [ ] All changes tested in QA
- [ ] Build tested locally
- [ ] Environment variables configured
- [ ] `.htaccess` in place
- [ ] Backup current production site

### Deploy to Production

1. **Use deployment script:**
   ```bash
   ./scripts/deploy-prod.sh
   ```

2. **Or manually:**
   ```bash
   git checkout main
   git pull origin main
   npm run build
   # Upload build/ to Hostinger public_html/
   ```

## Hostinger-Specific Notes

### Static Site Hosting

- ✅ No Node.js server needed after build
- ✅ All files are static HTML/CSS/JS
- ✅ Upload `build/` contents to `public_html/`
- ✅ `.htaccess` handles routing

### Git Deployment on Hostinger

If using Git deployment:

1. **SSH Access:**
   ```bash
   ssh username@your-server.hostinger.com
   ```

2. **Navigate to site:**
   ```bash
   cd ~/domains/yourdomain.com/public_html
   ```

3. **Pull updates:**
   ```bash
   git pull origin staging  # or main
   npm install --production
   npm run build
   ```

4. **Auto-deploy hook** (optional):
   Create `.git/hooks/post-receive`:
   ```bash
   #!/bin/bash
   cd /path/to/public_html
   git pull origin main
   npm install --production
   npm run build
   ```

## Troubleshooting

### Build Fails on Hostinger

- **Check Node.js version:**
  - Hostinger should have Node.js 18+
  - Check: `node --version`

- **Clear cache:**
  ```bash
  rm -rf node_modules .svelte-kit
  npm install
  npm run build
  ```

### Site Shows 404

- **Check `.htaccess`:**
  - Must be in `public_html/`
  - Must have rewrite rules

- **Check file permissions:**
  ```bash
  chmod 644 .htaccess
  chmod 755 public_html/
  ```

### Studio Not Working

- **Check environment variables:**
  - Must be set in Hostinger hPanel
  - Names must match exactly: `VITE_STUDIO_EMAIL`, `VITE_STUDIO_PASSWORD`

- **Check build:**
  - Studio routes must be prerendered
  - Check `build/studio/` directory exists

### Images Not Loading

- **Check paths:**
  - Images should be in `build/_app/immutable/assets/`
  - Or in `build/assets/` if using static assets

- **Check `.htaccess`:**
  - Should allow image files
  - Check MIME types

## Support

- **Hostinger Support:** https://www.hostinger.com/contact
- **Hostinger Docs:** https://support.hostinger.com/
- **SvelteKit Docs:** https://kit.svelte.dev/docs/adapter-static

