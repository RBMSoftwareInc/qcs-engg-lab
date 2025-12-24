# Fixing Studio 404 Error on Hostinger

## Problem

- ✅ Main site works: `https://mistyrose-squirrel-450573.hostingersite.com/`
- ❌ Studio 404: `https://mistyrose-squirrel-450573.hostingersite.com/studio`

## Root Cause

Studio routes are **not prerendered** (correct - they need authentication), so they rely on client-side routing. The `.htaccess` file needs to properly handle SPA routing.

## Solution

### Step 1: Ensure .htaccess is Uploaded

The `.htaccess` file must be in your `build/` directory and uploaded to Hostinger's `public_html/`.

1. **Check if `.htaccess` exists in build:**
   ```bash
   ls -la build/.htaccess
   ```

2. **If not, copy it:**
   ```bash
   cp .htaccess.example build/.htaccess
   # Or use the .htaccess file from project root
   ```

3. **Rebuild:**
   ```bash
   npm run build
   ```

4. **Verify `.htaccess` is in build:**
   ```bash
   ls -la build/.htaccess
   ```

### Step 2: Upload .htaccess to Hostinger

**Option A: Via File Manager**
1. Go to Hostinger hPanel → Files → File Manager
2. Navigate to `public_html/`
3. Upload `.htaccess` from `build/` directory
4. Make sure it's named exactly `.htaccess` (with the dot)

**Option B: Via FTP**
1. Connect via FileZilla
2. Navigate to `public_html/`
3. Upload `build/.htaccess`
4. Set permissions: 644

**Option C: Via Git Deployment**
- If using Git deployment, `.htaccess` should be included in the build
- Hostinger will copy it automatically

### Step 3: Verify .htaccess Content

The `.htaccess` should contain:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

This tells Apache to serve `index.html` for all routes that don't match actual files, enabling client-side routing.

### Step 4: Test

1. **Clear browser cache** (important!)
2. Visit: `https://mistyrose-squirrel-450573.hostingersite.com/studio`
3. Should load the Studio login page

## Alternative: Check Build Output

If `.htaccess` is correct but still not working:

1. **Check if Studio routes are in the build:**
   ```bash
   find build -name "*studio*" -type f
   ```

2. **Studio routes are client-side only** (not prerendered), so they won't appear as separate files
3. **They're handled by the SvelteKit router** in `index.html`

## Verification Checklist

- [ ] `.htaccess` exists in `build/` directory
- [ ] `.htaccess` is uploaded to `public_html/` on Hostinger
- [ ] `.htaccess` has correct rewrite rules
- [ ] File permissions are correct (644)
- [ ] Browser cache cleared
- [ ] Tried in incognito/private window

## If Still Not Working

1. **Check Hostinger error logs:**
   - hPanel → Advanced → Error Logs
   - Look for 404 errors on `/studio`

2. **Verify mod_rewrite is enabled:**
   - Contact Hostinger support to ensure Apache mod_rewrite is enabled

3. **Test with direct file access:**
   - Visit: `https://mistyrose-squirrel-450573.hostingersite.com/index.html`
   - Then navigate to `/studio` - should work via client-side routing

4. **Check browser console:**
   - Open DevTools → Console
   - Look for JavaScript errors
   - Check Network tab for failed requests

## Quick Fix Command

If you have SSH access:

```bash
# SSH into Hostinger
ssh username@your-server

# Navigate to public_html
cd ~/domains/yourdomain.com/public_html

# Create/update .htaccess
cat > .htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
EOF

# Set permissions
chmod 644 .htaccess
```

