# Deploy Studio Now - Simple Steps

## 🚀 Deploy to Vercel (5 Minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to: **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your **QCS-Engg-Lab** repository
4. Click **"Deploy"** (Vercel auto-detects SvelteKit)

### Step 3: Add Environment Variables

After first deploy:

1. Go to **Project Settings** → **Environment Variables**
2. Add these (for Production, Preview, Development):

```
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
VITE_STUDIO_EMAIL=admin@example.com
VITE_STUDIO_PASSWORD=your_secure_password
```

3. Click **"Save"**
4. Go to **Deployments** → Click **"..."** → **"Redeploy"**

### Step 4: Access Studio

Visit: `https://your-project.vercel.app/studio/login`

**That's it!** Studio is now live and connected to your GitHub repo.

---

## ✅ How It Works

1. **Edit in Studio** → Changes saved
2. **Studio commits to GitHub** → Via GitHub REST API
3. **See changes in Git** → `git pull origin main`
4. **Auto-deploy** (optional) → Vercel rebuilds on Git push

---

## 📚 More Details

- **Quick Guide**: [docs/QUICK_DEPLOY_GUIDE.md](./docs/QUICK_DEPLOY_GUIDE.md)
- **Complete Guide**: [docs/DEPLOY_STUDIO.md](./docs/DEPLOY_STUDIO.md)
- **Environment Setup**: [docs/ENV_SETUP.md](./docs/ENV_SETUP.md)

---

**Need help?** Check the troubleshooting section in [docs/DEPLOY_STUDIO.md](./docs/DEPLOY_STUDIO.md)
