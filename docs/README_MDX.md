# MDX Content System

A structured, Git-driven content system for the QuantumCore Solutions engineering lab website.

## Quick Start

### Content Triage
Analyze existing content for quality issues:
```bash
npm run content-triage
```

### Generate Redirects
Create SEO-safe redirect mappings from frontmatter:
```bash
npm run generate-redirects
```

### WordPress Migration
Migrate WordPress content to MDX:
```bash
npm run migrate-wp <wp-url> [user] [password] [content-type] [output-dir] [--dry-run]
```

## Architecture

### Content Schema
- **Type system**: `page | domain | field-note | signal | service | insight`
- **Status workflow**: `draft → review → live`
- **Frontmatter validation**: Enforced at build time
- **Redirect mapping**: Automatic from `legacyUrl` field

### File Structure
```
content/
  ├── domains/
  │   └── ai.mdx
  ├── field-notes/
  │   └── systems-thinking.mdx
  ├── signals/
  │   └── distributed-scale.mdx
  └── services/
      └── enterprise-architecture.mdx
```

### Image Structure
```
assets/images/
  ├── domains/
  │   └── ai/
  │       ├── diagram.svg
  │       └── hero.webp
  ├── field-notes/
  │   └── systems-thinking/
  │       └── flow.svg
  └── shared/
      └── grid.svg
```

## MDX Components

### Figure
For photos and images:
```mdx
<Figure 
  src="/assets/images/field-notes/article/hero.webp" 
  alt="Description"
  caption="Optional caption"
  width={800}
  height={600}
/>
```

### Diagram
For SVG diagrams:
```mdx
<Diagram 
  src="/assets/images/domains/ai/diagram.svg"
  caption="System architecture"
  width={600}
  height={400}
/>
```

## Content Guidelines

### Writing Style
- **Concise**: Get to the point
- **Declarative**: State facts, not opinions
- **Authoritative**: Confident, not marketing
- **No marketing language**: Avoid "amazing", "revolutionary", "transform"

### Frontmatter Template
```yaml
---
type: field-note
status: live
title: "Content Title"
description: "SEO description (150-160 chars)"
order: 1
legacyUrl: "/old-url"  # For redirects
publishedAt: "2024-01-01T00:00:00Z"
updatedAt: "2024-01-01T00:00:00Z"
tags: ["tag1", "tag2"]
author: "Author Name"
---
```

## Build Process

1. Load all `.mdx` files (falls back to `.md` during migration)
2. Validate frontmatter against schema
3. Filter by `status: live`
4. Generate redirects from `legacyUrl` fields
5. Output static site with `.htaccess` redirects

## Migration

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

## Philosophy

This is not a marketing CMS. This is a content governance system for engineers.

- Git is the single source of truth
- No database, no heavy CMS
- Static build only
- Content quality enforced at build time
- Aggressive content pruning encouraged

