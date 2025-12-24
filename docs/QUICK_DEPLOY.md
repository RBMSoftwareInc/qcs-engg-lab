# Quick Deployment Guide

## For QA/Staging Testing

### Option 1: Git Deployment (Recommended)

1. **Push to staging branch:**
   ```bash
   git checkout -b staging  # if branch doesn't exist
   git push origin staging
   ```

2. **Configure Hostinger Git:**
   - Go to Hostinger hPanel → Git
   - Connect your repository
   - Set branch to `staging`
   - Set deployment path (usually `public_html/`)

3. **Set Environment Variables in Hostinger:**
   - `VITE_STUDIO_EMAIL` = your staging email
   - `VITE_STUDIO_PASSWORD` = your staging password
   - `NODE_ENV` = `staging`

### Option 2: Manual Build & Upload

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload to Hostinger:**
   - Upload entire `build/` folder contents to `public_html/`
   - Copy `.htaccess.example` to `public_html/.htaccess`

3. **Test:**
   - Visit your QA URL
   - Test `/studio` login

## For Production

1. **Use deployment script:**
   ```bash
   ./scripts/deploy-prod.sh
   ```

2. **Or manually:**
   ```bash
   git checkout main
   npm run build
   # Upload build/ to Hostinger
   ```

## Important Notes

- ✅ Build output is in `build/` directory
- ✅ Copy `.htaccess.example` to `public_html/.htaccess`
- ✅ Set environment variables in Hostinger hPanel
- ✅ Studio is at `/studio` route
- ✅ All content is static (no server needed after build)

## Troubleshooting

**Site shows 404:**
- Check `.htaccess` is in place
- Verify all files uploaded correctly

**Studio not working:**
- Check environment variables are set
- Verify credentials match `.env` values

**Build fails:**
- Run `npm install` first
- Check Node.js version (18+)
