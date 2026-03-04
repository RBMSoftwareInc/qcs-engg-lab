# Why Ours? What Makes It Stand Out? AI to Make It Special

Competitors exist—but **people still buy**. They buy Decap, CloudCannon, Notion, Webflow, etc. because **fit** and **differentiation** matter more than "only one in the world." Here’s how to position this product, what already stands out, and how **AI** can make it clearly special and viable.

---

## 1. Reframe: Why Would Anyone Buy Ours?

**They buy when:**
- **We fit a specific wedge** others don’t (e.g. SvelteKit + bundled + self-hosted + design system).
- **We solve a specific pain** (e.g. “I want Git, design tokens, and one deploy—not a headless CMS I have to wire.”).
- **We add a capability** others don’t (e.g. **AI in the editor** so content and SEO get better without leaving Studio).

So the question isn’t “who would buy a repetitive product?” It’s “**who specifically are we for, and what do we do that they can’t get elsewhere?**”

**Suggested wedge:**  
*“Git-native Studio **bundled** with your SvelteKit site: one repo, one deploy, design skins from Figma, block builder, review workflow, scheduled publish, and **AI-assisted content and SEO**—self-hosted, no vendor lock-in.”*

**Who’s that for?** Devs and teams who want: static + Git + design system + optional AI, without tying themselves to a cloud-only CMS or a different framework.

---

## 2. What Already Makes This Stand Out (Single List)

Use this as the “why ours” checklist. **No other product has this exact combo.**

| What | Why it stands out |
|------|--------------------|
| **Bundled site + Studio in one repo** | One codebase, one deploy (e.g. VPS). Competitors are mostly headless (you bring your site) or cloud-only. |
| **Design skins from Figma** | Tokens → CSS in repo; switch look without touching code. Rare in git CMS. |
| **Block builder (v1)** | Add/move sections in the UI; still git-native. Many git CMS are form-only, no visual sections. |
| **Change requests (PR-style)** | Submit for review, merge/reject in Studio. Git workflow without leaving the app. |
| **Scheduled publish + “Run now” in UI** | Schedule in editor; trigger job from Settings. Clear and in one place. |
| **Revision history + Restore in editor** | Git history in the UI; one-click restore. Not all expose this. |
| **Granular roles** | Admin / editor / viewer; UI and API enforce it. Good for teams and compliance. |
| **Self-hosted / VPS** | No lock-in; your server, your data. Many alternatives are SaaS or extension-only. |
| **SvelteKit + static** | One stack for site and Studio. Appeals to Svelte/static ecosystem. |

**One-liner:**  
*“The only git-native Studio that ships **with** your SvelteKit site, design skins from Figma, block builder, review workflow, and self-hosted deployment—and can add **AI in the editor** so content and SEO get better without leaving the app.”*

---

## 3. Using AI to Make It Special and Viable

AI doesn’t replace “why ours”—it **adds a reason** to choose this over others. In a crowded space, **“AI-assisted content and SEO inside the same Git-native Studio”** is a clear differentiator. Sitepins has some AI; few combine it with **bundled site + design skins + blocks + self-hosted**.

Below: **concrete AI features** that fit the current architecture (no DB; content in Git; server can call APIs).

---

### 3.1 Content Assist (in the editor)

| Feature | What it does | How it fits |
|--------|--------------|-------------|
| **Suggest next paragraph** | User selects text or cursor at end; “Suggest next” calls LLM; result can be inserted (user commits). | No schema change; optional button in TipTap; server endpoint with API key. |
| **Shorten / expand / change tone** | “Make it shorter”, “Make it formal”, “Expand this”. | Same: selection + action → LLM → suggest text; user accepts and saves. |
| **Generate meta description** | From current body text → one short sentence for `<meta name="description">`. | Prefill description in sidebar or in SEO panel; save to frontmatter. |
| **First draft from outline** | User writes bullets; “Generate draft” → full paragraphs. | Optional “AI” tab or button in editor; output goes into editor; user edits and saves. |

**Why it stands out:** Most git CMS don’t have in-editor AI. You’re not “repetitive”—you’re “Git + design system + **AI in the same UI**.”

---

### 3.2 SEO and Accessibility (AI-assisted)

| Feature | What it does | How it fits |
|--------|--------------|-------------|
| **Suggest alt text for images** | In media library or in editor: “Generate alt text” for selected image. | Server calls vision/LLM API; suggest alt; user accepts; store in frontmatter or in content. |
| **Improve heading structure** | “Suggest better headings” for current page (H1/H2/H3). | LLM reads body; returns suggested headings; user applies and saves. |
| **Keyword suggestions** | From page content → list of keywords for SEO. | Show in Settings/SEO or in editor sidebar; user can copy to meta/keywords. |
| **Readability check** | Score + “Simplify this paragraph.” | Run on save or on demand; suggest simpler wording. |

**Why it stands out:** SEO and a11y are pain points; doing them **inside** Studio, with AI, without another tool, is a clear plus.

---

### 3.3 Media and Structure

| Feature | What it does | How it fits |
|--------|--------------|-------------|
| **Auto-tag / alt for uploads** | On upload (or from Media): generate caption/alt/tags. | Server-side after upload; write to frontmatter or to a sidecar; user can edit. |
| **“Suggest a CTA” or “Suggest related links”** | From current page content → suggested block (text + link). | Output structured block or markdown; user adds to page and commits. |
| **Structure check** | “This page could use: intro, list, CTA.” | LLM analyzes body; returns suggestions; user chooses; no auto-commit. |

**Why it stands out:** Turns “we have blocks” into “we have **AI-suggested** blocks and better media metadata.”

---

### 3.4 Optional: Translation and Compliance

| Feature | What it does | How it fits |
|--------|--------------|-------------|
| **Translate page** | “Translate to Spanish” → new file or branch (e.g. `content/about.es.md`). | Server calls translate API; create/update file via GitHub API; user reviews and commits. |
| **Compliance / tone check** | “Check for inclusive language” or “Make it more formal.” | Same pattern: selection → LLM → suggest; user applies. |

**Why it stands out:** Multi-language and compliance are enterprise-friendly; doing them in a git-native way is differentiated.

---

### 3.5 Implementation Notes (no big arch change)

- **Where:** New server routes under `/studio/api/ai/...` (e.g. `suggest-next`, `meta-description`, `alt-text`, `translate`). All **admin/editor only**.
- **Secrets:** API key (OpenAI, Anthropic, or other) in env; never sent to the client.
- **Model:** Server receives selection or full body → calls provider → returns suggestion; client shows in UI; **user** decides to apply and save. No automatic commits.
- **Git-native:** All persisted content still goes through the normal save/commit flow. AI only **suggests**; the human commits. That keeps audit trail and control.

---

## 4. What Makes This Stand Out (Summary)

**Without AI:**  
Bundled SvelteKit site + Studio, design skins from Figma, block builder, change requests, scheduled publish, revision/restore, roles, self-hosted. **That combo** is already rare.

**With AI:**  
Same as above, plus **AI in the editor** (suggest next, shorten, tone, meta description, alt text, headings, readability, optional translate). That makes it **“the git-native Studio that also helps you write and optimize content.”**

**Elevator pitch:**  
*“Git-native Studio that ships with your SvelteKit site: design skins, blocks, review workflow, scheduled publish, and AI-assisted content and SEO—self-hosted, one repo, one deploy.”*

**Why someone would buy (even with competitors):**  
They want **this stack** (SvelteKit, Git, static, self-hosted) and **this workflow** (design system + blocks + review + schedule) and, if you add it, **AI that lives inside the same UI** instead of in another tab or tool. That’s the special; that’s what makes it viable as a product.
