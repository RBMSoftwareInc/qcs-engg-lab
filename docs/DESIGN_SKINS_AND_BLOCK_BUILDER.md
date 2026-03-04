# Design Skins, Figma Import & Block-Based Building (Git-Native)

This doc answers: (1) whether design skins and Figma import are compatible with a git-native UI designer, (2) how custom styles and visual builders (block-based, widgets, accordions, tiles, cartridge) fit in, and (3) how to map pages or content fragments to blocks like WordPress/Elementor—fully in the repo, as an alternative or complement to Figma.

---

## 1. Design Skins + Figma Import: Compatible with Git-Native?

**Yes.** The current setup is already git-native and compatible with a “git-native UI designer” in the sense that **nothing at runtime depends on Figma**.

- **Figma import** only pulls **design tokens** (colors, typography, spacing) from a Figma file via the Figma API. It does **not** import layout, frames, or components. Output is:
  - `design/skins/<name>.json` — token data
  - `design/skins/<name>.css` — generated CSS variables (`--color-primary`, `--font-body`, `--space-md`, etc.)
- **Active skin** is stored in `design/active-skin.json` (which skin name is active). The site (or Studio preview) loads that skin’s CSS so the **theme** is driven from the repo.
- All of this lives in the repo and is committed via the GitHub API. There is no database and no runtime Figma dependency; Figma is only used at **import time** to seed tokens.

So: **design skins and Figma import are compatible with a git-native UI designer.** They provide a **theme layer** (tokens → CSS variables). They do **not** provide page structure, sections, or blocks; that’s a separate layer (see below).

---

## 2. What Exists Today vs What’s Missing

| Layer | Today | Missing for “Elementor-like” |
|-------|--------|------------------------------|
| **Theme / look** | Design skins (Figma or manual tokens) → CSS variables | Optional: more tokens, or “custom CSS” file in repo |
| **Layout / structure** | Layout **contracts** (hero, article, card, grid, default) with **slots**; code-defined, not editable as blocks in Studio | **Page = list of blocks**; editor chooses blocks and fills props; blocks stored in Git |
| **Content** | Markdown + frontmatter per file; loaded by directory (e.g. `content/insights/*.md`) | **Content fragments** (reusable text/media/list) that blocks can reference; optional fragment store in repo |
| **Rendering** | Routes use fixed Svelte structure (e.g. hero, practice grid, article layout); frontmatter is freeform | **Block renderer**: page model (list of blocks) → render each block by type with a Svelte component |

So:

- **Figma / design skins** = theme only; already git-native.
- **Custom styles** = today you can add tokens (Figma or manual); to go further you’d add things like a `design/custom.css` (or per-skin overrides) in the repo.
- **Block-based, widgets, accordions, tiles, cartridge** = **not** implemented yet. You have the right **concept** (layout contracts with slots and components), but:
  - Layouts are **one per content type** (or route), not “this page = these N blocks.”
  - There is no **block registry** that the editor can pick from, no **page model** (e.g. JSON array of blocks), and no **content fragments** that blocks reference.

---

## 3. How It Can All Work Together (Fully Git-Native)

The idea is to add a **block-based page model** that stays 100% in the repo and works **alongside** (not instead of) design skins. Figma/skins stay the **theme**; blocks define **structure and mapping** of content to the UI.

### 3.1 Block registry (like layout contracts, but for blocks)

- **Code-defined** list of block types, e.g.: `hero`, `tile`, `accordion`, `card`, `cta`, `testimonial`, `cartridge`, `grid`, `text`, `image`, `embed`, etc.
- Each block type has:
  - **Slots/props** (e.g. title, items, image, link) — same idea as layout contracts.
  - **Svelte component** to render it.
- Stored in code (e.g. `src/lib/studio/block-registry.ts` or similar), not in the CMS. No DB.

### 3.2 Page model (page = list of blocks)

- Each **page** (or “template”) is a list of blocks. For example:
  - **Option A:** Frontmatter in a markdown file, e.g. `blocks: [{ type: 'hero', props: { title: '...', subtitle: '...' } }, { type: 'accordion', props: { items: [...] } }]`. Body can be fallback or one big “content” block.
  - **Option B:** Dedicated page files, e.g. `content/pages/home.json` or `content/pages/about.json`, with structure: `{ "blocks": [ { "type": "hero", "props": { ... } }, ... ] }`.
- All of this lives in the repo (Markdown + frontmatter or JSON). Studio (or a future “page builder” UI) would edit this structure.

### 3.3 Content fragments (optional but useful)

- **Fragments** = reusable content blobs: e.g. “intro copy”, “pricing table”, “team list”. Stored as files (e.g. `content/fragments/intro.md`, or JSON with structured fields).
- Blocks can **reference** a fragment by id/path instead of inlining content. Example: `{ type: 'tile', props: { fragmentId: 'intro' } }` or `contentRef: 'fragments/faq'`.
- Mapping “content fragments to blocks” = a block’s `props` (or a dedicated `contentRef`) point at a fragment; the renderer loads that fragment and passes it into the block component. Still no DB; fragments are just files in `content/` (or a dedicated `content/fragments/`).

### 3.4 Custom styles (beyond Figma tokens)

- **Today:** Only design tokens (from Figma or manual) → CSS variables. Design skins are the only “custom styles” at theme level.
- **Extensions that stay git-native:**
  - **Custom CSS file:** e.g. `design/custom.css` (or per-skin override) editable in Studio and committed to the repo. Loaded after the active skin so it overrides tokens or adds one-off styles.
  - **Per-block or per-section overrides:** If blocks have a `style` or `className` (or a small set of allowed overrides) in the page model, the renderer can apply them. Stored in the same page JSON/frontmatter; no DB.

### 3.5 Renderer: page → blocks → UI

- A **single** Svelte component (e.g. `BlockRenderer.svelte`) receives the page model (`blocks: [...]`).
- For each block it:
  - Looks up the block type in the **block registry**,
  - Resolves any **content fragment** refs (load fragment from repo/build),
  - Renders the corresponding Svelte component with merged props + fragment content.
- Active **design skin** is already applied at the layout/root level (CSS variables), so blocks automatically use the same theme. No conflict with Figma import.

### 3.6 Studio: “Page builder” vs “Figma import”

- **Figma import** = one-time or occasional: pull tokens into `design/skins/<name>`. Theme only.
- **Block-based builder** = per-page: pick blocks, set props, optionally link fragments. Structure only.
- They are **complementary**: Figma/skins = look; blocks = structure and mapping of content to widgets (accordions, tiles, cartridge, etc.). You can do **both**; you can also do **only** blocks and no Figma (manual tokens or custom CSS only).

So: **Yes, a full block-based, widget/accordion/tile/cartridge system is doable entirely as a git-native alternative (or complement) to Figma.** Figma is only one way to get the **theme**; the **structure** is blocks + page model + optional fragments, all in the repo.

---

## 4. Mapping Pages / Content Fragments to Blocks (WordPress/Elementor-like)

Conceptually:

- **Page** = ordered list of block instances (each has `type` + `props`).
- **Content fragment** = a content file (markdown or JSON) that can be **referenced** by block `props` (e.g. `fragmentId: 'faq'` or `contentPath: 'fragments/faq'`). The renderer loads it and passes it into the block.
- **Mapping** = which block type is used for which “slot” on the page, and which fragment (if any) feeds that block. No separate “mapping table”; the mapping is the page model itself (block order + props + refs).

Example:

- Page “Home”: blocks = `[ { type: 'hero', props: { title: '...', subtitle: '...' } }, { type: 'accordion', props: { fragmentId: 'faq' } }, { type: 'tile', props: { items: [...] } } ]`.
- Fragment `faq` = `content/fragments/faq.md` (or JSON) with title + list of Q&A. The accordion block component receives that content and renders it.

All of this can live under `content/` and optional `design/custom.css`, with no database.

---

## 5. Summary Table

| Question | Answer |
|----------|--------|
| Are design skins / Figma import compatible with git-native UI designer? | **Yes.** Tokens and skins live in the repo; no runtime Figma. |
| Can CMS designer introduce custom styles? | **Partially today** (tokens only). Can add: custom CSS file in repo, more tokens, or per-block style overrides in page model. |
| Block-based, widgets, accordions, tiles, cartridge? | **Not yet.** Achievable by: block registry (code) + page model (blocks in frontmatter or JSON) + block renderer. All git-native. |
| Map pages / content fragments to blocks like WordPress/Elementor? | **Doable.** Page = list of blocks; blocks reference fragments by id/path; renderer resolves and renders. No DB. |
| Entirely as alternative to Figma import? | **Yes.** Figma = theme (tokens). You can skip Figma and use only manual tokens + custom CSS. Block-based structure is independent and can be the main “designer” for layout and content mapping. |

---

## 6. Suggested Next Steps (If You Add Block-Based Building)

1. **Block registry** — Extend or mirror `layout-contracts.ts` with a **block registry** (block type → slots/props + Svelte component name). Start with a small set: e.g. hero, accordion, tile, card, cta, text, image.
2. **Page model** — Decide format: frontmatter `blocks:` array vs dedicated `content/pages/*.json`. Implement loader that returns page = list of blocks.
3. **Block renderer** — One component that takes `blocks`, looks up each type, resolves fragment refs, and renders the right Svelte component with props.
4. **Content fragments** — Optional: add `content/fragments/` and resolve `fragmentId` / `contentPath` in the renderer.
5. **Studio UI** — “Page builder” view: list of blocks, add/remove/reorder, edit props (and optionally pick fragment). Saves back to the same page file in the repo.
6. **Custom styles** — Optional: add `design/custom.css` (or skin-specific override) editable in Studio and loaded after the active skin.

This keeps everything file-based and Git-native while giving you block-based, widget-style building and clear mapping of pages and fragments to blocks—with or without Figma import for the theme.
