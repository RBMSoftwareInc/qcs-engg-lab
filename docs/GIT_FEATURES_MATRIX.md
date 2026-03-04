# Git Features ↔ Portal Features ↔ Website-Building Potential

Matrix: which **Git features** we use in this portal, and which **other Git features** are suitable to turn into **website-building** features in Studio.

---

## Matrix

| Git feature | Used in this portal? | How / where | Suitable for website building in Studio? | Notes |
|-------------|------------------------|-------------|------------------------------------------|--------|
| **Commit** | Yes | Every save = commit via GitHub API; message, author, SHA. | Yes (already) | Core: every content/config change is a commit. |
| **History / log** | Yes | Content history API + History panel in editor; list commits per file. | Yes (already) | Revision history and “Restore” from a commit. |
| **Branch** | Indirectly | Config has `GITHUB_BRANCH`; we commit to one branch (e.g. `main`). | Yes (high value) | **Potential:** “Draft branch” per user or per campaign; preview site from branch; merge to main = publish. |
| **Diff** | Yes | Diff view in editor (current vs saved); compare with live. | Yes (already) | Compare content versions. |
| **Blame** | No | Not exposed in UI. | Yes (good fit) | **Potential:** “Who last changed this block/paragraph?” in editor or content list. |
| **Tag / release** | No | Not used. | Yes (good fit) | **Potential:** “Publish as release” = tag; “View site at v1.2” from tag; rollback to tag. |
| **Merge** | Concept only | Change requests: “merge” = apply CR to repo (single branch). | Yes (already) | Review workflow; real Git merge if we add branches. |
| **Pull request** | Concept only | Change requests mirror PR idea (submit for review, approve/reject). | Yes (already) | No native GitHub PR; our CR is in config + merge via API. |
| **Fork** | No | Not used. | Maybe | **Potential:** “Duplicate site” = fork repo; niche for agencies. |
| **Clone** | No | Not in Studio. | Maybe | **Potential:** “Start from template” = clone template repo into customer repo. |
| **Stash** | No | Not used. | Maybe | **Potential:** “Save draft locally without committing” (we have draft status + autosave instead). |
| **Remote** | No | We talk to one remote (GitHub) via env. | Maybe | Multi-tenant: different remote per tenant. |
| **Submodule** | No | Not used. | Maybe | **Potential:** Shared “theme” or “blocks” repo as submodule. |
| **Sparse checkout** | No | Not used. | Maybe | Build only part of repo (e.g. one site in monorepo). |
| **Worktree** | No | Not used. | Maybe | Multiple branches checked out for parallel builds. |
| **Revert** | Concept | “Restore” = re-apply content from old commit (new commit). | Yes (already) | Same idea as Git revert at content level. |
| **Rebase** | No | Not used. | Rare | Usually not needed for content workflow. |
| **Conflict resolution** | Partial | Optimistic update + SHA; 409 from API if race. | Yes (improve) | **Potential:** Detect conflict, show diff, “Keep mine / theirs / merge.” |
| **Commit signing** | No | Not used. | Optional | **Potential:** Signed commits for compliance. |
| **Protected branches** | No | Not enforced in app. | Yes (ops) | Repo settings; Studio can respect “can’t push to main” by using branches + PR. |
| **Webhook** | No (we trigger build webhook) | Publish webhook in config. | Yes (already) | Trigger deploy on save/publish. |

---

## Summary: Already Used vs Strong Candidates

**Already used in this portal (Git → Studio):**
- Commit (every save)
- History / log (content history + restore)
- Diff (editor diff view)
- Single-branch workflow (main)
- PR-like flow (change requests + merge)

**Strong candidates to convert to website-building in Studio:**

| Git feature | Studio / website-building use |
|-------------|--------------------------------|
| **Branch** | Draft/preview branches; “Preview” = build from branch; “Publish” = merge to main. |
| **Tag** | “Release” = tag; “Site at v1.0”; rollback to tag. |
| **Blame** | “Last edited by X” on sections or content list. |
| **Conflict handling** | Detect 409, show “Someone else changed this”; merge or overwrite. |
| **Clone / fork** | “Start from template” = clone template repo or create repo from template. |

**Optional / niche:**
- Fork (duplicate site)
- Submodule (shared theme/blocks repo)
- Signed commits (compliance)
- Protected branches (enforce review)

---

## Quick Reference

| Category | Git feature | Portal use | Website-building suitability |
|----------|-------------|------------|------------------------------|
| Core | Commit | Yes (every save) | Yes |
| Core | History | Yes (history + restore) | Yes |
| Core | Diff | Yes (editor) | Yes |
| Branching | Branch | No | **Yes – high value** |
| Branching | Merge | Via CR | Yes |
| Release | Tag | No | **Yes – high value** |
| Collaboration | Blame | No | **Yes** |
| Collaboration | Conflict | Partial | **Yes – improve** |
| Setup | Clone/fork | No | **Yes – templates** |

This matrix can drive a roadmap: **branches** (preview/draft), **tags** (releases), **blame** (attribution), and **conflict resolution** are the next most impactful Git features to map into Studio for website building.
