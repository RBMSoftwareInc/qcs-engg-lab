# Deploy to Netlify - Complete Guide

Netlify fully supports both your **public website** and **Studio (CMS)**! Studio API routes automatically become Netlify Functions, so everything works.

## ✅ What Works on Netlify

- ✅ **Public Website** → Fully static, works perfectly
- ✅ **Studio (CMS)** → Works via Netlify Functions (serverless)
- ✅ **Auto-Deploy** → Automatic deployments from Git
- ✅ **HTTPS** → Included free
- ✅ **Custom Domain** → Easy setup

---

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Install Netlify Adapter

```bash
npm install -D @sveltejs/adapter-netlify
```

### Step 2: Update svelte.config.js

Replace your current `svelte.config.js` with the Netlify configuration:

```javascript
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			edge: false, // Use Node.js runtime
			split: false // Single function for all routes
		}),
		prerender: {
			handleHttpError: 'warn',
			handleUnseenRoutes: 'warn',
			entries: ['*']
		}
	}
};

export default config;
```

**Or** use the provided `svelte.config.netlify.js`:

```bash
# Copy the Netlify config
cp svelte.config.netlify.js svelte.config.js
```

### Step 3: Commit and Push

```bash
git add .
git commit -m "Configure for Netlify deployment"
git push origin main
```

### Step 4: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended)

1. **Go to Netlify**
   - Visit: https://app.netlify.com
   - Sign up/login with GitHub (free)

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub"
   - Authorize Netlify to access your repositories
   - Select your `QCS-Engg-Lab` repository

3. **Configure Build Settings**
   - **Build command**: `npm run build` (auto-detected)
   - **Publish directory**: `build` (auto-detected)
   - **Base directory**: Leave empty (or `./` if needed)
   - Click "Deploy site"

4. **Add Environment Variables**
   - After first deploy, go to **Site settings** → **Environment variables**
   - Click "Add variable" and add each:
     ```
     GITHUB_TOKEN=ghp_your_token_here
     GITHUB_OWNER=your-username
     GITHUB_REPO=your-repo-name
     GITHUB_BRANCH=main
     VITE_STUDIO_EMAIL=admin@example.com
     VITE_STUDIO_PASSWORD=your_secure_password
     FIGMA_TOKEN=your_figma_token (optional)
     ```
   - Click "Save"
   - Go to **Deploys** → Click "Trigger deploy" → "Clear cache and deploy site"

5. **Access Your Site**
   - Your site is live at: `https://random-name-12345.netlify.app`
   - Studio is at: `https://random-name-12345.netlify.app/studio/login`

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Follow prompts to link to existing site or create new

4. **Set Environment Variables**
   ```bash
   netlify env:set GITHUB_TOKEN "ghp_your_token_here"
   netlify env:set GITHUB_OWNER "your-username"
   netlify env:set GITHUB_REPO "your-repo-name"
   netlify env:set GITHUB_BRANCH "main"
   netlify env:set VITE_STUDIO_EMAIL "admin@example.com"
   netlify env:set VITE_STUDIO_PASSWORD "your_secure_password"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

## 🔧 Configuration Files

### netlify.toml

The `netlify.toml` file is already created in your project root. It configures:

- Build command and publish directory
- SPA fallback for client-side routing
- Security headers
- Cache headers for assets

### Environment Variables

Set these in Netlify Dashboard → Site settings → Environment variables:

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

**Important:** 
- Set for **Production**, **Deploy previews**, and **Branch deploys**
- Redeploy after adding variables

---

## 🔄 Auto-Deploy from Git

### Automatic Deployments

Once connected to GitHub:
- **Every push to `main`** → Deploys to production
- **Pull requests** → Creates deploy previews
- **Other branches** → Creates branch deploys

### Deploy Hooks

You can also trigger deploys via webhook:

1. Go to **Site settings** → **Build & deploy** → **Deploy hooks**
2. Create a new deploy hook
3. Use the URL to trigger deployments from external services

---

## 🎯 How It Works

### Public Website
- Static pages are pre-rendered at build time
- Served directly from CDN (fast!)
- No server needed

### Studio (CMS)
- API routes (`/studio/api/*`) become Netlify Functions
- Serverless functions run on-demand
- Full Node.js runtime support
- All Studio features work!

### Build Process

```
Git Push
  ↓
Netlify detects change
  ↓
Runs: npm install
  ↓
Runs: npm run build
  ↓
Converts API routes to Netlify Functions
  ↓
Deploys static site + functions
  ↓
Site live!
```

---

## 📋 Pre-Deployment Checklist

- [ ] `@sveltejs/adapter-netlify` installed
- [ ] `svelte.config.js` updated for Netlify
- [ ] `netlify.toml` exists in project root
- [ ] All code committed and pushed to GitHub
- [ ] Environment variables documented
- [ ] GitHub token created with `repo` scope
- [ ] Tested locally: `npm run build` succeeds
- [ ] Studio login works locally

---

## 🔐 Security Best Practices

1. **Never Commit Secrets**
   - `.env` is in `.gitignore` ✅
   - Use Netlify's environment variables

2. **Use Strong Passwords**
   - Studio password should be strong
   - GitHub token should have minimal required scopes

3. **HTTPS Only**
   - Netlify provides HTTPS automatically
   - Custom domains also get HTTPS

4. **Token Rotation**
   - Rotate GitHub tokens periodically
   - Update in Netlify when rotated

---

## 🎨 Custom Domain Setup

### Step 1: Add Domain in Netlify

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter your domain: `yourdomain.com`
4. Follow DNS configuration instructions

### Step 2: Configure DNS

**Option A: Use Netlify DNS**
- Change nameservers to Netlify's
- Netlify manages DNS automatically

**Option B: Use External DNS**
- Add CNAME record: `@` → `your-site.netlify.app`
- Or A records: Point to Netlify IPs

### Step 3: SSL Certificate

- Netlify automatically provisions SSL certificates
- HTTPS enabled automatically
- Certificate renews automatically

---

## 🐛 Troubleshooting

### Build Fails

**Problem:** Build fails with errors

**Solution:**
- Check build logs in Netlify dashboard
- Test build locally: `npm run build`
- Verify Node.js version (should be 18+)
- Check that `@sveltejs/adapter-netlify` is installed

### Studio API Routes Return HTML

**Problem:** Studio API routes return HTML instead of JSON

**Solution:**
- Verify `svelte.config.js` uses `@sveltejs/adapter-netlify`
- Check that adapter is configured correctly
- Rebuild and redeploy

### Environment Variables Not Working

**Problem:** GitHub API errors, authentication fails

**Solution:**
- Verify variables are set in Netlify dashboard
- Check variable names match exactly (case-sensitive)
- Set for correct environment (Production/Preview/Branch)
- Redeploy after adding variables
- Clear cache and redeploy

### Functions Timeout

**Problem:** Netlify Functions timeout

**Solution:**
- Netlify Functions have a 10-second timeout (free tier)
- 26-second timeout (Pro tier)
- Optimize API calls
- Consider caching responses

### Rate Limits

**Problem:** GitHub API rate limit errors

**Solution:**
- Check [docs/GITHUB_RATE_LIMITS.md](./GITHUB_RATE_LIMITS.md)
- Rate limiter is set to 4,000/hour (GitHub allows 5,000/hour)
- Wait for hourly reset if exceeded

---

## 📊 Netlify Features

### Deploy Previews

- Every PR gets a unique preview URL
- Test changes before merging
- Share preview links with team

### Branch Deploys

- Deploy any branch to a unique URL
- Test features in isolation
- Perfect for staging environments

### Form Handling

- Netlify Forms (if you add forms later)
- Automatic spam filtering
- Email notifications

### Analytics

- Netlify Analytics (Pro feature)
- Track page views, performance
- Real-time visitor data

---

## 💰 Pricing

### Free Tier (Hobby)

- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 100 GB storage
- ✅ Unlimited sites
- ✅ HTTPS included
- ✅ Custom domains
- ✅ Deploy previews
- ✅ Form handling (100 submissions/month)

### Pro Tier ($19/month)

- ✅ 1 TB bandwidth/month
- ✅ 1,000 build minutes/month
- ✅ 500 GB storage
- ✅ 26-second function timeout
- ✅ Priority support
- ✅ Advanced analytics

**For most users, the free tier is sufficient!**

---

## 🔄 Workflow: Studio → Git → Netlify

### Typical Workflow

1. **Edit Content in Studio**
   - Visit your Netlify URL → `/studio`
   - Log in
   - Edit content
   - Save/Publish

2. **Studio Commits to GitHub**
   - Studio uses GitHub REST API
   - Changes committed directly to repo
   - No manual Git commands needed

3. **Netlify Auto-Deploys**
   - Detects Git push
   - Rebuilds site automatically
   - Deploys new version
   - Changes go live in 2-3 minutes

### Manual Deploy

If you prefer manual control:

1. **Edit in Studio** → Changes committed to GitHub
2. **Trigger Deploy**
   - Go to Netlify dashboard
   - Click "Trigger deploy" → "Deploy site"
   - Or use deploy hook

---

## 📚 Additional Resources

- **Quick Start**: [docs/QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md) (Vercel, but similar process)
- **Environment Setup**: [docs/ENV_SETUP.md](./ENV_SETUP.md)
- **GitHub Rate Limits**: [docs/GITHUB_RATE_LIMITS.md](./GITHUB_RATE_LIMITS.md)
- **Studio Features**: [docs/STUDIO_EXTENSION_SUMMARY.md](./STUDIO_EXTENSION_SUMMARY.md)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Site is accessible at Netlify URL
- [ ] Public pages load correctly
- [ ] Studio is accessible at `/studio/login`
- [ ] Can log in to Studio
- [ ] Can view content list
- [ ] Can edit content
- [ ] Changes are committed to GitHub
- [ ] Netlify auto-deploys on Git push
- [ ] No console errors
- [ ] Design skins work (if using)

---

## 🎯 Comparison: Netlify vs Vercel vs GitHub Pages

| Feature | Netlify | Vercel | GitHub Pages |
|---------|---------|--------|--------------|
| **Static Site** | ✅ | ✅ | ✅ |
| **Studio (CMS)** | ✅ (Functions) | ✅ (Functions) | ❌ (Static only) |
| **Free Tier** | ✅ Generous | ✅ Generous | ✅ Unlimited |
| **Auto-Deploy** | ✅ | ✅ | ✅ (with Actions) |
| **Custom Domain** | ✅ | ✅ | ✅ |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Deploy Previews** | ✅ | ✅ | ❌ |
| **Form Handling** | ✅ Built-in | ❌ | ❌ |

**Recommendation:** Netlify is excellent for this project because:
- ✅ Studio works fully (via Functions)
- ✅ Generous free tier
- ✅ Easy setup
- ✅ Great developer experience

---

**Need Help?** Check the troubleshooting section or review the detailed documentation.
