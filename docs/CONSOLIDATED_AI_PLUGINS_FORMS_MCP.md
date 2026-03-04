# Consolidated: AI Features, Plugins, Pre-built Forms, and MCP

One place for: (1) **AI** – where we can use suggestions/enhancements/help, (2) **Plugins** – Studio compatibility and what’s needed, (3) **Pre-built forms/fragments** – current state and readiness, (4) **MCP** – meaning and compatibility, including switching LLMs.

---

## 1. Consolidated List: Where We Can Use AI (Suggestions, Enhancements, Help)

Single checklist. **Type:** S = suggestion (AI proposes; user applies), E = enhancement (AI improves existing content), H = help (AI explains or guides).

| # | Area | Feature | Type | What it does | Where in Studio / site |
|---|------|---------|------|----------------|------------------------|
| 1 | **Content** | Suggest next paragraph | S | From cursor or selection → generate next paragraph | Editor toolbar or right-click |
| 2 | **Content** | Shorten / expand / change tone | E | “Make shorter”, “Expand”, “Make formal/casual” | Editor selection menu |
| 3 | **Content** | First draft from outline | S | Bullets → full draft | Editor “AI” button or panel |
| 4 | **Content** | Improve heading structure | E | Suggest H1/H2/H3 from body | Editor or sidebar |
| 5 | **Content** | Readability check + simplify | E | Score + “Simplify this paragraph” | Editor on save or button |
| 6 | **SEO** | Generate meta description | S | From body → one sentence for `<meta description>` | Editor sidebar or SEO settings |
| 7 | **SEO** | Keyword suggestions | S | From page content → keyword list | Editor sidebar or SEO settings |
| 8 | **Accessibility** | Suggest alt text for images | S | Vision/LLM → alt text for selected image | Media library or editor (image node) |
| 9 | **Accessibility** | Auto alt/caption on upload | E | Generate on upload; store with asset | Media upload pipeline |
| 10 | **Structure** | Suggest CTA or related links block | S | From page content → suggested block (text + link) | Builder or editor |
| 11 | **Structure** | “This page could use: intro, list, CTA” | H | Structure suggestions | Editor or Builder |
| 12 | **Forms / copy** | Suggest form labels or placeholder text | S | Per form type → friendlier labels | Settings → Data Forms or fragment config |
| 13 | **Translation** | Translate page → new file | S | e.g. `about.es.md` | Editor “Translate” action |
| 14 | **Compliance** | Tone / inclusive-language check | E | “Check for inclusive language”, “Make formal” | Editor selection menu |
| 15 | **Help** | “How do I…?” in Studio | H | Answer questions about Studio (docs + LLM) | Studio help panel or chat |
| 16 | **Discovery** | Suggest related content to link | S | From current page → suggest internal links | Editor when inserting link |

**Summary by type:**  
- **S (suggestion):** 1–4, 6, 7, 8, 10, 12, 13, 16  
- **E (enhancement):** 2, 4, 5, 9, 14  
- **H (help):** 11, 15  

All of these can be implemented as server-side AI routes + UI; user always chooses to apply and save (Git-native unchanged).

---

## 2. Plugins: Is Studio Compatible? What’s Needed? Is It Meaningful?

### 2.1 Current State (“Config as Extensibility”)

Studio is **not** a plugin runtime like WordPress. Extensibility today is **config-driven**:

| Mechanism | What’s configurable | Stored where |
|-----------|---------------------|--------------|
| **Block registry** | Which blocks exist (id, name, description) | `config/block-registry.json` or code |
| **Data forms** | Which forms exist; enable/disable | `config/data-forms.json` + code (APIs, modals) |
| **Templates** | List of site templates | `config/templates.json` |
| **Menus** | Nav items, CTAs | `config/menus.json` |
| **SEO** | Meta, GTM, GA | `config/seo.json` |
| **Design skins** | Tokens, active skin | `design/skins/`, `design/active-skin.json` |

So: **no “install a plugin” in the UI.** To add a new form type or block you add code (and optionally extend config). That’s “plugin-compatible” only in the sense that **config** can be edited from Studio; **behavior** is code.

### 2.2 What Would Make It “Plugin” Compatible (Big Ocean of Plugins)

To support something like a **plugin ecosystem** (install without forking), you’d need:

| Capability | What it means | Effort |
|------------|----------------|--------|
| **Plugin manifest / discovery** | List of “plugins” (e.g. from a registry or npm). Each declares: name, version, hooks (e.g. “form”, “block”, “settings tab”). | Medium |
| **Plugin API** | Stable API that plugins call: e.g. `registerForm(schema)`, `registerBlock(definition)`, `registerSettingsSection(component)`. Studio calls these at load. | Medium |
| **Sandbox / load boundary** | Plugins run in a safe boundary (e.g. iframe, or server-side only with a strict schema). | High if client-side; lower if server-only “adapters”. |
| **Versioning & updates** | Plugins have versions; “update” = fetch new definition or bundle. | Medium |
| **Storage for plugin config** | Each plugin can have its own `config/plugins/<plugin-id>.json` or similar. | Low |

**Minimal path to “plugin-like” without full runtime:**

1. **Form schemas in config** – Add `config/form-schemas.json`: list of form types with id, label, fields (name, type, required). Studio + API generate form UI and POST endpoint from schema. New “forms” = add JSON, no new code.  
2. **Block definitions in config** – Already have block registry; extend so a “block” can point to a **snippet** (e.g. markdown fragment or a predefined Svelte component name). Community could contribute block definitions (JSON) without shipping code.  
3. **Optional: npm “plugins”** – Allow “plugins” to be npm packages that export a manifest (forms, blocks). Build step or runtime (server) loads them. Still requires deploy; not “click to install” in UI.

**Is it meaningful here?**  
- **Yes**, for “extend without forking” and for a future **marketplace** (blocks, forms, fragments).  
- **Practical order:** (1) Config-driven form schemas + config-driven block definitions, (2) Optional plugin manifest + load from npm or URL, (3) Full sandboxed runtime only if you need third-party arbitrary code.

---

## 3. Pre-built Fragments / Forms: Are We Ready? Customizable Yet Predefined?

### 3.1 Current State: Pre-built Forms

We **already have** pre-built, configurable forms:

| Form | Label | Enable/disable | Storage | Modal component |
|------|--------|----------------|---------|------------------|
| **inquiries** | Get Started | Studio → Data Forms | `data/inquiries/` | ConversationModal |
| **newsletter** | Newsletter | Same | `data/newsletter/` | NewsletterModal |
| **contact** | Contact | Same | `data/contact/` | ContactModal |
| **waitlist** | Waitlist | Same | `data/waitlist/` | WaitlistModal |
| **feedback** | Feedback | Same | `data/feedback/` | FeedbackModal |
| **demoRequest** | Demo Request | Same | `data/demo-requests/` | DemoRequestModal |

- **Customizable:** Enable/disable per form; storage path in config.  
- **Predefined:** Field set and API are fixed in code (name, email, message, etc.).  
- **Initiate / Getting started:** That’s **Get Started** (ConversationModal) + optional **Demo Request**.

So the platform **is ready** for “pre-built, customizable yet predefined” forms for: Contact, Feedback, Get Started, Newsletter, Waitlist, Demo Request. What’s **not** yet: changing labels/placeholders per form from Studio, or adding **new** form types without code.

### 3.2 Making Forms More “Customizable Yet Predefined”

| Enhancement | What it does | Readiness |
|-------------|--------------|-----------|
| **Per-form labels/placeholders in Studio** | In Data Forms settings: for each form type, edit label, placeholder, submit button text. Stored in `config/data-forms.json` or `config/form-fragments.json`. | Small change: extend config + use in modals. |
| **Form fragments config** | One config (e.g. `config/form-fragments.json`) that defines: id, label, fields (name, type, placeholder, required), submitText, successMessage. Existing forms become entries; new forms = new entry + generic modal + API from schema. | Medium: generic form renderer + dynamic API. |
| **Pre-built “fragments” (sections)** | Reusable UI chunks: e.g. “Contact strip”, “Newsletter CTA”, “Feedback floating button”. Each is a predefined block or component; content (heading, copy) can be overridden in content or config. | Block registry + predefined block types already support this; add fragment library in Builder. |

**Summary:**  
- **Forms:** Ready for the 6 pre-built forms; next step is “customizable labels/placeholders” and then **config-driven form types** (new forms without code).  
- **Fragments:** Pre-built sections (Contact us, Feedback, Get started) are already there as modals + CTAs; “fragments” as reusable blocks can be built on the block registry and a small fragment library (predefined yet overridable).

---

## 4. MCP: How Meaningful and Compatible? Switching Between LLMs?

### 4.1 What Is MCP (Model Context Protocol)?

MCP standardizes how **servers** expose **tools**, **resources**, and **prompts** to **LLM clients** (e.g. Cursor, Claude Desktop). So:

- **Studio as MCP server** → Expose tools like “list content”, “get file”, “save content”, “list media”. Then an LLM (in Cursor or elsewhere) can “edit my site” via MCP.  
- **Studio as MCP client** → Studio could call an MCP server that exposes an LLM or other tools (e.g. “summarize”, “translate”). That can help with **switching between LLMs** if the user’s MCP setup routes to different models.

### 4.2 How Meaningful Is MCP Here?

| Use case | Meaningful? | Why |
|----------|-------------|-----|
| **Studio as MCP server** | **Yes** | Lets devs (or AI agents) list/edit content, read config, trigger builds from Cursor/Claude without opening Studio. Good for automation and “edit site from my IDE.” |
| **Studio as MCP client** | **Optional** | If we want “use whatever LLM the user configured via MCP,” we could call an MCP server that provides a “complete” or “suggest” tool. Less urgent than direct API keys for OpenAI/Anthropic. |
| **Switching between LLMs** | **Yes, but usually without MCP** | In our AI routes we’d have a **provider abstraction**: e.g. `AI_PROVIDER=openai|anthropic|local` and `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`. The Studio UI or env chooses the provider; we don’t need MCP for that. MCP becomes useful if we want “use the model that’s already configured in the user’s MCP client.” |

So: **MCP is meaningful** mainly for **exposing Studio as a tool server** (so external LLMs/agents can act on content). **Switching LLMs** is best done inside Studio via provider + env (and optionally a Studio “AI settings” panel: choose provider, key).

### 4.3 What “Compatible” Would Look Like

| Direction | What to do | Compatibility |
|-----------|------------|---------------|
| **Studio → MCP server** | Implement an MCP server (e.g. with `@modelcontextprotocol/sdk`) that exposes tools: `list_content`, `get_file`, `save_content`, `list_media`, `run_scheduled_publish`. Transport: stdio (local) or SSE/HTTP (remote). Auth: token or session. | Compatible with any MCP client (Cursor, Claude Desktop, etc.). |
| **Studio → MCP client** | If we want AI via “user’s MCP server,” add a client that calls `tools/call` on a configured MCP server (e.g. one that wraps OpenAI/Anthropic). Studio then “uses” that for suggest/complete. | Compatible with MCP servers that expose completion/suggest tools. |
| **Switching LLMs inside Studio** | No MCP required: `AI_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, optional `OPENROUTER_API_KEY`. In Studio Settings → AI: dropdown “Provider” and key (or “use env”). Server-side AI routes choose provider from config. | Works with any provider we implement (OpenAI, Anthropic, OpenRouter, local). |

**Summary:**  
- **MCP:** Most valuable for **Studio as MCP server** (tools for content/config).  
- **Switching LLMs:** Implement as **provider + env (and optional Studio AI settings)**; MCP is optional for “use user’s MCP-configured model.”

---

## 5. Quick Reference Tables

**AI:** Use the consolidated table in §1 for prioritization (e.g. start with meta description, alt text, suggest next).  

**Plugins:** Today = config-driven only. To get “plugin-like” = form schemas + block definitions in config, then optional manifest + npm/URL load.  

**Pre-built forms/fragments:** Six forms exist and are ready; next = per-form labels/placeholders, then config-driven form types and a fragment library for blocks.  

**MCP:** Meaningful as **Studio = MCP server** (expose tools). LLM switching = provider abstraction in our AI routes + env/UI; MCP client optional.
