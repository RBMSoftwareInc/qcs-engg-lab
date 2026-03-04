# Data Forms & Git-Based Persistence (No DB)

This project is fully git-based: no database. Customer-facing forms (e.g. "Let's Get Started", newsletter) persist data by **writing files into the repo** and committing them via the GitHub API. The repo is the single source of truth.

**→ For the full Data Forms settings module (enable/disable from Studio, all APIs and modals), see [DATA_FORMS_MODULE.md](./DATA_FORMS_MODULE.md).**

## How It Works

1. **Public form** (e.g. ConversationModal "Let's Get Started") submits to a **public API** (`POST /api/inquiries`).
2. The API validates input, then uses the **GitHub REST API** to create a new file (e.g. `data/inquiries/2025-03-02-143022-abc123.json`) and commit it.
3. Data lives under a dedicated directory (e.g. `data/inquiries/`). Each submission = one file. Git history is the audit log.

No DB, no external storage—just the same GitHub token and API already used by Studio for content.

## Implemented: Inquiries ("Let's Get Started")

- **Form**: Name, Email, "What brings you here?" (intent).
- **API**: `POST /api/inquiries` (no auth).
- **Storage**: `data/inquiries/YYYY-MM-DD-HHmmss-<id>.json`.
- **Payload**: `{ name, email, intent, submittedAt }`.
- **Protection**: Per-IP rate limit (5 submissions/hour), global GitHub rate limit, basic validation and sanitization.

## Other Input Screens You Can Add (Same Pattern)

| Form type        | Purpose              | Suggested path               | Fields / payload                    |
|------------------|----------------------|------------------------------|-------------------------------------|
| **Newsletter**   | Email signup         | `data/newsletter/`           | `email`, `subscribedAt`              |
| **Contact**      | Generic contact      | `data/contact/`              | `name`, `email`, `message`, `submittedAt` |
| **Waitlist**     | Early access / beta  | `data/waitlist/`             | `email`, `source?`, `submittedAt`    |
| **Feedback**     | Page/section feedback| `data/feedback/`             | `page`, `rating?`, `comment`, `submittedAt` |
| **Demo request** | Book a demo          | `data/demo-requests/`        | `name`, `email`, `company?`, `submittedAt` |

For each:

1. Add a **public** `POST /api/<type>` endpoint that:
   - Validates and sanitizes body.
   - Uses `validateContentPath(..., ['data'])` and `getSafeContentPath(..., 'data')`.
   - Builds a unique filename (e.g. date + short id).
   - Calls `createOrUpdateFile(path, JSON.stringify(payload), commitMessage)`.
2. Wire the modal or form to that endpoint and show success/error (like ConversationModal).
3. Optionally add a Studio view to list/read these files (see below).

## Studio-Level Config (Optional)

To keep the product **git-based and low-config**, form behavior can stay convention-based (fixed paths and payloads). If you want to make it configurable later, you can extend `config/studio.json` like this:

```json
{
  "publishWebhookUrl": "",
  "defaultNewContentStatus": "draft",
  "dataForms": {
    "inquiries": {
      "enabled": true,
      "path": "data/inquiries",
      "extension": "json"
    },
    "newsletter": {
      "enabled": true,
      "path": "data/newsletter",
      "extension": "json"
    }
  }
}
```

Then:

- **API**: Read `dataForms` in each form API and only write if `enabled` and use `path`/`extension`. Default to current hardcoded values if missing.
- **Studio UI**: A single "Data" or "Submissions" section that lists configured `dataForms` and, for each, calls an authenticated API that lists files under that path via the GitHub API (same as content list). No edit needed—view only, or with simple “mark read” in file frontmatter/metadata if you store it in the file.

## Studio View for Inquiries (Optional)

To see submissions in Studio without a DB:

1. **API**: `GET /studio/api/data/inquiries` (or `/studio/api/data?path=inquiries`). Requires Studio session. Uses GitHub API to list `data/inquiries/*.json` and optionally fetch each file’s content (or only list).
2. **Page**: e.g. `/studio/inquiries` that calls this API and renders a table (name, email, intent, date). No delete/publish required for MVP—just read-only.

This keeps everything in git: submissions are files; Studio is just a reader over the same repo.

## Security Notes

- **Public form endpoints** must not require Studio auth. Protect with:
  - Per-IP rate limiting (e.g. `formRateLimiter`).
  - Input validation and length limits.
  - No script/HTML in stored content if you ever render it (sanitize or store as plain text/JSON only).
- **GitHub token**: Same token as content save; it must have `repo` scope. Stored only server-side (e.g. `.env`), never exposed to the client.
- **Path validation**: Only allow writes under `data/` (or allowlisted subpaths) via `validateContentPath(path, ['data'])`.

## Summary

- **Collect**: Public forms POST to `/api/<form-type>`.
- **Persist**: Each submission becomes a file under `data/<form-type>/` and is committed via GitHub API.
- **No DB**: Repo + Git history are the only persistence and audit trail.
- **Studio**: Optional config in `config/studio.json` and optional read-only “Submissions” view that lists these files via the same GitHub API.
