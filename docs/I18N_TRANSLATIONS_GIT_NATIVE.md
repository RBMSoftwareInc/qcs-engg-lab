# Multi-Language (i18n) for the Git-Native Website Builder

This doc describes how to add **translations / multiple languages** to the site and Studio while staying **git-native**: content stays in the repo as files, each locale is explicit in the filesystem, and Studio can edit per-locale content.

---

## Translation strategy: two approaches

**Do we maintain translated data in paths, or do translations happen at runtime (e.g. AI)?** You can do either; they’re different strategies.

### Strategy A: Translated content in the repo (git-native, recommended)

- **You maintain translated data in paths.** Each language has its own files, e.g. `content/en/pages/home.json`, `content/fr/pages/home.json`.
- **No runtime translation.** The site serves the file that matches the requested locale. No AI or external API is called when a user visits the page.
- **How the content gets there:** Humans write or edit per locale in Studio, and/or you use an AI or translation utility **once** to generate the translated file, then commit it. After that, the translation is just a normal file in git.
- **Pros:** Fast, offline-friendly, versioned, editable in Studio, no per-request cost, full control over wording.
- **Cons:** You must create and update each locale’s content when copy changes.

This is the strategy the rest of this doc assumes: **content layout, routing, loaders, and Studio are all designed around “one file per (logical piece of content × locale)”.**

### Strategy B: Runtime translation (AI or translation API)

- **You do not maintain separate files per language.** Content exists in one language (e.g. English). When a user requests another language, the app calls an AI or translation API (e.g. DeepL, Google Translate, or an LLM) and serves the translated result.
- **Translations happen at runtime.** No `content/fr/...` files; the system translates on the fly (or caches translated output in a DB/cache).
- **Pros:** Single source of truth; add a new language without duplicating files.
- **Cons:** Depends on external service, latency/cost per request, less control over quality, not git-native (translated text isn’t in the repo).

This doc does **not** describe Strategy B in detail. If you want runtime translation, you’d add a translation layer in front of your content loader or in the route handler and integrate an API/LLM there.

### Hybrid (common in practice)

- Use **Strategy A for storage** (translated content in paths, git-native).
- Use **AI or a translation utility only to generate those files**: e.g. “Translate this page to French” in Studio calls an API, writes the result to `content/fr/pages/about.json`, and the user can then edit it. So: **translation tooling to populate/maintain files, but no runtime translation.**

---

## Goals (for Strategy A)

- **Provide or build the website in several languages** (e.g. EN, FR, DE, ES).
- **Git-native**: translations are real files in the repo (MD/MDX under `content/`, block pages under `content/pages/` or locale-scoped equivalent).
- **Studio**: editors create and edit content per language; optional “Translate” action that uses AI/utility to generate a new locale file, then it’s maintained like any other file.
- **Resulting website**: URL reflects language (SEO-friendly), locale switcher, correct `lang` and `hreflang`.

---

## 1. Content layout (git-native, Strategy A)

Two patterns fit a git-native setup; **Option A** is recommended.

### Option A: Locale as first path segment (recommended)

Mirror the whole content tree per locale:

```
content/
  en/                    # default locale (or use "content/..." without prefix; see below)
    hero/
      intro.mdx
    signals/
      ai-integration-patterns.mdx
    pages/
      home.json
      about.json
  fr/
    hero/
      intro.mdx
    signals/
      ai-integration-patterns.mdx
    pages/
      home.json
      about.json
  de/
    ...
```

- **MD/MDX**: path becomes `content/{locale}/{type}/{slug}.mdx` (e.g. `content/fr/signals/ai-integration-patterns.mdx`).
- **Block pages**: `content/{locale}/pages/{slug}.json` (e.g. `content/fr/pages/home.json`).
- **Default locale**: Either:
  - **Strict**: All content under locales; default is e.g. `content/en/...`.
  - **Backward compatible**: Keep current tree as “default” (e.g. `content/signals/...`, `content/pages/...`) and treat it as one locale (e.g. `en`). New locales use `content/{locale}/...`.

Benefits: clear in git, easy to branch per locale, simple globs per locale.

### Option B: Locale as file suffix

Same directory structure; locale in the filename:

```
content/
  signals/
    ai-integration-patterns.en.mdx
    ai-integration-patterns.fr.mdx
  pages/
    home.en.json
    home.fr.json
```

- Slug is the same across locales; locale is the suffix.
- Slightly more compact for “one folder per topic,” but mixed locales in one dir; tooling must parse suffix.

**Recommendation:** Use **Option A** for consistency and simpler “everything for locale X is under `content/{locale}/`.”

---

## 2. Configuration: supported locales

Add a small config that defines:

- **Supported locales**: e.g. `['en', 'fr', 'de', 'es']`.
- **Default locale**: e.g. `en`.
- **Locale labels** (for UI): `{ en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español' }`.

Place it where the rest of app config lives (e.g. in `src/lib/` or a config module). Example:

```ts
// e.g. src/lib/i18n.ts or config/i18n.ts
export const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};
```

Studio and the site both use this so “available languages” are defined in one place.

---

## 3. Routing on the website (SEO-friendly)

- **URLs include locale**: e.g. `/en/page/about`, `/fr/signals/ai-integration-patterns`, `/de/insights/...`.
- **Default locale**: Either:
  - **Prefix always**: `/en/page/about` and `/fr/page/about` (simplest, symmetric), or
  - **Omit for default**: `/page/about` = English, `/fr/page/about` = French (shorter default URLs).
- **Locale param**: Use a single layout that reads `[locale]` and validates it against `SUPPORTED_LOCALES`; 404 or redirect for unknown locale.

Suggested SvelteKit structure:

- **With locale prefix (recommended):**
  - `src/routes/[locale]/page/[slug]/+page.server.ts`
  - `src/routes/[locale]/signals/[slug]/+page.server.ts`
  - … same for other content types.
  - Root layout under `[locale]` so every page has a `locale` in `params` and in `data`.

- **Layout load**: In `+layout.server.ts` under `[locale]`, load locale from `params.locale`, validate, and pass to layout so the whole tree can use it (menus, locale switcher, etc.).

---

## 4. Loaders and data layer

### 4.1 MDX / MD content

- **Glob**: Either one glob that includes locale, or a build-time list of locales and glob per locale.
  - Example: `content/**/*.mdx` → then filter by path containing `/${locale}/` (Option A), or
  - Glob `content/{locale}/**/*.mdx` for each `locale` in `SUPPORTED_LOCALES`.
- **loadMDXContent(status, locale?)**: Add optional `locale`; when provided, only return items under `content/{locale}/`. For “default locale as legacy path,” either map default to `content/...` (no segment) or to `content/en/...`.
- **loadMDXBySlug(slug, status, locale?)**: Same; resolve file under the given locale.
- **Route generation**: `generateRoute(type, slug, locale)` should produce `/${locale}/signals/${slug}` etc., so links and `entries()` stay correct.

### 4.2 Block pages (`content/pages/*.json`)

- **Paths**: With Option A, `content/{locale}/pages/{slug}.json`.
- **getPageSlugs(locale?)**: List slugs for that locale (scan `content/{locale}/pages/` or, for default, `content/pages/` if you keep backward compat).
- **getPageBySlug(slug, locale?)**: Read the JSON for that slug in that locale; return `PageModel | null`.

Backward compatibility: if `locale === DEFAULT_LOCALE` and you keep current tree, you can still resolve `content/pages/{slug}.json` when `content/{locale}/pages/{slug}.json` is missing.

### 4.3 Content indexer (Studio)

- **indexContent(contentDir, locale?)**: When indexing for Studio, either:
  - Index all locales (each file has a `locale` field derived from path), or
  - Index a single locale at a time (e.g. dropdown “Edit language: EN | FR”).
- **Grouping**: Group by `locale` and then by category so editors see “English → signals”, “French → signals”, etc.

---

## 5. Studio: editing and creating translated content

- **Settings → Locales**: A simple screen that lists `SUPPORTED_LOCALES` (and maybe allows enabling/disabling per deployment). No need to store in git if locales are fixed in config; if you want per-site config, store e.g. `content/config/locales.json` or in studio config.
- **Content list**: For each “logical” piece of content (e.g. slug `ai-integration-patterns`), show which locales exist (e.g. EN ✓, FR ✓, DE ✗). Click to edit that locale’s file.
- **Edit screen**: Edit is always for a single (slug, locale). URL can be `/studio/edit/ai-integration-patterns?locale=fr` or `/studio/edit/fr/ai-integration-patterns`. Save writes to `content/{locale}/signals/ai-integration-patterns.mdx`.
- **New content**: When creating a new page/article, let user pick the locale (and optionally “copy from another locale” to bootstrap).
- **“Translate” action (optional)**: Button “Create French version” that:
  - Copies the current file to `content/fr/...` with same slug, or
  - Calls an AI translate API and writes the result to the new locale file. Still git-native (new file in repo).

---

## 6. Resulting website: UI and SEO

- **Locale switcher**: In header or footer, links to the same “logical” page in other locales (e.g. “EN | FR | DE”). Build URL from current path and swap `[locale]` (e.g. `/en/page/about` → `/fr/page/about`). For homepage, `/en` and `/fr`.
- **`<html lang="">`**: Set from `params.locale` (e.g. `lang="fr"` for French).
- **`og:locale`**: Set per page from `params.locale` (e.g. `fr_FR`).
- **`hreflang`**: For each page, emit `<link rel="alternate" hreflang="x-default" href="...">` and one per supported locale pointing to the same logical page in that locale. Helps search engines and avoids duplicate-content issues.

---

## 7. Implementation order (summary)

1. **Config**: Add `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_LABELS` (and optionally a small `content/config/locales.json` or studio config for overrides).
2. **Content layout**: Decide default-locale strategy (all under `content/{locale}/` vs. current tree as default). Move or duplicate one locale (e.g. `en`) into `content/en/...` and adjust one loader to accept `locale`.
3. **Block pages**: Extend `getPageBySlug` / `getPageSlugs` with `locale`; add `content/{locale}/pages/` (or keep `content/pages/` for default).
4. **Routes**: Introduce `[locale]` (e.g. `src/routes/[locale]/page/[slug]/...`). In load functions, pass `params.locale` into loaders. Add layout that validates locale and provides it.
5. **MDX loader**: Add `locale` to `loadMDXContent` / `loadMDXBySlug` and route generation; wire `entries()` for static build to all (slug, locale) pairs.
6. **Studio**: Content API and indexer return or filter by locale; edit/new URLs include locale; optional “Translate” action.
7. **Front-end**: Locale switcher, `lang`, `og:locale`, `hreflang`.

This keeps everything **git-native**: every translation is a file in the repo, editable in Studio and via git, with clear URLs and SEO behavior for a global website builder.

---

## 8. Implementation sketch (started in codebase)

- **`src/lib/i18n.ts`**: Defines `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_LABELS`, `LOCALE_OG`, `isValidLocale()`, `getLocaleFromParam()`. Use this everywhere locale is needed.
- **`src/lib/content/pages.ts`**: Already extended with optional `locale`:
  - `getPageSlugs(locale?)` / `getPageBySlug(slug, locale?)` resolve under `content/{locale}/pages/` when locale is set; otherwise `content/pages/` (backward compatible).
  - `savePageToLocal(slug, page, locale?)` writes to the same paths.
- **Next steps**: Add `[locale]` routes (e.g. `src/routes/[locale]/page/[slug]/+page.server.ts` that calls `getPageBySlug(params.slug, params.locale)`), layout that validates `params.locale`, then extend MDX loader and Studio content API/indexer to accept and filter by locale.
