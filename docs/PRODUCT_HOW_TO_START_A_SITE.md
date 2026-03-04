# How a New Website Is Started on This Platform (Sellable Product Guide)

This doc describes how the platform is **initiated** when you sell it: how a customer (or you) starts a **new website from scratch** using this stack, with **Studio as the front face**.

---

## 1. Yes: Studio Is the Front Face

- **Customers** (site owners, content editors, marketers) use **Studio** to:
  - Create and edit **content** (pages, posts, copy)
  - Build **pages** (via Builder, if you use the block builder)
  - Manage **media** (images, assets)
  - Configure **settings** (menus, SEO, forms, publishing)
  - Publish (draft → review → live; optional scheduled publish)

- The **public website** is built from the **same Git repo** that Studio edits. Studio does not replace the site; it edits the source (content, config) that the site is built from.

So in practice: **we expose Studio as the front face**; customers build content, pages, media, and settings there, then publish. The live site is the static build from that repo.

---

## 2. What “Starting” a New Site Means

To have a **new website from scratch** on this platform you need:

1. **A Git repository** that contains (or will contain):
   - The same app code (this SvelteKit project, or a template derived from it)
   - A `content/` folder (markdown/MDX)
   - Optional: `design/skins/`, `config/`, `static/`, etc.

2. **Studio** running and pointed at that repo (via env: `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `GITHUB_BRANCH`).

3. **Credentials** so the customer (or you) can log in to Studio (env `VITE_STUDIO_EMAIL` / `VITE_STUDIO_PASSWORD` or `config/studio-users.json`).

4. **A build + deploy pipeline** that builds the **public site** from that repo (e.g. on push to `main`) and serves it at the customer’s domain.

So **“how is it started?”** = **create/provision that repo + Studio deployment + credentials + (optional) deploy pipeline**, then give the customer the **Studio URL** (and login). They then use Studio to build content, pages, media, and settings and publish.

---

## 3. Two Ways to Initiate a New Site (Sellable Product)

### Model A: Template / Starter (Dev or agency sets up each site)

**Who starts it:** A developer or your team.

**How it’s initiated:**

1. **Create a new repo** from your **platform template** (this repo or a stripped-down “starter” version).
2. **Configure** the repo for the customer:
   - Create a GitHub Personal Access Token (or use a bot account) with `repo` scope for that repo.
   - Set (or document) env vars: `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `GITHUB_TOKEN`.
3. **Deploy Studio** (Vercel, Netlify, Railway, etc.) for that repo:
   - One deployment per site, or one multi-tenant app that reads repo from env.
   - Set the same GitHub env vars + Studio credentials (`VITE_STUDIO_EMAIL`, `VITE_STUDIO_PASSWORD` or later `config/studio-users.json`).
4. **Deploy the public site** from the same repo (e.g. Netlify/Pages build on push; or same app with static adapter).
5. **Hand off to the customer:** Studio URL + login. Optional: custom domain for the site.

**What the customer needs to start (after you’ve done the above):**  
Just the **Studio URL** and **login**. Then they use Studio to add content, use the Builder, upload media, change settings, and publish.

---

### Model B: Managed / SaaS (You provision each new site)

**Who starts it:** Your platform (you or an onboarding flow).

**How it’s initiated:**

1. **Customer signs up** (your landing page, form, or dashboard).
2. **You provision:**
   - A **new GitHub repo** (from your template), e.g. via GitHub API or GitHub template repos.
   - A **GitHub token** that has access to that repo (e.g. a bot user or fine-grained PAT).
   - A **Studio instance** for that repo (new deployment with repo-specific env, or one app with tenant = repo).
   - (Optional) **Build/deploy** for the public site (e.g. Netlify/ Vercel project connected to that repo).
3. **You create** the first Studio user (e.g. write `config/studio-users.json` via API or seed in template).
4. **You send the customer:** Studio URL + login (+ optional site URL).

**What the customer needs to start:**  
Again, just the **Studio URL** and **login**. They don’t need to touch GitHub or env; they only use Studio to build pages, content, media, and settings, then publish.

---

## 4. Step-by-Step: From Zero to “Customer Uses Studio”

High-level flow that fits both models:

| Step | Who | What |
|------|-----|------|
| 1. **Provision repo** | You / platform | New repo (template or copy). Holds app code + `content/`, `config/`, etc. |
| 2. **Configure GitHub access** | You / platform | Token with `repo` for that repo. Set `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `GITHUB_TOKEN` where Studio runs. |
| 3. **Deploy Studio** | You / platform | Deploy this app (or your white-label build) with the repo env vars + Studio credentials. Get Studio URL (e.g. `https://studio.customer.com` or `https://yourplatform.com/studio/customer-id`). |
| 4. **Create first user** | You / platform | Set `VITE_STUDIO_EMAIL` / `VITE_STUDIO_PASSWORD` or add user in `config/studio-users.json` (e.g. via API or first deploy). |
| 5. **Hand off** | You | Give customer: Studio URL + login. (Optional: site URL and domain.) |
| 6. **Customer uses Studio** | Customer | Log in → **Content** (create/edit pages) → **Builder** (layout/blocks) → **Media** (upload) → **Settings** (menus, SEO, forms, publishing) → Publish. |
| 7. **Site goes live** | System | Build pipeline builds from repo on push; customer’s site URL serves the static site. |

So: **we expose Studio as the front face**; initiation is **provision repo + Studio + credentials**; then customers **build pages, content, media, and settings in Studio and publish**.

---

## 5. What We Need to Start (Checklist)

For **each new site** you need:

| Item | Purpose |
|------|--------|
| **Git repo** | Holds code + content. Can be from a template; can be empty `content/` at first. |
| **GITHUB_TOKEN** | So Studio can read/write that repo (create/update files, commit). |
| **GITHUB_OWNER** | Repo owner (org or user). |
| **GITHUB_REPO** | Repo name. |
| **GITHUB_BRANCH** | Usually `main`. |
| **Studio credentials** | `VITE_STUDIO_EMAIL` + `VITE_STUDIO_PASSWORD` (first user) or users in `config/studio-users.json`. |
| **Studio URL** | Where customers open Studio (your deployment). |
| **Site build/deploy** | Pipeline that builds the static site from the same repo (e.g. on push) and serves it at the customer’s site URL. |

Optional but useful:

- **FIGMA_TOKEN** – If customers will import design tokens from Figma.
- **Custom domain** for the customer’s site (and optionally for Studio).
- **Publish webhook** – So “Publish” in Studio can trigger a rebuild (Settings → Publishing).

---

## 6. Customer Journey (After Initiation)

Once the customer has the Studio URL and login:

1. **Log in** to Studio.
2. **Content** – Create or edit markdown pages (e.g. home, about, services). Use status draft → review → live.
3. **Builder** – If you ship the block builder, build page structure with blocks/sections.
4. **Design Skins** – (If you expose it) Change theme/tokens or pick a skin.
5. **Media** – Upload images; use them in content and blocks.
6. **Settings** – Menus, SEO, data forms, publishing (e.g. webhook), scheduled publish.
7. **Publish** – Set content to live; optional “Run scheduled publish now” in Settings → Publishing; site build runs (via webhook or push), and the public site updates.

So in practice: **Studio is the only UI the customer needs** to build and run the site; they don’t need to touch Git or the codebase unless you want to offer that for power users.

---

## 7. Summary

- **Studio is the front face:** customers build pages, content, media, and settings there and publish.
- **How a new site is started:** provision a **repo** (from template) + **Studio** (deployed and configured for that repo) + **credentials**, then give the customer the **Studio URL** and **login**.
- **What we need to start:** repo, GitHub token (and owner/repo/branch), Studio credentials, Studio URL, and a way to build/deploy the public site from that repo.
- **Customer flow:** Log in → Content + Builder + Media + Settings → Publish; the live site is the static build from the same repo Studio edits.

For a **sellable product**, you can offer:
- **Model A:** “Starter kit” – dev/agency clones your template, configures one repo + Studio per client.
- **Model B:** “Managed” – signup → you provision repo + Studio (+ optional deploy) and send Studio URL + login so the customer starts building immediately.
