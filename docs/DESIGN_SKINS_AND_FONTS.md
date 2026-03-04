# Design Skins and Global Fonts

How **global font setup** and **design skins** work, where they live, and how the active skin is applied to the website.

---

## 1. Font global setup: design skins, not a separate setting

**Fonts are part of design skins**, not a separate “Font” item under Studio Settings.

- **Base defaults** live in `src/lib/styles/global.css`: `:root` defines `--font-body`, `--font-heading`, `--font-mono` (and the rest of the theme). The site uses them as `var(--font-body)` etc., so any skin can override them.
- **Per-skin fonts** are in each skin’s **design tokens** (`design/skins/<name>.json`): under `fonts` (e.g. `body`, `heading`, `mono`). When a skin is created or updated, its generated CSS sets those same variables. So:
  - **Changing fonts site-wide** = create or edit a design skin and set `fonts.body`, `fonts.heading`, `fonts.mono` in the tokens, then set that skin as active.

There is no separate “Font” or “Typography” screen in Settings; fonts are controlled via **Studio → Design Skins** (create/edit a skin and set active).

---

## 2. Design skins: what they are and where they live

| What | Where |
|------|--------|
| **Skin definitions** | `design/skins/<name>.json` (tokens) and `design/skins/<name>.css` (generated) |
| **Active skin** | `design/active-skin.json` (single `{ "skin": "<name>" }`) |
| **Studio UI** | **Studio → Design Skins** (sidebar). Not under Settings. |

Skins are **token-based**: colors, fonts, spacing. The pipeline turns tokens into CSS variables; the generator also maps them to the names used by `global.css` (e.g. `--bg-primary`, `--text-primary`, `--highlight`, `--font-body`) so the live site updates when a skin is active.

---

## 3. Predefined skins and “Create from preset”

**Predefined presets** are available in Studio:

- **Studio → Design Skins** → section **“Start from a preset”**.
- Presets: **Default** (current site), **Dark**, **High contrast**, **Serif editorial**, **Minimal**.
- Clicking a preset opens **Create Skin** with name and tokens pre-filled; you can edit and save. That creates a new skin in `design/skins/` and generates its CSS.

So you get **predefined themes** (fonts, colors, spacing) without Figma; you can still **Import from Figma** or **Create Skin** manually with custom JSON.

---

## 4. Applying the active skin to the website

**With the current setup, the active skin is applied to the public site** (not only in the editor):

1. **Layout load** (`src/routes/+layout.server.ts`) reads `design/active-skin.json` and, if present, the file `design/skins/<active>.css` from the repo.
2. **Root layout** (`src/routes/+layout.svelte`) injects that CSS in `<head>` as a `<style data-active-skin>` block **only when the route is not under `/studio`**. So the **live site** (and previews outside Studio) get the skin; Studio UI does not.
3. **Build/deploy**: For this to work in production, the repo that is built must contain the `design/` folder (e.g. `design/active-skin.json` and `design/skins/<name>.css`). Same for local dev: if `design/` is present, the active skin is applied.

**Token → site variables:** The generated skin CSS sets both the raw token variables (`--color-*`, `--font-*`, `--space-*`) and the **site theme variables** used in `global.css` (`--bg-primary`, `--text-primary`, `--highlight`, `--font-body`, etc.). So one active skin drives colors, fonts, and spacing across the site.

---

## 5. Summary

| Question | Answer |
|----------|--------|
| **Font global setup** | Part of **design skins**. Edit tokens (e.g. `fonts.body`) in a skin and set it active. No separate font-only setting. |
| **Where to manage skins** | **Studio → Design Skins** (sidebar), not under Settings. |
| **Predefined skins** | Use **“Start from a preset”** on the Design Skins page; create a skin from Default, Dark, High contrast, Serif, or Minimal. |
| **Applying to the website** | Active skin is loaded in layout and injected into the public site; ensure `design/` is in the repo at build time. |
| **Orientations / layout** | Skins are colors, fonts, spacing only. Layout/breakpoints stay in code/CSS; skins don’t change structure. |

To change the site’s look (including global fonts): **Studio → Design Skins** → pick a preset or create a skin → set it as **Active**. The live site will use that skin’s fonts and colors.
