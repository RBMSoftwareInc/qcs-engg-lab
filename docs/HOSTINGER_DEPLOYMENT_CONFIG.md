# Hostinger Deployment Configuration

## ✅ Correct Settings for Your SvelteKit Site

Based on your Hostinger Deployments page, here are the correct settings:

### Deployment Settings

- **Framework preset:** ✅ `Vite` (Correct - SvelteKit uses Vite)
- **Branch:** ✅ `main` (Correct - or use `staging` for QA)
- **Node version:** ✅ `22.x` (Good - Node 18+ required)
- **Root directory:** ✅ `./` (Correct)

### Build and Output Settings

- **Build command:** ✅ `npm run build` (Correct)
- **Output directory:** ⚠️ **CHANGE TO:** `build` (Currently set to `public_html` - this is wrong!)
- **Install command:** ✅ `npm install` (Correct)

### Environment Variables

- ✅ `VITE_STUDIO_EMAIL` = `siva@qcs.com` (Correct)
- ✅ `VITE_STUDIO_PASSWORD` = `DumbAss@2025` (Correct)

## ⚠️ Critical Fix Needed

**Output directory must be changed from `public_html` to `build`**

**Why?**
- SvelteKit with `adapter-static` outputs all files to the `build/` directory
- Hostinger will automatically copy from `build/` to `public_html/` after build
- Setting output to `public_html` will cause build failures

## Correct Configuration

```
Framework preset: Vite
Branch: main (or staging for QA)
Node version: 22.x
Root directory: ./

Build command: npm run build
Output directory: build          ← CHANGE THIS!
Install command: npm install
```

## After Making Changes

1. Click **"Save and redeploy"** button
2. Hostinger will:
   - Pull code from Git
   - Run `npm install`
   - Run `npm run build`
   - Copy `build/` contents to `public_html/`
   - Your site will be live!

## Verification

After deployment, check:
- Site loads at your domain
- All pages work
- Studio at `/studio` works with your credentials
- Images load correctly

## For Staging/QA

Create a separate deployment:
- Use `staging` branch
- Same settings, different branch
- Deploy to staging subdomain or separate directory

