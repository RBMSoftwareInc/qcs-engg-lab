# Content System Architecture

## Overview

The MDX-based content system provides structured content governance for the QuantumCore Solutions engineering lab website. It enforces quality, enables SEO-safe migrations, and scales without database dependencies.

## Core Principles

1. **Git as Single Source of Truth**: All content lives in Git, versioned alongside code
2. **Static Build Only**: No runtime content loading, no database
3. **Content Governance**: Frontmatter schema enforces structure and quality
4. **Status Workflow**: `draft → review → live` controls publication
5. **SEO-Safe Migration**: Automatic redirect mapping from legacy URLs

## System Components

### 1. Content Schema (`src/lib/content/schema.ts`)

Defines the structure and validation rules for all content:

- **Content Types**: `page | domain | field-note | signal | service | insight`
- **Status Workflow**: `draft | review | live`
- **Type-Specific Fields**: Each content type has specialized metadata
- **Validation**: Enforced at build time

### 2. MDX Loader (`src/lib/content/mdx-loader.ts`)

Loads and processes content files:

- Loads `.mdx` files (falls back to `.md` during migration)
- Validates frontmatter against schema
- Filters by status (only `live` content published)
- Generates routes from content type and slug
- Provides query functions: `loadMDXBySlug`, `loadMDXByDirectory`, `loadMDXByType`

### 3. MDX Components

**Figure** (`src/lib/components/mdx/Figure.svelte`):
- For photos and images
- Only `.webp` format allowed
- Lazy loading, no CLS
- Optional caption

**Diagram** (`src/lib/components/mdx/Diagram.svelte`):
- For SVG diagrams
- Only `.svg` format allowed
- Inline SVG rendering
- CSS-controlled styling

**MDXRenderer** (`src/lib/components/mdx/MDXRenderer.svelte`):
- Renders MDX content
- Applies consistent styling
- Handles component interpolation

### 4. Migration Tooling

**Content Triage** (`scripts/content-triage.ts`):
- Analyzes all content files
- Flags quality issues (thin content, marketing language, duplicates)
- Recommends: Keep / Rewrite / Drop
- Generates detailed report

**WordPress Migration** (`scripts/migrate-wordpress.ts`):
- Fetches content via WordPress REST API
- Strips Elementor markup
- Converts HTML to MDX
- Generates frontmatter with `legacyUrl` for redirects

**Redirect Generator** (`scripts/generate-redirects.ts`):
- Reads `legacyUrl` from all content frontmatter
- Generates `.htaccess` redirect rules (Hostinger-compatible)
- Outputs JSON mapping for reference
- Runs automatically during build

## Content Structure

### Directory Layout
```
content/
  ├── domains/          # Domain expertise pages
  ├── field-notes/      # Technical insights (renamed from insights)
  ├── signals/          # Case studies and architectural thinking
  ├── services/         # Service offerings
  ├── insights/         # Strategic insights
  └── pages/            # Static pages
```

### Image Layout
```
assets/images/
  ├── domains/
  │   └── {slug}/
  │       ├── diagram.svg
  │       └── hero.webp
  ├── field-notes/
  │   └── {slug}/
  │       ├── hero.webp
  │       └── {diagram-name}.svg
  ├── signals/
  │   └── {slug}/
  │       └── image.webp
  └── shared/
      └── {shared-assets}
```

## Frontmatter Schema

### Required Fields
```yaml
type: field-note          # Content type
status: live              # Publication status
title: "Content Title"    # Display title
```

### Optional Fields
```yaml
description: "SEO description"
order: 1                  # Sort order
legacyUrl: "/old-url"     # For redirect mapping
publishedAt: "2024-01-01T00:00:00Z"
updatedAt: "2024-01-01T00:00:00Z"
tags: ["tag1", "tag2"]
author: "Author Name"
```

### Type-Specific Fields

**Domain:**
```yaml
icon: "ai"
diagram: "/assets/images/domains/ai/diagram.svg"
```

**Signal:**
```yaml
category: "case-study"
icon: scale | analytics | cloud | intelligence
image: "https://..."
```

**Service:**
```yaml
icon: architecture | development | team | optimization | consulting
features: ["Feature 1", "Feature 2"]
benefits:
  - title: "Benefit"
    description: "Description"
```

## Build Integration

### Build Process
1. **Sync Assets**: Copy images to static directory
2. **Generate Redirects**: Create `.htaccess` from `legacyUrl` fields
3. **Build Site**: Vite builds static site
4. **Validate**: Frontmatter validation happens during content loading

### NPM Scripts
```bash
npm run content-triage      # Analyze content quality
npm run generate-redirects  # Create redirect mappings
npm run migrate-wp          # Migrate WordPress content
npm run build              # Full build (includes redirects)
```

## Content Governance

### Quality Gates

Content must meet these standards:
- **Minimum word count**: 200 words (unless merging)
- **No marketing language**: Declarative, authoritative tone
- **Proper structure**: H2 sections for long content
- **Valid frontmatter**: Enforced at build time

### Triage Process

1. Run `npm run content-triage`
2. Review `content-triage-report.md`
3. **Drop**: Remove or merge thin/duplicate content
4. **Rewrite**: Fix issues (marketing language, structure)
5. **Keep**: No action needed

### Aggressive Pruning

Encourage removing:
- Content that doesn't add unique value
- Duplicate or redundant content
- Content too thin to stand alone
- Outdated information

## Migration Strategy

### Phase 1: Setup
- ✅ Install MDX dependencies
- ✅ Create content schema
- ✅ Build MDX loader
- ✅ Create migration tooling

### Phase 2: Content Triage
- Run content triage on existing content
- Review recommendations
- Decide: Keep / Rewrite / Drop

### Phase 3: Migration
- Convert high-priority content to MDX
- Add required frontmatter
- Migrate WordPress content (if applicable)
- Update image references

### Phase 4: Redirects
- Add `legacyUrl` to frontmatter
- Generate redirect mappings
- Test redirects
- Deploy

### Phase 5: Cleanup
- Remove old `.md` files (after MDX migration)
- Update all content to use MDX components
- Final quality pass

## Usage Examples

### Creating New Content

1. Create `.mdx` file in appropriate directory
2. Add frontmatter:
```yaml
---
type: field-note
status: draft
title: "New Article"
description: "SEO description"
---
```

3. Write content using MDX:
```mdx
## Introduction

Content here.

<Figure src="/assets/images/field-notes/article/hero.webp" alt="Description" />

<Diagram src="/assets/images/field-notes/article/diagram.svg" caption="Architecture" />
```

4. Set `status: live` when ready to publish

### Querying Content

```typescript
import { loadMDXByDirectory, loadMDXBySlug } from '$lib/content/mdx-loader';

// Get all field notes
const fieldNotes = loadMDXByDirectory('field-notes');

// Get specific content
const article = loadMDXBySlug('systems-thinking');
```

## Best Practices

1. **Always validate frontmatter** before committing
2. **Use MDX components** instead of raw HTML
3. **Follow image structure** strictly
4. **Keep content focused** - one topic per file
5. **Use status workflow** - don't publish drafts
6. **Run content triage** regularly
7. **Prune aggressively** - quality over quantity

## Troubleshooting

### Content Not Appearing
- Check `status: live` in frontmatter
- Verify frontmatter validation (check build logs)
- Ensure file is in correct directory

### Redirects Not Working
- Verify `legacyUrl` starts with `/`
- Run `npm run generate-redirects`
- Check `.htaccess` in build output

### Images Not Loading
- Verify path starts with `/assets/images/`
- Check file format (`.webp` or `.svg` only)
- Ensure image exists in assets directory

## Future Enhancements

- Full MDX compilation at build time
- Content preview in development
- Automated content quality checks in CI
- Content analytics and metrics
- Multi-language support

## Support

- See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for migration details
- See [README_MDX.md](./README_MDX.md) for quick reference
- Check build logs for validation errors
- Review content-triage report for quality issues

