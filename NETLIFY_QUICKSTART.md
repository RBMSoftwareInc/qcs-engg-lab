# Deploy to Netlify - Quick Start

## 🚀 5-Minute Setup

### Step 1: Install Netlify Adapter

```bash
npm install -D @sveltejs/adapter-netlify
```

### Step 2: Update svelte.config.js

Replace the content with:

```javascript
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			edge: false,
			split: false
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

### Step 3: Commit and Push

```bash
git add .
git commit -m "Configure for Netlify"
git push origin main
```

### Step 4: Deploy to Netlify

1. **Go to Netlify**
   - Visit: https://app.netlify.com
   - Sign up/login with GitHub

2. **Import Repository**
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub" → Choose your repository
   - Click "Deploy site"

3. **Add Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add:
     ```
     GITHUB_TOKEN=ghp_your_token_here
     GITHUB_OWNER=your-username
     GITHUB_REPO=your-repo-name
     GITHUB_BRANCH=main
     VITE_STUDIO_EMAIL=admin@example.com
     VITE_STUDIO_PASSWORD=your_secure_password
     ```
   - Click "Save"
   - Go to **Deploys** → "Trigger deploy" → "Clear cache and deploy"

4. **Access Your Site**
   - Site: `https://your-site.netlify.app`
   - Studio: `https://your-site.netlify.app/studio/login`

**That's it!** Every Git push auto-deploys.

---

## ✅ What Works

- ✅ **Public Website** → Fully static
- ✅ **Studio (CMS)** → Works via Netlify Functions
- ✅ **Auto-Deploy** → On every Git push
- ✅ **HTTPS** → Included free

---

## 📚 More Details

- **Complete Guide**: [docs/NETLIFY_DEPLOY.md](./docs/NETLIFY_DEPLOY.md)
- **Environment Setup**: [docs/ENV_SETUP.md](./docs/ENV_SETUP.md)

---

**Need help?** Check the troubleshooting section in the complete guide.
