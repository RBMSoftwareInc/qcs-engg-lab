# QuantumCore Solutions – Elite Engineering Lab Website

A minimal, architecture-driven website built with SvelteKit, TypeScript, and static site generation.

## Tech Stack

- **Framework**: SvelteKit (latest stable)
- **Language**: TypeScript
- **Rendering**: Static Site Generation (SSG)
- **Adapter**: @sveltejs/adapter-static
- **Styling**: Native CSS + CSS variables
- **Content**: Git-driven Markdown (.md)
- **Animations**: Native Svelte transitions, Web Animations API, IntersectionObserver

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├─ routes/          # SvelteKit routes
├─ lib/
│  ├─ components/   # Reusable components
│  ├─ content/      # Content loader
│  └─ styles/       # Global styles
├─ content/         # Markdown content files
└─ assets/          # Image assets (Git-managed)
    └─ images/
        ├─ domains/     # Domain diagrams
        ├─ field-notes/ # Field note images
        └─ shared/      # Shared images
```

## Content Management

Content is managed through Markdown files in the `/content` directory. Each file uses frontmatter for metadata:

```markdown
---
title: Page Title
order: 1
description: Page description
diagram: /assets/images/domains/example/diagram.svg
heroImage: /assets/images/domains/example/hero.webp
---

Content goes here...
```

### Image Management

Images are Git-driven and organized by content type:

- **Domain Images**: `/assets/images/domains/{domain-name}/`
- **Field Notes Images**: `/assets/images/field-notes/{slug}/`
- **Shared Images**: `/assets/images/shared/`

**Image Rules:**
- Use `.svg` for diagrams and illustrations
- Use `.webp` for photographs (when needed)
- Reference images in frontmatter: `diagram: /assets/images/...`
- Images are automatically synced to `/static/assets/` during build
- All images are lazy-loaded and optimized

**Image Categories:**
1. **Structural Images**: Abstract diagrams, system flows, architecture metaphors
2. **Contextual Images**: Subtle lab visuals, abstract textures (low opacity)
3. **Field Notes Images**: Inline diagrams, annotated visuals, concept sketches
4. **Identity Assets**: Logo, favicon, monogram (in `/assets/logos/`)

## Deployment

The site builds to static files in the `/build` directory. To deploy to Hostinger:

1. Build the site: `npm run build`
2. Upload the contents of the `/build` directory to your Hostinger hosting
3. Configure your web server to serve `index.html` for all routes (SPA fallback)

### Apache Configuration

If using Apache, create a `.htaccess` file in the build directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Nginx Configuration

If using Nginx, configure your server block:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Design Principles

- **Calm**: Minimal, breathing space
- **Confident**: Authoritative, no fluff
- **Architect-driven**: Engineering focus, not marketing
- **Research-oriented**: Lab documentation style
- **Minimal but authoritative**: Clean, professional

## Color Theme

The site uses a warm, intellectual color palette defined in CSS variables:

- Background: Creamy whites and light mango tones
- Text: Deep and muted grays
- Accent: Mango highlight (#F4C430)

## Typography

- **Body**: IBM Plex Sans
- **Code**: IBM Plex Mono

Chosen for engineering heritage, global acceptance, and excellent readability. The combination signals "We build systems" without being flashy or pretentious.

## License

Private project - QuantumCore Solutions
