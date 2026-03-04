# Studio: Permissions Matrix & New Features

## Permission matrix (Granular permissions)

Roles: **admin**, **editor**, **viewer**.

| Area | Admin | Editor | Viewer |
|------|--------|--------|--------|
| **Content** | List, edit, save, new, publish | List, edit, save, new, publish | List, view (no save / no new) |
| **Builder** | Full | Full | View only (save returns 403) |
| **Design Skins** | List, create, set active, Figma import | List only | List only |
| **Media** | List, upload, create folder, delete | List, upload, create folder, delete | List only |
| **Reviews (Change requests)** | List, create, **merge**, **reject** | List, create | List only |
| **Settings** | All (Menus, Data Forms, SEO, Publishing, **Users**, Credentials) | Menus, Data Forms, SEO, Publishing, Credentials (no Users) | **No Settings** (nav hidden) |
| **Git** | Status, **Pull** | Status | Status |
| **Debug / Env** | Yes | No | No |

- **Viewer**: Cannot see "New content" or "Settings" in the UI. Any write API returns 403.
- **Editor**: Can do everything except manage Users, merge/reject change requests, pull Git, or access debug.
- **Admin**: Full access.

Users are stored in `config/studio-users.json` (or env fallback for a single admin). See [ENV_SETUP.md](./ENV_SETUP.md).

---

## Revision history (rollback)

- **API**: `GET /studio/api/content/history?path=content/.../file.md` – list commits for that file.  
  `POST /studio/api/content/restore` – body `{ path, sha }` restores file content from that commit (new commit).
- **Editor**: In the edit page sidebar, **History** button opens a panel with commit list; **Restore** restores that version and reloads the page.
- **Permission**: History (read) = any authenticated; Restore = editor or admin.

---

## Scheduled publishing

- **Frontmatter**: Optional `publishAt: "2025-03-15T09:00:00.000Z"` (ISO date). Content stays `status: draft` until the scheduled job runs.
- **Editor**: In the edit page sidebar, **Schedule publish** – set a date/time and click **Save schedule** to persist `publishAt` with draft status.
- **Run from Studio**: Settings → Publishing → **Run scheduled publish now** (Admin only). Calls `POST /studio/api/publish/run-schedule` and shows published count or errors.
- **Run from CLI / cron**: `npm run scheduled-publish` from repo root (same logic). Env: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`.
- **GitHub Actions**: `.github/workflows/scheduled-publish.yml` runs every 15 minutes and on manual trigger. See [STUDIO_SCREENS_AND_WORKFLOW.md](./STUDIO_SCREENS_AND_WORKFLOW.md).

---

## Block registry (extensibility)

- **API**: `GET /studio/api/blocks` – returns `{ blocks: [...] }`. Used by Builder or other UI to list available blocks.
- **Config**: Optional `config/block-registry.json` with a `blocks` array. If missing, the API returns blocks derived from the code-defined layout registry (hero, article, card, grid, default).
- **Example**: Copy `config/block-registry.example.json` to `config/block-registry.json` and edit to add or reorder blocks. Schema: `{ id, name, description, component?, slots? }`.

---

## Summary

- **Granular permissions**: Enforced on all Studio APIs; UI hides New content and Settings for viewer, and Users for non-admin.
- **Revision/rollback**: History and Restore in the content editor, using GitHub commit history.
- **Scheduled publishing**: `publishAt` in frontmatter + editor UI + `scripts/run-scheduled-publish.ts` (run via cron or GitHub Actions).
- **Block registry**: `GET /studio/api/blocks` + optional `config/block-registry.json` for extensibility.
