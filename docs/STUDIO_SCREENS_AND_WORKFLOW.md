# Studio: Screens & Scheduled Publish Workflow

Where to find the new features and how the scheduled-publish workflow runs.

---

## 1. Editor screen – History & Schedule publish

**Path:** Studio → **Content** → click a file → **Edit** (`/studio/edit/[slug]`).

**Left sidebar (Metadata):**
- **Title**, **Description**, **Status**, **Order** (existing).
- **Schedule publish** – Optional date/time picker. Click **Save schedule** to save the draft with `publishAt` set. The content stays draft until the scheduled job runs.
- **History** – Button opens a panel below with:
  - List of commits for this file (message, author, date).
  - **Restore** on a row restores that version (new commit) and reloads the page.

**Header:** Save Draft, Publish, Submit for review (unchanged).

*(Optional: add a screenshot as `docs/screens/editor-sidebar-history-schedule.png`.)*

---

## 2. Content list – New content (by role)

**Path:** Studio → **Content** (`/studio`).

- **Admin / Editor:** "New Content" button visible top-right. Click to create a new markdown file.
- **Viewer:** "New Content" button is hidden.

---

## 3. Studio nav – Settings (by role)

**Path:** Any Studio page (header).

- **Admin / Editor:** **Settings** link visible. Click to open Menus, Data Forms, SEO, Publishing, Users (admin only), Credentials.
- **Viewer:** **Settings** link is hidden.

*(Optional: add a screenshot as `docs/screens/studio-nav-settings.png`.)*

---

## 4. Settings screen – Users tab (admin only)

**Path:** Studio → **Settings** (`/studio/settings`).

- **Admin:** All cards shown (Menus, Data Forms, SEO & Analytics, Publishing, **Users**, Credentials).
- **Editor:** Same except **Users** card is hidden.

---

## 5. Scheduled publish – trigger from Studio or GitHub Actions

**What it does:** Finds content with `status: draft` and `publishAt` ≤ now, sets `status: live`, and commits via GitHub API.

**Trigger from Studio (recommended):**
- **Settings → Publishing** → scroll to **Scheduled publish** → click **Run scheduled publish now**.
- Same logic runs on the server; result shows how many items were published or any error.
- **Admin only.**

**Trigger from GitHub:**
- Repo → **Actions** → workflow **"Scheduled publish"** → **Run workflow** (manual), or wait for the schedule (every 15 min).
- Workflow file: `.github/workflows/scheduled-publish.yml`.

*(Optional: add a screenshot as `docs/screens/github-actions-scheduled-publish.png`.)*

---

## 6. Reference images (optional)

You can add screenshots to `docs/screens/` for quick reference. See `docs/screens/README.md` for suggested filenames:

- **editor-sidebar-history-schedule.png** – Editor left sidebar with Schedule publish and History panel.
- **studio-nav-settings.png** – Studio header (Content, Builder, Design Skins, Media, Reviews, Settings).
- **github-actions-scheduled-publish.png** – GitHub Actions tab, "Scheduled publish" workflow, Run workflow button.

If you add these files, they will appear in the sections above where the image placeholders are referenced.

---

## 7. Quick checklist

- **History:** Edit any content → sidebar → **History** → choose commit → **Restore**.
- **Schedule:** Edit content → sidebar → **Schedule publish** (date/time) → **Save schedule** → ensure workflow runs (Actions or cron).
- **Permissions:** Viewer = no New content, no Settings; Editor = no Users tab; Admin = full access.
- **Workflow:** Enable Actions if needed; scheduled runs every 15 min or run manually from Actions tab.
