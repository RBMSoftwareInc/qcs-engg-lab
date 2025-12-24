# Deploy to GitHub Pages - Quick Start

## 🚀 3 Steps to Deploy

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select: **GitHub Actions**
4. Save

### Step 2: Push the Workflow

The GitHub Actions workflow is already created. Just commit and push:

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### Step 3: Wait for Deployment

1. Go to **Actions** tab in your repository
2. Watch the "Deploy to GitHub Pages" workflow run
3. When complete, your site is live at:
   - `https://yourusername.github.io/repo-name`

**That's it!** Every push to `main` will auto-deploy.

---

## ⚠️ Important: Studio Won't Work

GitHub Pages is **static-only** - it can't run Node.js.

- ✅ **Public Website** → Works perfectly
- ❌ **Studio (CMS)** → Needs Node.js, won't work

### Options for Studio:

1. **Deploy Studio to Vercel** (Recommended)
   - See: [docs/QUICK_DEPLOY_GUIDE.md](./docs/QUICK_DEPLOY_GUIDE.md)
   - Studio URL: `https://studio.yourdomain.com`
   - Public site: `https://yourusername.github.io/repo-name`

2. **Run Studio locally**
   - `npm run dev` → `http://localhost:5173/studio`
   - Edit content → Commits to GitHub → Pages auto-deploys

---

## 📚 More Details

- **Complete Guide**: [docs/GITHUB_PAGES_DEPLOY.md](./docs/GITHUB_PAGES_DEPLOY.md)
- **Studio Deployment**: [docs/DEPLOY_STUDIO.md](./docs/DEPLOY_STUDIO.md)

---

**Need help?** Check the troubleshooting section in the complete guide.
