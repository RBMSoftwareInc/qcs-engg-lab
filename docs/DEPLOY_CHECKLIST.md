# Deployment Checklist

## ✅ Pre-Deployment

- [x] Build tested locally (`npm run build`)
- [x] Static adapter configured
- [x] Prerendering enabled for public routes
- [x] Studio routes excluded from prerendering (correct - they need auth)
- [x] `.htaccess` template created
- [x] Environment variables documented

## 🚀 QA/Staging Deployment Steps

1. **Create staging branch:**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Build locally (optional, for testing):**
   ```bash
   npm run build
   npm run preview  # Test locally
   ```

3. **Configure Hostinger:**
   - Go to hPanel → Git
   - Connect repository
   - Set branch: `staging`
   - Set deployment path: `public_html/` or your domain root

4. **Set Environment Variables in Hostinger:**
   - `VITE_STUDIO_EMAIL` = your staging email
   - `VITE_STUDIO_PASSWORD` = your staging password
   - `NODE_ENV` = `staging`

5. **Upload `.htaccess`:**
   - Copy `.htaccess.example` to `public_html/.htaccess`
   - Or let Hostinger Git deployment handle it

6. **Test:**
   - Visit staging URL
   - Test all pages
   - Test `/studio` login
   - Verify images load

## 🎯 Production Deployment Steps

1. **Final QA sign-off:**
   - [ ] All features tested in staging
   - [ ] No console errors
   - [ ] All pages load correctly
   - [ ] Studio works correctly

2. **Deploy:**
   ```bash
   ./scripts/deploy-prod.sh
   ```
   Or manually:
   ```bash
   git checkout main
   npm run build
   # Upload build/ to Hostinger
   ```

3. **Configure Production Environment:**
   - Set production environment variables
   - Update `.htaccess` if needed
   - Enable HTTPS redirect

4. **Post-Deployment:**
   - [ ] Verify site loads
   - [ ] Test critical paths
   - [ ] Monitor for errors
   - [ ] Test Studio access

## 📝 Important Notes

- **Build Output:** All files in `build/` directory
- **Studio Routes:** Not prerendered (requires auth - correct behavior)
- **Static Assets:** Automatically included in build
- **Environment Variables:** Must be set in Hostinger hPanel
- **.htaccess:** Required for SPA routing

## 🔧 Troubleshooting

**Build fails:**
- Clear `.svelte-kit` and `node_modules`
- Run `npm install` fresh
- Check Node.js version (18+)

**Site shows 404:**
- Verify `.htaccess` is in place
- Check file permissions

**Studio not accessible:**
- Check environment variables
- Verify credentials match
- Check build includes Studio routes (they're dynamic, so they'll be client-side)

