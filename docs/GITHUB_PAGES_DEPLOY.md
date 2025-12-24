# Deploy to GitHub Pages - Complete Guide

This guide shows you how to deploy your **public website** to GitHub Pages. 

## ⚠️ Important: Studio Won't Work on GitHub Pages

**GitHub Pages only supports static hosting** - it cannot run Node.js or server-side code.

- ✅ **Public Website** → Works perfectly on GitHub Pages
- ❌ **Studio (CMS)** → Requires Node.js, won't work on GitHub Pages

### Options for Studio

1. **Deploy Studio separately to Vercel** (Recommended)
   - Studio on Vercel: `https://studio.yourdomain.com`
   - Public site on GitHub Pages: `https://yourusername.github.io/repo-name`
   - Studio commits to GitHub → GitHub Pages auto-deploys

2. **Run Studio locally**
   - Use Studio on `localhost:5173/studio` for content management
   - Changes commit to GitHub → GitHub Pages auto-deploys

3. **Use GitHub Actions to deploy Studio elsewhere**
   - Keep Studio on Vercel/Railway
   - Public site on GitHub Pages

---

## 🚀 Deploy Public Site to GitHub Pages

### Method 1: Automatic Deployment (Recommended)

#### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: `GitHub Actions`
4. Save

#### Step 2: Push the Workflow

The GitHub Actions workflow is already created at `.github/workflows/deploy-pages.yml`. Just push it:

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

#### Step 3: Watch It Deploy

1. Go to **Actions** tab in your repository
2. You'll see "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (2-3 minutes)
4. Your site will be live at: `https://yourusername.github.io/repo-name`

**That's it!** Every push to `main` will automatically deploy to GitHub Pages.

---

### Method 2: Manual Deployment

If you prefer manual control:

#### Step 1: Build Locally

```bash
npm run build
```

#### Step 2: Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select:
   - **Branch**: `gh-pages` (or `main` with `/build` folder)
   - **Folder**: `/build` (or root if using `gh-pages` branch)

#### Step 3: Push Build to GitHub

**Option A: Push to `gh-pages` branch**

```bash
# Create and switch to gh-pages branch
git checkout -b gh-pages

# Remove everything except build folder
rm -rf .github src static content design assets
rm -f .gitignore .npmrc package.json package-lock.json svelte.config.js tsconfig.json vite.config.ts

# Move build contents to root
mv build/* .
rmdir build

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
```

**Option B: Use GitHub Actions** (Easier - see Method 1)

---

## 🔧 Configuration

### Base Path (If Using Custom Domain)

If you're using a custom domain or deploying to a subdirectory, update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		// If deploying to subdirectory, uncomment:
		// paths: {
		//   base: '/repo-name'
		// },
		prerender: {
			handleHttpError: 'warn',
			handleUnseenRoutes: 'warn',
			entries: ['*']
		}
	}
};

export default config;
```

### Custom Domain

1. Create `CNAME` file in `static/` folder:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   - Add CNAME record: `@` → `yourusername.github.io`
   - Or A records: Point to GitHub Pages IPs

3. Enable custom domain in GitHub Pages settings

---

## 🔄 Workflow: Studio → GitHub → Pages

### Recommended Setup

1. **Studio on Vercel**
   - Deploy Studio to Vercel (see [docs/DEPLOY_STUDIO.md](./DEPLOY_STUDIO.md))
   - Studio URL: `https://studio.yourdomain.com` (or Vercel URL)

2. **Public Site on GitHub Pages**
   - Auto-deploys on every Git push
   - Public URL: `https://yourusername.github.io/repo-name`

3. **Workflow**
   ```
   Edit in Studio (Vercel)
   ↓
   Studio commits to GitHub
   ↓
   GitHub Actions triggers
   ↓
   Public site rebuilds on GitHub Pages
   ↓
   Changes go live automatically
   ```

### Alternative: Local Studio

1. **Run Studio locally**
   ```bash
   npm run dev
   # Access: http://localhost:5173/studio
   ```

2. **Edit content** → Studio commits to GitHub

3. **GitHub Pages auto-deploys** → Public site updates

---

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled in repository settings
- [ ] GitHub Actions workflow file exists (`.github/workflows/deploy-pages.yml`)
- [ ] Build works locally: `npm run build`
- [ ] No errors in build output
- [ ] Test preview: `npm run preview`

---

## 🐛 Troubleshooting

### Build Fails in GitHub Actions

**Problem:** Build fails with errors

**Solution:**
- Check Actions logs for specific errors
- Test build locally: `npm run build`
- Ensure all dependencies are in `package.json`
- Check Node.js version (should be 18+)

### Site Shows 404

**Problem:** Pages return 404 errors

**Solution:**
- Verify `fallback: 'index.html'` in `svelte.config.js`
- Check that all routes are prerendered
- Verify GitHub Pages is serving from correct branch/folder

### Assets Not Loading

**Problem:** Images/CSS not loading

**Solution:**
- Check asset paths are relative (not absolute)
- Verify `static/` folder contents are copied
- Check base path configuration if using subdirectory

### Studio Routes Show HTML Instead of JSON

**Problem:** Studio API routes don't work

**Solution:**
- **This is expected!** Studio requires Node.js
- GitHub Pages is static-only
- Deploy Studio separately to Vercel/Railway/Render
- Or use Studio locally

---

## 🎯 Recommended Architecture

### Option 1: Separate Deployments (Best)

```
Studio (Vercel)     →  Edits content
     ↓
GitHub Repository   →  Stores content
     ↓
GitHub Pages        →  Serves public site
```

**Benefits:**
- ✅ Studio works fully (Node.js support)
- ✅ Public site on free GitHub Pages
- ✅ Auto-deploy on Git push
- ✅ Clean separation

### Option 2: Local Studio

```
Local Studio        →  Edits content
     ↓
GitHub Repository   →  Stores content
     ↓
GitHub Pages        →  Serves public site
```

**Benefits:**
- ✅ Everything free
- ✅ Studio works locally
- ✅ Public site auto-deploys

**Drawbacks:**
- ❌ Studio only accessible locally
- ❌ Need to run `npm run dev` to use Studio

---

## 📚 Additional Resources

- **Studio Deployment**: [docs/DEPLOY_STUDIO.md](./DEPLOY_STUDIO.md)
- **Quick Deploy Guide**: [docs/QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md)
- **Environment Setup**: [docs/ENV_SETUP.md](./ENV_SETUP.md)

---

## ✅ Success Checklist

After deployment:

- [ ] GitHub Pages shows "Your site is live at..."
- [ ] Public site loads correctly
- [ ] All routes work (no 404s)
- [ ] Assets load (images, CSS)
- [ ] Studio is accessible (on Vercel or locally)
- [ ] Changes in Studio commit to GitHub
- [ ] GitHub Pages auto-deploys on Git push

---

**Need Help?** Check the troubleshooting section or review the detailed documentation.
