# Studio: Git-Managed Content Editing (Reference)

This doc describes where **git-managed content editing** and related Studio features live. Nothing below has been removed; it is the current behaviour.

---

## 1. Content list and editing (Git-managed)

| What | Where | Notes |
|------|--------|--------|
| **Content list** | **Studio** → main nav **Content** (`/studio`) | Lists all Markdown content from the repo, grouped by folder (e.g. domains, services, insights). |
| **Edit a file** | Click a row or **Edit** → `/studio/edit/[slug]` | TipTap editor; save writes back via **GitHub API** (or local Git when running on a VPS with repo). |
| **New content** | **Studio** → **New Content** button or **Tools** → New content | `/studio/new` – create a new Markdown file; save goes to GitHub/repo. |
| **Save / commit** | In the editor: **Save** button | Uses `POST /studio/api/content/save` – validates path, content, commit message; updates file in GitHub (or local Git). |

So: **content is edited in Studio and persisted to Git (via GitHub API or local Git).** That flow is unchanged.

---

## 2. Git status and Pull (local Git)

| What | Where | Notes |
|------|--------|--------|
| **Git status** | **Settings** → **General** (`/studio/settings`) | First section: “Git Status”. Shows `git status` output for the repo. |
| **Pull latest** | Same page → **Pull Latest Changes** | Calls `POST /studio/api/git/pull`. Only works when the app runs in a **real Git checkout** (e.g. VPS). |
| **APIs** | `/studio/api/git/status`, `/studio/api/git/pull` | Used by the Settings page; require auth. |

On **Netlify/serverless**, there is no local `.git`, so status/pull show a note that “Content is still versioned when you save” via the API. On a **VPS** with a clone of the repo, status and pull work as before.

---

## 3. Other Studio features (unchanged)

| Feature | Where |
|--------|--------|
| **Media / images** | **Media** (`/studio/media`) – upload; list; copy paths. |
| **Design skins / animations** | **Design Skins** (`/studio/design-skins`) – tokens, Figma import. |
| **SEO & Analytics** | **Settings** → **SEO & Analytics** (`/studio/settings/seo`) – site URL, meta, GTM, GA. |
| **Users & access** | **Settings** → **Users & access** (`/studio/settings/users`) – manage users and roles (admin). |
| **Credentials** | **Settings** → **Credentials** (`/studio/settings/credentials`) – change your password. |
| **Tools** | **Tools** (`/studio/tools`) – shortcuts to Content, New content, Media, Design skins. |

---

## 4. Summary

- **Git-managed content editing**: Content list → Edit/New → Save → persisted to Git (GitHub API or local repo). Same as before.
- **Git status / Pull**: Settings → General; same section and APIs; only effective where the app has a Git checkout (e.g. VPS).
- **No removal**: All of the above are still in the codebase and UI; Settings sub-nav (General, SEO, Users, Credentials) only reorganises the same Settings content, with **General** still holding Git Status and Pull.

For deployment and environment setup, see `DEPLOYMENT.md` and `docs/STUDIO_DEPLOYMENT.md`.
