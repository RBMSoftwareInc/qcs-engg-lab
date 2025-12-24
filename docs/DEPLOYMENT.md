# Deployment Guide for Hostinger

This guide covers deploying QCS Engineering Lab to Hostinger QA/Staging and Production environments.

## Prerequisites

- Git repository configured and pushed
- Hostinger hosting account with Node.js support
- SSH access to Hostinger server (for Git deployments)
- Environment variables configured

## Build Configuration

The site uses `@sveltejs/adapter-static` for static site generation. All pages are pre-rendered at build time.

## Deployment Methods

### Method 1: Git-Based Deployment (Recommended)

Hostinger supports Git-based deployments. This is the cleanest approach.

#### Setup Steps

1. **Configure Git Repository on Hostinger**
   - Log into Hostinger hPanel
   - Navigate to "Git" section
   - Add your repository URL
   - Set branch (e.g., `main` for production, `staging` for QA)
   - Configure deployment path

2. **Create Deployment Scripts**

   Create a `.hostinger` directory in your repo with deployment hooks:

   ```bash
   # .hostinger/post-receive (on server)
   #!/bin/bash
   cd /path/to/your/site
   git pull origin main
   npm install --production
   npm run build
   # Copy build output to public_html or appropriate directory
   ```

3. **Environment Variables**

   Set environment variables in Hostinger hPanel:
   - `VITE_STUDIO_EMAIL` - Studio admin email
   - `VITE_STUDIO_PASSWORD` - Studio admin password
   - `NODE_ENV` - `production` or `staging`

### Method 2: Manual Build & Upload

For QA/Staging testing, you can build locally and upload.

#### Steps

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Upload Build Output**
   - Build output is in `build/` directory
   - Upload entire `build/` contents to Hostinger `public_html/`
   - Use FTP/SFTP client or Hostinger File Manager

3. **Configure .htaccess** (if needed)
   - Create `.htaccess` in `public_html/` for SPA routing
   - See `.htaccess.example` in this repo

### Method 3: CI/CD Pipeline (Advanced)

Set up automated deployments using GitHub Actions or similar.

## Environment-Specific Configuration

### QA/Staging Environment

1. **Branch**: `staging` or `qa`
2. **URL**: `https://qa.yourdomain.com` or `https://staging.yourdomain.com`
3. **Environment Variables**:
   ```env
   NODE_ENV=staging
   VITE_STUDIO_EMAIL=staging-admin@example.com
   VITE_STUDIO_PASSWORD=staging-password
   ```

### Production Environment

1. **Branch**: `main` or `production`
2. **URL**: `https://quantumcoresolutions.com`
3. **Environment Variables**:
   ```env
   NODE_ENV=production
   VITE_STUDIO_EMAIL=admin@quantumcoresolutions.com
   VITE_STUDIO_PASSWORD=secure-production-password
   ```

## Build Commands

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Build Locally
```bash
npm run preview
```

## Deployment Checklist

### Pre-Deployment

- [ ] All changes committed and pushed to Git
- [ ] Environment variables configured in Hostinger
- [ ] Build tested locally (`npm run build && npm run preview`)
- [ ] No console errors or warnings
- [ ] All routes accessible
- [ ] Studio authentication working

### QA/Staging Deployment

- [ ] Deploy to staging branch
- [ ] Verify site loads correctly
- [ ] Test all major features
- [ ] Test Studio CMS functionality
- [ ] Verify Git operations work (if using Git deployment)
- [ ] Check environment variables are set
- [ ] Test authentication

### Production Deployment

- [ ] Final QA sign-off
- [ ] Backup current production site
- [ ] Deploy to production branch
- [ ] Verify site loads
- [ ] Monitor for errors
- [ ] Test critical paths
- [ ] Verify Studio access
- [ ] Update DNS if needed

## Hostinger-Specific Notes

### Static Site Hosting

If using static hosting:
1. Build output goes to `public_html/`
2. Ensure `.htaccess` handles SPA routing
3. All static assets in `build/` directory

### Node.js Hosting

If using Node.js hosting:
1. Set `NODE_ENV=production`
2. Install dependencies: `npm install --production`
3. Build: `npm run build`
4. Serve from `build/` directory

### Git Deployment on Hostinger

1. **SSH into Hostinger**
   ```bash
   ssh username@your-server.hostinger.com
   ```

2. **Clone Repository** (first time)
   ```bash
   cd ~/domains/yourdomain.com/public_html
   git clone your-repo-url .
   ```

3. **Pull Updates**
   ```bash
   git pull origin main
   npm install --production
   npm run build
   ```

4. **Set Up Auto-Deploy Hook** (optional)
   - Create post-receive hook in `.git/hooks/`
   - Make it executable: `chmod +x .git/hooks/post-receive`

## Troubleshooting

### Build Fails

- Check Node.js version (should be 18+)
- Clear `.svelte-kit` and `node_modules`
- Run `npm install` fresh
- Check for TypeScript errors: `npm run check`

### Site Not Loading

- Verify build output exists
- Check `.htaccess` configuration
- Verify file permissions
- Check Hostinger error logs

### Studio Not Accessible

- Verify environment variables are set
- Check authentication credentials
- Verify `/studio` route is not blocked
- Check server-side rendering is disabled (if using static adapter)

### Git Operations Fail

- Verify SSH keys are configured
- Check Git credentials
- Verify repository permissions
- Check Hostinger Git settings

## Rollback Procedure

If deployment fails:

1. **Git Rollback**
   ```bash
   git log  # Find previous working commit
   git checkout <previous-commit-hash>
   git push --force origin main
   ```

2. **Manual Rollback**
   - Restore from backup
   - Or manually upload previous build

## Security Checklist

- [ ] Environment variables not in Git
- [ ] `.env` in `.gitignore`
- [ ] Studio credentials are strong
- [ ] HTTPS enabled
- [ ] Git credentials secure
- [ ] SSH keys properly configured

## Support

For Hostinger-specific issues:
- Hostinger Support: https://www.hostinger.com/contact
- Hostinger Documentation: https://support.hostinger.com/

For deployment issues:
- Check build logs
- Review Hostinger error logs
- Verify Git repository access
- Test locally first

