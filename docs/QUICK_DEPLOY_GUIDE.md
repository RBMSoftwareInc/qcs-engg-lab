# Quick Deploy Guide - Studio to Vercel

The fastest way to deploy Studio and access it via Git.

## 🚀 5-Minute Setup

### Step 1: Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Sign up/login with GitHub (free)

2. **Import Repository**
   - Click "Import Git Repository"
   - Select your `QCS-Engg-Lab` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: SvelteKit (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.svelte-kit` (auto-detected)
   - Click "Deploy"

4. **Add Environment Variables**
   - After first deploy, go to **Project Settings** → **Environment Variables**
   - Add these variables (for Production, Preview, and Development):
     ```
     GITHUB_TOKEN=ghp_your_token_here
     GITHUB_OWNER=your-username
     GITHUB_REPO=your-repo-name
     GITHUB_BRANCH=main
     VITE_STUDIO_EMAIL=admin@example.com
     VITE_STUDIO_PASSWORD=your_secure_password
     ```
   - Click "Save"
   - Go to **Deployments** tab → Click "..." on latest deployment → "Redeploy"

### Step 3: Access Studio

1. **Get Your URL**
   - Vercel provides: `https://your-project.vercel.app`
   - Or use custom domain if configured

2. **Access Studio**
   - Visit: `https://your-project.vercel.app/studio/login`
   - Log in with your credentials
   - Start managing content!

## ✅ How It Works

### Studio → Git → Deploy Flow

1. **You edit content in Studio**
   - Visit your Vercel URL → `/studio`
   - Edit any markdown file
   - Click "Save" or "Publish"

2. **Studio commits to GitHub**
   - Studio uses GitHub REST API
   - Changes are committed directly to your repo
   - Commit message: "Update content: filename.md"

3. **Vercel auto-deploys** (optional)
   - If you enable auto-deploy, Vercel rebuilds on every Git push
   - Your public site updates automatically
   - Or manually trigger deployments

### Accessing via Git

**Studio commits directly to your GitHub repo**, so:

- ✅ All changes are in Git
- ✅ Full version history
- ✅ Can pull changes locally
- ✅ Can review commits
- ✅ Can revert if needed

**To see changes in Git:**

```bash
# Pull latest changes
git pull origin main

# See commit history
git log --oneline

# See what changed
git show <commit-hash>
```

## 🔧 Configuration

### Option 1: Use adapter-auto (Recommended for Vercel)

For Vercel deployment, you can use `adapter-auto` which automatically detects Vercel:

1. **Install adapter-auto** (if not already installed):
   ```bash
   npm install -D @sveltejs/adapter-auto
   ```

2. **Update svelte.config.js**:
   ```javascript
   import adapter from '@sveltejs/adapter-auto';
   // ... rest of config
   ```

3. **Or use the provided config**: A `svelte.config.vercel.js` file is included for Vercel deployments.

### Option 2: Keep adapter-static

Vercel can handle `adapter-static` and will still serve server-side routes for Studio. No changes needed.

### Environment Variables in Vercel

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable
3. Select environments: Production, Preview, Development
4. Click "Save"
5. **Redeploy** for changes to take effect

## 🔄 Auto-Deploy Setup (Optional)

### Enable Auto-Deploy

1. In Vercel project settings
2. **Git** section → **Production Branch**: `main`
3. Every `git push` to `main` triggers deployment

### Workflow

1. Edit in Studio → Commits to GitHub
2. Git push triggers Vercel deployment
3. Public site rebuilds with new content
4. Changes go live automatically

## 📝 Example Workflow

```bash
# 1. Edit content in Studio (web interface)
#    → Studio commits to GitHub automatically

# 2. Pull changes locally (optional)
git pull origin main

# 3. Verify changes
git log --oneline
# See: "Update content: about/lab.md"

# 4. Vercel auto-deploys (if enabled)
#    → Public site updates automatically
```

## 🎯 What You Get

- ✅ **Studio URL**: `https://your-project.vercel.app/studio`
- ✅ **Public Site**: `https://your-project.vercel.app`
- ✅ **Git Integration**: All changes in GitHub
- ✅ **Auto-Deploy**: Optional automatic deployments
- ✅ **HTTPS**: Included free
- ✅ **Free Tier**: Generous free tier

## 🐛 Troubleshooting

### Studio Shows Error

- Check environment variables are set
- Verify GitHub token has `repo` scope
- Check Vercel deployment logs

### Changes Not in Git

- Studio commits directly via GitHub API
- Check GitHub repository for commits
- Verify `GITHUB_TOKEN` is correct

### Auto-Deploy Not Working

- Check Vercel project settings → Git
- Verify production branch is `main`
- Check deployment logs

## 📚 Next Steps

- Read full guide: [docs/DEPLOY_STUDIO.md](./DEPLOY_STUDIO.md)
- Environment setup: [docs/ENV_SETUP.md](./ENV_SETUP.md)
- Studio features: [docs/STUDIO_EXTENSION_SUMMARY.md](./STUDIO_EXTENSION_SUMMARY.md)

---

**That's it!** Your Studio is now live and connected to Git. 🎉
