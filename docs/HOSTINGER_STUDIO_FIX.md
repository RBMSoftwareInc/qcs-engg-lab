# Fix Studio 404 on Hostinger

## ✅ Solution: Ensure .htaccess is Deployed

The Studio routes are client-side only (not prerendered), so they need `.htaccess` for SPA routing.

### Quick Fix

1. **Rebuild with updated .htaccess:**
   ```bash
   npm run build
   ```

2. **Verify .htaccess is in build:**
   ```bash
   ls -la build/.htaccess
   ```

3. **Redeploy via Hostinger:**
   - Go to Hostinger Deployments
   - Click **"Save and redeploy"**
   - Wait for deployment to complete

4. **Test:**
   - Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
   - Visit: `https://mistyrose-squirrel-450573.hostingersite.com/studio`
   - Should load Studio login page

### What Changed

The `.htaccess` file now includes:
- ✅ SPA routing rules (serves index.html for all routes)
- ✅ Security headers
- ✅ Compression
- ✅ Browser caching

### If Still Not Working

**Option 1: Manual Upload**
1. Download `build/.htaccess` from your local build
2. Go to Hostinger File Manager
3. Navigate to `public_html/`
4. Upload `.htaccess`
5. Set permissions: 644

**Option 2: Check Build Output**
```bash
# Verify .htaccess is included
ls -la build/.htaccess

# Check if index.html exists
ls -la build/index.html
```

**Option 3: Test Direct Access**
1. Visit: `https://mistyrose-squirrel-450573.hostingersite.com/index.html`
2. Then navigate to `/studio` in the same page
3. If this works, it confirms `.htaccess` is the issue

### Verification

After redeploying, the `.htaccess` should:
- ✅ Exist in `public_html/` on Hostinger
- ✅ Have rewrite rules for SPA routing
- ✅ Have correct permissions (644)

The Studio route will work once `.htaccess` is properly deployed!
