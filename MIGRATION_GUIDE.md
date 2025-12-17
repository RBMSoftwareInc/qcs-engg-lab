# MDX Migration Guide

This guide documents the migration from Markdown (.md) to MDX (.mdx) for the QuantumCore Solutions engineering lab website.

## Overview

The migration to MDX provides:
- **Structured content governance** via frontmatter schema
- **Component-based content** (Figure, Diagram components)
- **Status workflow** (draft → review → live)
- **SEO-safe redirects** from WordPress/Elementor
- **Content quality tooling** for triage and analysis

## Content Schema

### Required Frontmatter

```yaml
---
type: page | domain | field-note | signal | service | insight
status: draft | review | live
title: "Content Title"
description: "SEO description"
order: 1
legacyUrl: "/old-wordpress-url"  # For redirect mapping
publishedAt: "2024-01-01T00:00:00Z"
updatedAt: "2024-01-01T00:00:00Z"
tags: ["tag1", "tag2"]
author: "Author Name"
---
```

### Content Type-Specific Fields

**Domain:**
```yaml
type: domain
icon: "ai"
diagram: "/assets/images/domains/ai/diagram.svg"
```

**Field Note / Insight:**
```yaml
type: field-note
category: "architecture"
heroImage: "/assets/images/field-notes/systems-thinking/hero.webp"
```

**Signal:**
```yaml
type: signal
category: "case-study"
icon: scale | analytics | cloud | intelligence
image: "https://images.unsplash.com/..."
```

**Service:**
```yaml
type: service
icon: architecture | development | team | optimization | consulting
features: ["Feature 1", "Feature 2"]
benefits:
  - title: "Benefit Title"
    description: "Benefit description"
```

## Migration Steps

### 1. Content Triage

Run the content triage tool to analyze existing content:

```bash
npm run content-triage
```

This generates `content-triage-report.md` with recommendations:
- **Keep**: Content meets quality standards
- **Rewrite**: Needs revision (marketing language, thin content, etc.)
- **Drop**: Too thin or duplicate - consider merging/removing

### 2. WordPress Migration (if applicable)

Migrate WordPress content to MDX:

```bash
npm run migrate-wp <wp-url> [user] [password] [content-type] [output-dir] [--dry-run]
```

Example:
```bash
npm run migrate-wp https://example.com/wp admin password field-note content/migrated --dry-run
```

The tool:
- Fetches posts via WordPress REST API
- Strips Elementor markup
- Converts HTML to MDX
- Generates frontmatter with `legacyUrl` for redirects
- Outputs `.mdx` files in specified directory

### 3. Manual Content Conversion

For existing `.md` files, convert to `.mdx`:

1. **Add required frontmatter:**
   ```yaml
   ---
   type: field-note
   status: live
   title: "Your Title"
   description: "SEO description"
   order: 1
   ---
   ```

2. **Replace raw HTML with MDX components:**
   ```mdx
   <!-- Before -->
   <img src="/image.jpg" alt="Description" />
   
   <!-- After -->
   <Figure src="/assets/images/field-notes/article/image.webp" alt="Description" caption="Optional caption" />
   ```

3. **Use Diagram component for SVGs:**
   ```mdx
   <Diagram src="/assets/images/domains/ai/diagram.svg" caption="System architecture" />
   ```

### 4. Image Migration

Images must follow this structure:
```
/assets/images/
  ├── domains/
  │   └── ai/
  │       ├── diagram.svg
  │       └── hero.webp
  ├── field-notes/
  │   └── systems-thinking/
  │       ├── hero.webp
  │       └── flow.svg
  └── shared/
      └── grid.svg
```

**Rules:**
- Only `.webp` (photos) and `.svg` (diagrams) allowed
- Use `Figure` component for photos
- Use `Diagram` component for SVGs
- All images lazy-loaded by default
- No layout shift (specify dimensions)

### 5. Generate Redirects

After migration, generate redirect mappings:

```bash
npm run generate-redirects
```

This creates:
- `build/.htaccess` - Apache redirect rules (Hostinger-compatible)
- `build/redirects.json` - JSON mapping for reference

Redirects are generated from `legacyUrl` frontmatter fields.

## Content Writing Guidelines

### Tone and Style

- **Concise**: Get to the point quickly
- **Declarative**: State facts, not opinions
- **Authoritative**: Confident, not marketing
- **No marketing language**: Avoid "amazing", "revolutionary", "transform", etc.

### Structure

1. **Title**: Clear, descriptive
2. **Description**: SEO-friendly, 150-160 characters
3. **Introduction**: 2-3 sentences setting context
4. **Sections**: Use H2 headings for major sections
5. **Subsections**: Use H3 for details
6. **Code examples**: Use fenced code blocks
7. **Diagrams**: Use Diagram component for visual explanations

### Example MDX Content

```mdx
---
type: field-note
status: live
title: "Systems Thinking in Architecture"
description: "How systems thinking informs architectural decisions in distributed systems."
order: 1
publishedAt: "2024-01-01T00:00:00Z"
---

## Introduction

Systems thinking is fundamental to architectural design. Every component exists within a larger system, and understanding these relationships is essential.

## Core Principles

### Holistic Understanding

Systems are more than the sum of their parts. We design with awareness of:

- Component interactions
- Dependency chains
- Emergent behaviors

<Diagram src="/assets/images/field-notes/systems-thinking/architecture.svg" caption="System component relationships" />

## Implementation

Systems thinking requires:

1. **Mapping dependencies**
2. **Identifying boundaries**
3. **Understanding flows**

\`\`\`typescript
interface SystemComponent {
  id: string;
  dependencies: string[];
  boundaries: Boundary[];
}
\`\`\`
```

## Status Workflow

1. **Draft**: Work in progress, not published
2. **Review**: Ready for review, not published
3. **Live**: Published and visible

Only `status: live` content is published. Use this to control what appears on the site.

## Content Governance

### Quality Gates

Content must:
- Have minimum 200 words (unless merging with related content)
- Use declarative language (no marketing verbs)
- Include proper structure (H2 sections for long content)
- Have valid frontmatter (validated at build time)

### Triage Process

1. Run `npm run content-triage`
2. Review recommendations
3. **Drop**: Remove or merge thin/duplicate content
4. **Rewrite**: Fix issues (marketing language, structure, etc.)
5. **Keep**: No action needed

### Aggressive Pruning

Encourage removing content that:
- Doesn't add unique value
- Is duplicate or redundant
- Is too thin to stand alone
- Contains outdated information

## Build Integration

The build process:
1. Loads all `.mdx` files (falls back to `.md` during migration)
2. Validates frontmatter
3. Filters by `status: live`
4. Generates redirects from `legacyUrl` fields
5. Outputs static site

## Troubleshooting

### Content Not Appearing

- Check `status: live` in frontmatter
- Verify frontmatter validation (check build logs)
- Ensure file is in correct directory structure

### Redirects Not Working

- Verify `legacyUrl` in frontmatter starts with `/`
- Run `npm run generate-redirects` after content changes
- Check `.htaccess` is in build output

### Images Not Loading

- Verify image path starts with `/assets/images/`
- Check file format (`.webp` or `.svg` only)
- Ensure image exists in `assets/images/` directory

## Next Steps

1. Run content triage on existing content
2. Convert high-priority content to MDX
3. Migrate WordPress content (if applicable)
4. Generate redirects
5. Test build and redirects
6. Gradually migrate remaining content

## Support

For issues or questions:
- Check build logs for validation errors
- Review content-triage report for quality issues
- Verify frontmatter schema matches requirements

