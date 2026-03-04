# Making Studio a Generalized Web Studio (Multi-Customer)

How to go from **one Studio for QCS** to **Studio for customer XYZ (and more)**. Do we need a new repo? Where does each website live? Practical issues and a clear management strategy.

---

## 1. Current State (QCS on Hostinger VPS)

- **One repo** (this one): contains both the **app** (public site + Studio) and **content/config** (content/, design/, config/).
- **One deployment** (e.g. Hostinger VPS): one URL serves:
  - **Public site** (e.g. `yourdomain.com`)
  - **Studio** (e.g. `yourdomain.com/studio`)
- **Studio is git-native:** it reads env `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `GITHUB_BRANCH` and talks to **this same repo** via GitHub API. All edits (content, config, media metadata) are commits to that repo.
- So: **one repo = one site + one Studio**. It already works for QCS.

---

## 2. Goal: Studio for Customer XYZ (Generalized)

You want:
- **Customer XYZ** to have their own website and their own Studio.
- Same **platform code** (this app), but XYZ’s **content/site** is separate from QCS.

So you need:
- **Whose repo does Studio talk to?** → For XYZ, Studio must talk to **XYZ’s repo**, not QCS’s repo.
- **Where is the website built from?** → From **that customer’s repo** (content + optional site template).

---

## 3. Do We Need to Move Studio to a Brand New Repo?

**Short answer: No, not for “one Studio per customer.”**

- You can keep **one platform repo** (this codebase) and **deploy it multiple times**:
  - **Deployment 1 (QCS):** env `GITHUB_REPO=qcs-engg-lab` (or this repo) → Studio + site for QCS.
  - **Deployment 2 (XYZ):** env `GITHUB_REPO=xyz-website` → same codebase, Studio + site for XYZ.
- So **Studio does not need to move to a new repo.** The same repo can be the “platform” you deploy per customer; each deployment gets different env (different `GITHUB_*` and credentials).

**When a separate “Studio repo” helps:**
- If you want **platform code** (Studio app only) separate from **any one site’s content**. Then you’d have:
  - Repo **studio-platform** = app code only (no QCS content).
  - Repo **qcs-site** = QCS content (+ maybe minimal site template).
  - Repo **xyz-site** = XYZ content (+ same template).
- Build of the **public site** would then “use platform template + customer repo” (e.g. build step clones customer repo and runs a shared site template). That’s a cleaner separation but requires a defined build pipeline. **Not required** to get the first customer (XYZ) working.

---

## 4. Should the Website (Generated/Built) Be in a New Repo?

**Yes. Each customer’s website should live in its own repo.**

- **QCS website** → repo `qcs-engg-lab` (current).
- **Customer XYZ website** → repo `xyz-website` (new).

Why:
- **Isolation:** XYZ’s content, config, and history don’t mix with QCS.
- **Permissions:** You can give Studio a token that only has access to `xyz-website`.
- **Build/deploy:** You connect that repo to Netlify/Pages/VPS and build the site from it.
- **Git-native:** Studio commits go to that repo; the site is the static build from it.

So:
- **Platform repo (optional split):** Either keep “one repo with app + QCS content” and deploy the same repo multiple times with different env, **or** split into “studio-platform” (app only) + “site templates” and have each customer repo hold content + reference to template.
- **Customer site:** Always **its own repo** (e.g. `xyz-website`). Studio for XYZ points at that repo; the built website is generated from that repo.

---

## 5. Practical Issues When Generalizing

| Issue | What happens | Mitigation |
|-------|----------------------------|------------|
| **One repo per deployment** | Today the app assumes one `GITHUB_REPO` per process. For XYZ you need a **separate deployment** with `GITHUB_REPO=xyz-website` (or multi-tenant – see below). | Use one deployment per customer with different env; no code change. Or add multi-tenant (one app, many repos). |
| **Token per customer** | Studio needs a GitHub token that can read/write the **customer’s repo**. One token per repo, or one bot token with access to many repos. | Create a PAT (or bot) per customer repo, or one fine-grained token with access to an org’s repos. Store in env per deployment or in a secrets store for multi-tenant. |
| **Where is the app code?** | If you deploy “this repo” for XYZ, the **code** is the same as QCS; only env (and thus **content repo**) changes. The **built public site** for XYZ must come from **xyz-website** repo, not from the deployment’s clone. | For “one deployment per customer”: either (a) build the site **from the customer repo** on the same server (clone xyz-website, build, serve), or (b) use a separate build (e.g. Netlify connected to xyz-website) and VPS only serves Studio. So: **site build** must be tied to **customer repo**, not to the deployment’s repo. |
| **Users and config in repo** | Today `config/studio-users.json` and other config live **in the repo** Studio edits. So for XYZ, that’s in **xyz-website** repo. Good: each customer’s users are in their repo. | No change needed; just ensure the token has access to that repo and Studio’s env points at it. |
| **First-time setup** | Who creates `xyz-website`? Empty or from a template? Who sets env on the XYZ deployment? | Process: create repo (template or empty) → create token → deploy platform with env → create first user (in repo or env). Document or automate. |
| **Domains** | QCS: one domain. XYZ: their own domain for site; Studio might be `studio.xyz.com` or `studio.yourplatform.com/xyz`. | Per-deployment: one domain or subdomain per deployment. Multi-tenant: subdomain or path per tenant. |
| **Build pipeline** | Today “build” often means “build this repo.” For XYZ, “build” must mean “build **xyz-website** repo.” | Per customer: connect xyz-website to Netlify/Pages/Vercel, or on VPS run a job that clones xyz-website and runs the site build. |

---

## 6. Recommended Management Strategy

### Strategy A: One Deployment per Customer (recommended to start)

**Idea:** Same platform repo (this one); **one deployment per customer**. Each deployment has its **own env** pointing at **that customer’s repo**. The **website** for that customer is built **from that repo** (not from the deployment’s codebase).

**Concrete:**

1. **Keep one platform repo** (e.g. this repo) as the “Studio + site template” codebase. No need to move Studio to a new repo.
2. **Per customer (e.g. XYZ):**
   - Create repo **xyz-website** (from a **site template**: same structure as this repo but with generic/minimal content, or content-only and build uses platform template).
   - Create a GitHub token with access to **xyz-website** only (or use a bot with access to many such repos).
   - **Deploy the platform** (same code) to a **new instance** (second VPS, or second domain on same VPS, or Vercel/Netlify “Studio” project):
     - Set `GITHUB_OWNER`, `GITHUB_REPO=xyz-website`, `GITHUB_BRANCH`, `GITHUB_TOKEN`, plus Studio credentials.
   - **Site build for XYZ:** Either:
     - **Option B1:** Connect **xyz-website** to Netlify/Vercel/Pages so that pushes to `xyz-website` trigger a build and deploy the **public site** (build command uses your site template). Your VPS then only serves Studio for XYZ (e.g. `studio.xyz.com`), and the live site is on Netlify/XYZ’s domain.
     - **Option B2:** On the same VPS, a webhook or cron clones **xyz-website**, runs the site build, and serves the static output (e.g. under `xyz.com`). More moving parts, but one place to manage.
3. **Hand off:** Give customer XYZ the **Studio URL** and login. They edit content in Studio; saves go to **xyz-website**; the site build (wherever it runs) builds from **xyz-website** and updates the live site.

**Pros:** Simple model; no multi-tenant code; same codebase; clear “one repo per customer site.”  
**Cons:** N deployments for N customers (env and deployment management).

---

### Strategy B: Multi-Tenant Studio (one app, many customers)

**Idea:** **One** Studio deployment. Each **customer (tenant)** is mapped to a **repo** (and token). After login, Studio uses that tenant’s repo.

**What you’d need:**
- A **tenant store** (DB or file): tenant id → `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, token (or token reference).
- **User → tenant:** Either users in a central store with a tenant id, or derive tenant from email/domain, or “select site” after login.
- **Code change:** Replace single `getGitHubConfig()` with “get config for current tenant” (from session or request). All GitHub API calls use that tenant’s config.
- **Secrets:** Tokens per tenant in a secure store (env per tenant is not scalable; use a DB or secrets manager).

**Pros:** One Studio URL; one deployment.  
**Cons:** More code; tenant and token management; build/deploy for each site still needs to be per-repo (Netlify per repo or similar).

---

## 7. Summary Table

| Question | Answer |
|----------|--------|
| **Move Studio to a new repo?** | **No** for “one deployment per customer.” Optional later: separate “studio-platform” repo for app-only and customer repos for content. |
| **Website for customer XYZ in a new repo?** | **Yes.** Each customer site = its own repo (e.g. `xyz-website`). Studio for XYZ points at that repo; the built site is from that repo. |
| **Practical issues** | Token per repo, build must be “from customer repo,” first-time setup, domains. All solvable with one deployment per customer + site build from customer repo. |
| **Better management strategy** | **Start with Strategy A:** one deployment per customer, same platform repo, env points to customer repo; site built from that repo (e.g. Netlify per repo). Consider **Strategy B (multi-tenant)** when you have many customers and want one Studio URL. |

---

## 8. Minimal Path for “Customer XYZ” Today

1. Create repo **xyz-website** (copy this repo and strip to a generic template, or use a minimal structure: `content/`, `config/`, `design/`, and a way to build the site).
2. Create a GitHub PAT with `repo` scope for **xyz-website** (or use a bot).
3. Deploy **this same app** again (second VPS or second app on Hostinger) with:
   - `GITHUB_OWNER=<xyz-org-or-user>`
   - `GITHUB_REPO=xyz-website`
   - `GITHUB_BRANCH=main`
   - `GITHUB_TOKEN=<token-for-xyz-website>`
   - Studio credentials for XYZ.
4. Connect **xyz-website** to a build host (e.g. Netlify) so that on push, the **public site** is built and deployed.
5. Give customer XYZ the **Studio URL** and login. They use Studio; all edits go to **xyz-website**; the site updates when the build runs.

No need to move Studio to a new repo; the **website** for XYZ is in a **new repo** (`xyz-website`), and that’s the right split for a generalized, sellable product.
