# Content vs Pages, and UI Tech for the Git-Native CMS

This doc covers: (1) advantages of MD/MDX vs page-based (blocks) for a git-native CMS, (2) why both are relevant, (3) other formats that support the architecture, and (4) modern UI technologies for maximum impact—not only look and feel, but **ease of use**, **customer-friendly** and **design-friendly** workflows, **less time** to build and change, **quick and simple** patterns, and **HTML’s latest** features that deliver an “awestruck” experience with minimal code.

---

## 1. MD/MDX vs Page-Based (Blocks): Advantages

### MD/MDX (article/document content)

| Advantage | Why it fits git-native |
|----------|------------------------|
| **Plain-text, diff-friendly** | Every change is a clear line diff in Git; merge conflicts are readable and resolvable. |
| **Portable** | No lock-in; any SSG or tool can read Markdown/MDX. |
| **Schema in frontmatter** | Type, status, title, description live in the file; one file = one source of truth. |
| **Status workflow** | `draft → review → live` is just a field; no DB; build filters by status. |
| **SEO and redirects** | `legacyUrl`, `publishedAt`, etc. in frontmatter; redirect generator reads repo. |
| **Component-in-content** | MDX lets you embed `<Figure>`, `<Diagram>` etc. while staying in Git. |
| **Tooling** | Triage, migration, linting all operate on files; no API or DB. |

Best for: long-form articles, insights, signals, services, domains—anything that is “document-first” and benefits from versioned, reviewable text.

### Page-based (blocks JSON)

| Advantage | Why it fits git-native |
|----------|------------------------|
| **Structure as data** | Page = `{ blocks: [...] }` in JSON; still a file in the repo, versioned and diffable. |
| **Visual composition** | Non-writers can build landing/home pages by choosing blocks and filling props. |
| **Design-system aligned** | Blocks map to your block registry (Hero, CTA, Card, etc.); one component per type. |
| **No prose required** | Good for marketing/home pages where layout and CTAs matter more than long text. |
| **Design skins apply** | Blocks use CSS variables from the active skin; theme is consistent. |
| **Builder in Studio** | Edit blocks in UI; save writes JSON to `content/pages/*.json` via Git/GitHub API. |

Best for: home, landing, campaign pages—anything that is “layout-first” and composed of sections rather than one long article.

---

## 2. Are Both Relevant for Our Git-Native CMS?

**Yes.** They serve different jobs and both align with the architecture:

- **Git as source of truth** — MD/MDX files and page JSON files both live under `content/` and are committed. No database.
- **Static build** — MDX loader and page loader both run at build time; routes are pre-rendered.
- **Studio edits and saves** — Content (MD) is edited in TipTap and saved via content/save API; pages (JSON) are edited in the Builder and saved via pages API. Both persist to the repo.
- **One deploy** — Same SvelteKit app serves article routes (e.g. `/signals/[slug]`, `/insights/[slug]`) and block-built routes (`/page/[slug]`).

So:

- Use **MD/MDX** for: insights, signals, services, domains, philosophy, about—anything document/article-style with status and optional MDX components.
- Use **page-based (blocks)** for: home, landing, or campaign pages built from Hero, CTA, Card, etc., edited in the Builder.

They complement each other; no need to choose one only.

---

## 3. Other Formats / Features That Support the Architecture

These already exist or are designed to fit the same repo-first, no-DB model:

| Feature | Role | Benefit |
|---------|------|--------|
| **Design skins** | Tokens (Figma or manual) → `design/skins/*.css`; active skin in `design/active-skin.json` | Theming without DB; all in repo; blocks and MDX both use CSS variables. |
| **Content fragments** (optional) | Reusable blobs, e.g. `content/fragments/faq.md` or JSON | Blocks (or MDX) reference by path; less duplication, still file-based. |
| **Menus / config** | `config/menus.json`, branding, SEO, etc. | Site structure and settings in repo; Studio settings pages read/write these. |
| **Media** | Files under `static/` or `content/`; paths in content or block props | No media DB; “media library” is just listing committed assets. |
| **Layout contracts** | Code-defined layouts (hero, article, grid) with slots | Reuse same layout across content types; no layout stored in DB. |
| **Change requests** | Stored in config; merge/reject via API then commit | PR-style workflow in app; state in repo or config, not DB. |
| **Scheduled publish** | `publishAt` in frontmatter; job sets `status: live` and commits | Time-based publishing without a scheduler DB; single source in frontmatter. |

All of these keep the model: **content and configuration as files, Git as source of truth, static build, Studio as editor.**

---

## 4. Latest UI Tech: Max Output, Less Code — Ease of Use, Customer- & Design-Friendly, Quick & Awestruck

Goal: **Ease of use** for editors and visitors, **customer-friendly** (accessible, predictable, fast), **design-friendly** (change look and layout with minimal code), **less time** to build and iterate, and **quick, simple patterns** using **HTML’s latest** so the result feels modern and “awestruck” without heavy custom JS.

---

### 4.1 Ease of use & customer-friendly (HTML’s latest + accessibility)

Use **native elements and attributes** so the browser handles behavior—less code, better UX, built-in a11y.

| Feature | Why it helps | How |
|--------|--------------|-----|
| **`<dialog>`** | Modals with built-in focus trap, Escape to close, `showModal()` / `close()`. No custom overlay/focus logic. | Use for Studio modals, confirmations, forms. `dialog.showModal()` and `dialog.close()`; style with `::backdrop`. |
| **Popover API** (`popover` attribute)** | Lightweight “popovers” (dropdowns, tooltips, menus) with top-layer, light dismiss, and focus management. | Use for dropdowns, “more options,” small panels. `<div popover>...</div>` + `showPopover()` / `hidePopover()`. |
| **`inert`** | Mark everything outside a modal as non-interactive; screen readers and keyboard skip it. | Set `inert` on a wrapper when a dialog is open; remove when closed. Complements `<dialog>`. |
| **Native form validation** | `required`, `pattern`, `minlength`, `type="email"` etc.; browser shows messages; less custom JS. | Use on Studio and site forms; add `aria-describedby` to link error messages for a11y. |
| **`:focus-visible`** | Show focus ring only for keyboard, not mouse—clear for keyboard users, no clutter for mouse. | Style `:focus-visible` (and optionally `outline: none` on `:focus`) so focus is obvious when it matters. |
| **Skip link** | “Skip to main content” at top of page; one link, huge win for keyboard and screen-reader users. | First focusable element: `<a href="#main">Skip to content</a>`; give main content `id="main"`. You have this in accessibility config. |
| **Semantic HTML** | `<main>`, `<nav>`, `<article>`, `<section>`, `<search>`, `<h1>`–`<h6>` give structure and landmarks. | Use everywhere; screen readers and assistive tech rely on it; no extra code. |
| **`prefers-reduced-motion`** | Respect users who need less motion. | You already have a block in `global.css`; wrap new animations so duration is near-zero when reduced. |

Result: **Easier to use** (predictable modals, forms, focus), **customer-friendly** (accessible, fast, no surprises), **less code** (no custom modal/popover/focus logic).

---

### 4.2 Design-friendly (change look and layout with minimal code)

Make it **quick** for designers to try variations and for devs to apply them with **less time** and fewer one-off overrides.

| Feature | Why it helps | How |
|--------|--------------|-----|
| **Design tokens (CSS variables)** | One place (skin) controls colors, spacing, radius, motion. Change skin → whole site and Studio update. | Already in place; use tokens for every new component (padding, gap, border-radius, transition-duration). |
| **Container queries (`@container`)** | Component layout depends on **its container** size, not viewport. Same card in sidebar vs main column adapts automatically. | `container-type: inline-size` on wrapper; `@container (min-width: 400px) { ... }` for card/section layout. Designers can think “this block in narrow vs wide” without new components. |
| **`:has()`** | Style a parent based on children (e.g. “card that has an image,” “form row that has an error”). | Use for form validation styling, card variants, nav with active item—no extra classes or JS. |
| **Logical properties** | `margin-inline-start`, `padding-block`, `inset-inline`—layout that flips with direction (RTL/LTR). | Use in global and component CSS; one layout works for LTR and RTL; design-friendly for i18n. |
| **CSS nesting** | Nest selectors inside a component block; less repetition, clearer scope. | Use in Svelte `<style>` or global CSS where supported; keeps design rules colocated. |
| **Subgrid** | Child grid can align to parent grid rows/columns—complex layouts with simple markup. | Use for card grids, dashboards; designers get alignment control without nested hacks. |

Result: **Design-friendly** (tokens + container queries + `:has()` = fewer code changes for design iterations) and **less time** (one change in skin or container, not N component tweaks).

---

### 4.3 Less code, less time — declarative patterns

Prefer **declarative HTML/CSS** and **platform features** so behavior and polish come from the browser and framework, not custom scripts.

| Feature | Why it helps | How |
|--------|--------------|-----|
| **Svelte 5 (runes, snippets)** | Less boilerplate; reactive state and derived values with minimal code. | Use `$state`, `$derived`, `$effect`, snippets; keep components small and readable. |
| **View Transitions (SvelteKit / native)** | Smooth page or list changes (e.g. content list → edit) with little code. | Use SvelteKit’s transition directives or View Transitions API; assign `view-transition-name` for shared-element feel where it adds value. |
| **CSS scroll-driven animations** | Parallax, “reveal on scroll,” progress-based effects **without JS**. | `animation-timeline: scroll()`, `view()`; use sparingly on hero or key sections for a polished feel. |
| **Staggered list animations** | List items animate in/out in sequence; feels high-quality with a few lines. | Svelte `in:animate` / `out:animate` with delay based on index; or CSS `animation-delay` with `nth-child`. |
| **Fluid typography** | Type scales smoothly with viewport; one formula, no breakpoint soup. | `font-size: clamp(min, preferred, max)` (e.g. `clamp(1rem, 2vw + 1rem, 1.5rem)`); put in design tokens. |

Result: **Quick to implement**, **simple** to maintain, and a more **awestruck** feel (smooth transitions, scroll effects, fluid type) with minimal custom logic.

---

### 4.4 HTML’s latest: quick wins that wow

Concrete **modern HTML/CSS/JS** features that give a lot for a little—ease of use, customer-friendly, and “awestruck” without bloat.

| Technology | Ease of use / Customer-friendly | Design-friendly / Less time | Awestruck (simple but impressive) |
|------------|----------------------------------|-----------------------------|-----------------------------------|
| **`<dialog>` + `::backdrop`** | Modals that “just work”; focus and Escape handled. | Style once with tokens; reuse everywhere. | Feels native and polished. |
| **Popover API** | Dropdowns/tooltips without focus traps and z-index hacks. | One pattern for all popovers. | Clean, predictable overlays. |
| **`inert`** | Backdrop truly non-interactive; better a11y. | No extra “blocking” divs. | Modal feels correct. |
| **`<search>` or `role="search"`** | Clear landmark for search; better for assistive tech. | Semantic; no design change. | Professional structure. |
| **`view-transition-name`** | Shared-element transitions (e.g. card → detail) with minimal code. | Define once per “named” element. | Smooth, app-like navigation. |
| **Scroll-driven animations** | Reveal, parallax, progress—no JS. | Tweak in CSS only. | Depth and polish. |
| **Container queries** | One component, many contexts. | Designer asks “narrow/wide”; you use `@container`. | Layout feels intelligent. |
| **`:has()`** | Parent reflects child state (error, empty, focused). | No extra classes or JS. | UI feels responsive to content. |
| **Glass / blur** | `backdrop-filter: blur()` on nav or modals. | One token for blur radius. | Modern, refined look. |

---

### 4.5 Already in your stack (leverage more)

- **Design tokens** — Use for spacing, motion, radius, typography everywhere so one skin change updates site + Studio.
- **View Transitions** — Enable on key routes (list → edit, page changes) for smooth, app-like feel.
- **TipTap** — Already in Studio; extend only when needed (e.g. AI suggest is already there).
- **Reduced motion** — Keep wrapping new animations so they respect `prefers-reduced-motion`.

---

### 4.6 What to avoid (for your architecture)

- **Heavy JS animation libs** — Prefer CSS + Svelte transitions; smaller bundle, easier to respect reduced motion.
- **Custom modal/popover/focus from scratch** — Use `<dialog>` and Popover API; less code, better a11y.
- **Runtime theme from a DB** — Theme = active skin in repo; no theme API needed.
- **Client-only content loading for main site** — Stay static-first; content in load functions, prerender.

---

## 5. Short Summary

| Question | Answer |
|----------|--------|
| **MD/MDX vs page-based advantages?** | MD/MDX: diff-friendly, portable, schema in frontmatter, workflow, SEO, tooling. Page-based: structure as data, visual composition, design-system blocks, good for landing/home. |
| **Both relevant for git-native CMS?** | Yes. MD/MDX for documents/articles; page-based for composed marketing/landing pages. Both live in repo, static build, Studio edits both. |
| **Other things that support the architecture?** | Design skins, (optional) content fragments, menus/config, media as files, layout contracts, change requests, scheduled publish—all file/repo-centric. |
| **Latest UI tech: ease of use, customer- & design-friendly, less time, quick & awestruck?** | **Ease of use / customer-friendly:** Native `<dialog>`, Popover API, `inert`, native form validation, `:focus-visible`, skip link, semantic HTML, `prefers-reduced-motion`. **Design-friendly:** Design tokens, container queries, `:has()`, logical properties, nesting, subgrid—change look/layout with minimal code. **Less code / quick:** Svelte 5 runes, View Transitions, scroll-driven animations, staggered lists, fluid type. **HTML’s latest:** dialog, popover, view-transition-name, scroll-driven, container queries, `:has()`, glass/blur—simple patterns that feel modern and polished. All in line with static, token-driven, a11y- and reduced-motion-friendly setup. |
