# Product Release Readiness & Architecture

## 1. Does the Current Setup Work as-Is for a Product Release?

**Yes.** The current setup is suitable for a product release.

- **One deployment** (e.g. Hostinger VPS) serves both the **public website** and **Studio**.
- Studio is **git-native**: all edits go to the configured GitHub repo via API.
- You have: content editing, Builder, design skins, media, reviews (change requests), permissions, scheduled publish, revision history, block registry, Settings (menus, SEO, forms, publishing, users).
- **No mandatory architecture change** is required to ship this as a product. You can sell “one site + Studio per deployment” and scale by deploying the same code again for each customer with different env (see [STUDIO_GENERALIZED_MULTI_CUSTOMER.md](./STUDIO_GENERALIZED_MULTI_CUSTOMER.md)).

---

## 2. Architecture-Level Changes (Optional)

| Change | Why optional | When to consider |
|--------|--------------|-------------------|
| **Multi-tenant Studio** | Today: one repo per deployment (env). You can ship with “one deployment per customer.” | When you want **one** Studio URL for many customers and are ready to add tenant config + token store. |
| **Separate “Studio” repo** | Same codebase can be deployed N times; each deployment points at a different repo via env. | When you want platform code (app only) in one repo and customer content only in customer repos. |
| **Template registry / marketplace** | Templates can be “copy this repo or use this starter”; no code change required to offer several. | When you want a formal “choose template at signup” flow or in-Studio template switcher. |
| **Build-from-customer-repo pipeline** | For customer XYZ, the **site** must build from **xyz-website** repo. Today your build is “this repo.” | When you onboard customer XYZ: connect their repo to Netlify/Pages or run a build job that clones their repo and builds. |

So: **no arch change is required** for release. Optional improvements are for scaling (multi-tenant), separation (Studio repo), productization (templates), and per-customer build (pipeline).

---

## 3. Can You Build as Many Websites as You Wish?

**Yes.** With the current architecture:

- **One website per deployment:** Each deployment has its own env (`GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `GITHUB_BRANCH`) pointing at **one** repo. That repo = one site’s content and config; the built site is generated from that repo.
- **Many websites:** Deploy the **same** app again for each customer (second VPS, second app on same server, or second project on Vercel/Netlify) with env pointing at that customer’s repo. So you can build as many sites as you have deployments (and customer repos).
- **Limit** is operational: managing N envs, N tokens, N build pipelines (e.g. one Netlify/project per repo). No code limit.

Summary: **current setup works for product release, no mandatory arch change, and you can build as many websites as you want** by adding one deployment + one repo per site.
