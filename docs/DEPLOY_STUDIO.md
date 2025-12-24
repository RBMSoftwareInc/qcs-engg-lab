# Deploy Studio & Access via Git - Complete Guide

This guide shows you how to deploy Studio (which requires Node.js) and access it via Git.

## ⚠️ Important: Studio Requires Node.js

Studio uses server-side API routes that require a Node.js runtime. It **cannot run on static hosting** (like Hostinger shared hosting).

## 🎯 Deployment Options

### Option 1: Vercel (Recommended - Easiest & Free)

**Best for:** Quick deployment with automatic Git integration

#### Setup Steps

1. **Prepare Your Repository**
   ```bash
   # Ensure all code is committed and pushed to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects SvelteKit

3. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all required variables:
     ```
     GITHUB_TOKEN=ghp_your_token_here
     GITHUB_OWNER=your-username
     GITHUB_REPO=your-repo-name
     GITHUB_BRANCH=main
     VITE_STUDIO_EMAIL=admin@example.com
     VITE_STUDIO_PASSWORD=your_secure_password
     FIGMA_TOKEN=your_figma_token (optional)
     ```
   - Set for: Production, Preview, Development

4. **Deploy**
   - Vercel automatically builds and deploys
   - Your Studio will be live at: `https://your-project.vercel.app/studio`

5. **Access Studio**
   - Visit: `https://your-project.vercel.app/studio/login`
   - Log in with your credentials
   - Studio will commit changes directly to your GitHub repo

**Benefits:**
- ✅ Free tier available
- ✅ Automatic deployments on Git push
- ✅ HTTPS included
- ✅ Easy environment variable management
- ✅ Works with your GitHub repo automatically

---

### Option 2: Railway (Free Tier Available)

**Best for:** Simple Node.js hosting with Git integration

#### Setup Steps

1. **Sign Up**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - Go to Variables tab
   - Add all required environment variables (same as Vercel)

4. **Deploy**
   - Railway auto-detects SvelteKit
   - Automatically builds and deploys
   - Get your URL: `https://your-project.up.railway.app`

5. **Access Studio**
   - Visit: `https://your-project.up.railway.app/studio/login`

**Benefits:**
- ✅ Free tier ($5 credit/month)
- ✅ Simple setup
- ✅ Auto-deploy from Git

---

### Option 3: Render (Free Tier Available)

**Best for:** Reliable Node.js hosting

#### Setup Steps

1. **Sign Up**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Build Settings**
   ```
   Build Command: npm install && npm run build
   Start Command: npm run preview
   ```

4. **Add Environment Variables**
   - Go to Environment tab
   - Add all required variables

5. **Deploy**
   - Render builds and deploys automatically
   - Get your URL: `https://your-project.onrender.com`

**Benefits:**
- ✅ Free tier available
- ✅ Auto-deploy from Git
- ✅ Simple configuration

---

### Option 4: Hostinger VPS (If You Have VPS)

**Best for:** Staying with Hostinger

#### Setup Steps

1. **SSH into Your VPS**
   ```bash
   ssh username@your-vps-ip
   ```

2. **Install Node.js**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Create .env File**
   ```bash
   nano .env
   # Add all environment variables
   ```

6. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

7. **Update svelte.config.js for Node.js**
   ```javascript
   import adapter from '@sveltejs/adapter-node';
   // ... rest of config
   ```

8. **Build and Start**
   ```bash
   npm run build
   pm2 start build/index.js --name studio
   pm2 save
   pm2 startup  # Follow instructions to auto-start on reboot
   ```

9. **Configure Nginx (Reverse Proxy)**
   ```nginx
   server {
       listen 80;
       server_name studio.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Access Studio**
    - Visit: `http://studio.yourdomain.com/studio/login`

---

## 🔧 Configuration for All Options

### Required Environment Variables

Set these in your hosting platform:

```bash
# GitHub API (Required)
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

# Studio Authentication (Required)
VITE_STUDIO_EMAIL=admin@example.com
VITE_STUDIO_PASSWORD=your_secure_password

# Figma API (Optional)
FIGMA_TOKEN=your_figma_token_here
```

### GitHub Token Setup

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "QCS Studio Production"
4. Scopes: Select `repo` (full control)
5. Generate and copy token
6. Add to your hosting platform's environment variables

---

## 🚀 Quick Start: Vercel (Recommended)

### Step-by-Step

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit: https://vercel.com/new
   - Import your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from above
   - Redeploy

4. **Access Studio**
   - Visit: `https://your-project.vercel.app/studio/login`
   - Log in and start managing content!

### Auto-Deploy from Git

Once connected to Vercel:
- Every `git push` automatically triggers a new deployment
- Studio stays in sync with your GitHub repo
- Changes you make in Studio are committed to Git
- Git pushes trigger new deployments (if configured)

---

## 🔄 Workflow: Studio → Git → Deploy

### Typical Workflow

1. **Edit Content in Studio**
   - Visit your deployed Studio URL
   - Log in
   - Edit content
   - Save/Publish

2. **Studio Commits to GitHub**
   - Studio uses GitHub REST API
   - Changes are committed directly to your repo
   - No manual Git commands needed

3. **Auto-Deploy (If Configured)**
   - Vercel/Railway/Render auto-deploy on Git push
   - Public site rebuilds with new content
   - Changes go live automatically

### Manual Deploy Workflow

If you prefer manual control:

1. **Edit in Studio** → Changes committed to GitHub
2. **Pull Changes Locally**
   ```bash
   git pull origin main
   ```
3. **Build Static Site**
   ```bash
   npm run build
   ```
4. **Deploy Build**
   - Upload `build/` directory to static hosting
   - Or use your preferred deployment method

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] Environment variables documented
- [ ] GitHub token created with `repo` scope
- [ ] `.env` file NOT committed (in `.gitignore`)
- [ ] Tested locally: `npm run build` succeeds
- [ ] Studio login works locally
- [ ] GitHub API operations work locally

---

## 🔐 Security Best Practices

1. **Never Commit Secrets**
   - `.env` is in `.gitignore` ✅
   - Use hosting platform's environment variables

2. **Use Strong Passwords**
   - Studio password should be strong
   - GitHub token should have minimal required scopes

3. **HTTPS Only**
   - All hosting platforms provide HTTPS
   - Never use HTTP for Studio

4. **Token Rotation**
   - Rotate GitHub tokens periodically
   - Update in hosting platform when rotated

---

## 🐛 Troubleshooting

### Studio Shows "Not Available" Error

**Problem:** Studio API routes return HTML instead of JSON

**Solution:**
- Studio requires Node.js runtime
- Deploy to Vercel/Railway/Render (not static hosting)
- Or use Hostinger VPS with Node.js

### Environment Variables Not Working

**Problem:** GitHub API errors, authentication fails

**Solution:**
- Verify variables are set in hosting platform
- Check variable names match exactly (case-sensitive)
- Restart/redeploy after adding variables
- Verify `.env` file is NOT used in production (use platform variables)

### GitHub API Rate Limit

**Problem:** "Rate limit exceeded" errors

**Solution:**
- Check [docs/GITHUB_RATE_LIMITS.md](./GITHUB_RATE_LIMITS.md)
- Wait for hourly reset
- Rate limiter is set to 4,000/hour (GitHub allows 5,000/hour)

### Changes Not Appearing

**Problem:** Edited content in Studio but public site doesn't update

**Solution:**
- Verify changes were committed to GitHub
- Check GitHub repository for commits
- If using auto-deploy, check deployment logs
- If manual deploy, rebuild and redeploy static site

---

## 📚 Additional Resources

- **Quick Start**: [docs/QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md)
- **Environment Setup**: [docs/ENV_SETUP.md](./ENV_SETUP.md)
- **GitHub Rate Limits**: [docs/GITHUB_RATE_LIMITS.md](./GITHUB_RATE_LIMITS.md)
- **Studio Features**: [docs/STUDIO_EXTENSION_SUMMARY.md](./STUDIO_EXTENSION_SUMMARY.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 Recommended Setup

**For Most Users:**
1. Deploy Studio to **Vercel** (free, easy, auto-deploy)
2. Keep public site on **Hostinger** (static hosting)
3. Studio commits to GitHub → Auto-deploys public site

**For Advanced Users:**
1. Deploy everything to **Vercel** (Studio + Public site)
2. Or use **Railway** for Studio, **Hostinger** for public site
3. Configure auto-deploy from Git

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Studio is accessible at deployed URL
- [ ] Can log in to Studio
- [ ] Can view content list
- [ ] Can edit content
- [ ] Changes are committed to GitHub
- [ ] Public site shows updated content
- [ ] Design skins work (if using)
- [ ] No console errors

---

**Need Help?** Check the troubleshooting section or review the detailed documentation in the `docs/` folder.
