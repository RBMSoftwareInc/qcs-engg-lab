# Deployment Guide

How to deploy QCS Engineering Lab to different hosts.

## Current setup (Netlify)

The project is configured for **Netlify** by default. Studio (content editing, Git status, pull) works because Netlify runs the app as serverless functions.

- Connect your repo in Netlify, set build command: `npm run build`, publish directory: (leave default).
- Add environment variables in Netlify: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, and optionally `GITHUB_BRANCH`, `VITE_STUDIO_EMAIL`, `VITE_STUDIO_PASSWORD`.
- Deploy. Studio will be available at `/studio`.

---

## Deploying to Hostinger

Hostinger is often **shared hosting** (PHP/Apache, no Node.js). You have two options.

### Option A: Static site only (shared hosting)

Best if you only need the **public site** (no Studio editing on the server). You build locally and upload the built files.

1. **Build a static version** (on your machine or CI):

   ```bash
   BUILD_STATIC=1 npm run build
   ```

   This writes the static site into the `build/` directory and runs the redirect script so `build/.htaccess` is generated for Hostinger’s Apache.

2. **Upload to Hostinger**:
   - In Hostinger: **File Manager** or **FTP** → open `public_html`.
   - Upload **everything inside** `build/` into `public_html` (so `build/index.html` → `public_html/index.html`, etc.). Do **not** upload the `build` folder itself; only its contents.
   - If you use File Manager, you can zip the contents of `build/`, upload the zip, then extract in `public_html`.

3. **Result**: The site will work. **Studio will not work** on Hostinger (no Node.js); edit content locally or via GitHub and redeploy with step 1–2.

### Option B: Full app with Studio (VPS / Node.js)

If your Hostinger plan is a **VPS** or **Node.js hosting**:

1. Keep the default build (no `BUILD_STATIC=1`): `npm run build`.
2. Run the app with Node, e.g. `node build/index.js` (or use the output structure of your Node adapter).
3. Use a process manager (e.g. PM2) and point your domain to this Node server.
4. Set the same env vars as Netlify (`GITHUB_*`, `VITE_STUDIO_*`) in the server environment.

Then both the site and Studio will work.

---

## Summary

| Host           | Build command           | Upload / run                    | Studio works?        |
|----------------|-------------------------|----------------------------------|-----------------------|
| Netlify        | `npm run build`         | Auto (Git push)                  | Yes                   |
| Hostinger (shared) | `BUILD_STATIC=1 npm run build` | Upload `build/` contents → `public_html` | No (static only) |
| Hostinger (VPS/Node) | `npm run build`     | Run Node server                  | Yes (with env vars)   |

---

## Pre-deploy: QA & production checklist

Before deploying to Hostinger (QA or prod), run through this list.

**Content & SEO**

- [ ] **config/seo.json** – Set `siteUrl` to your production URL (e.g. `https://yoursite.com`) so canonical, OG, and sitemap use the correct domain. Optionally set `ogImage`, `gtmId`, `gaMeasurementId` (or use env vars).
- [ ] **robots.txt** – `static/robots.txt` has a sitemap URL; ensure it matches production (e.g. `https://yoursite.com/sitemap.xml`).
- [ ] **.env** – For production, set `VITE_PUBLIC_SITE_URL` (and any GTM/GA IDs) on the host; never commit secrets.

**Build & host**

- [ ] **QA (static)** – `BUILD_STATIC=1 npm run build`, then upload contents of `build/` to QA `public_html`. Confirm `build/.htaccess` is present and uploaded (SPA fallback + redirects).
- [ ] **Prod (static)** – Same as QA; use prod `public_html` and prod `siteUrl` / env.
- [ ] **VPS with Studio** – Default build uses the Netlify adapter. To run a Node server on VPS with Studio, use `@sveltejs/adapter-node` and run the built app (see `docs/STUDIO_DEPLOYMENT.md`).

**Smoke test after deploy**

- [ ] Home, Practice, Philosophy, Insights, Signals, About, Neural load.
- [ ] One content page per section and a direct URL (no 404).
- [ ] Initiate modal, footer and nav links work.
- [ ] Mobile: menu toggles, layout readable.
- [ ] `/sitemap.xml` and canonical/OG tags use production URL.

---

## After deploying

- **Git versioning**: Content saves go to GitHub via the API. On serverless (Netlify), “Git status” and “Pull” in Studio show a message that local Git isn’t available; that’s expected. Versioning still works when you save from Studio.
- **Env vars**: Never commit `GITHUB_TOKEN` or studio passwords; set them in the host’s dashboard or server environment.
