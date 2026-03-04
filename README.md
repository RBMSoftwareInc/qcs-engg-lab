# QCS Engineering Lab – Git-Native Content & Design Studio

A production-ready, Git-native publishing platform with integrated content management and design system orchestration. Built with SvelteKit, TypeScript, and GitHub REST API.

## 🎯 Overview

This project combines a **static website** (public-facing) with **Studio** (content & design management system). Studio is a Git-native CMS that edits Markdown files and commits changes directly to GitHub via REST API. The public site remains fully static, built from the same Git repository.

### Core Philosophy

- **GitHub is the single source of truth** – All content and design tokens live in Git
- **Static by default** – Public site is fully static (Vite / Svelte build)
- **Studio is dynamic** – Content management runs on Node.js server
- **No database** – Everything is file-based, versioned in Git
- **Design-system-driven** – Tokens from Figma, not visual page builders

## ✨ Features

### 🌐 Public Website
- **Static Site Generation** – Fully static SvelteKit site
- **Markdown Content** – Git-driven content management
- **MDX Support** – Enhanced markdown with React/Svelte components
- **Content Types** – Domains, Services, Insights, Signals, Research
- **SEO Optimized** – Meta tags, structured data, clean URLs
- **Performance** – Lazy loading, optimized images, minimal JavaScript

### 🎨 Studio (Content Management)
- **Git-Native CMS** – Edit content directly in GitHub via REST API
- **Rich Markdown Editor** – TipTap-based WYSIWYG editor
- **Content Preview** – Real-time preview with design skin support
- **Draft/Review/Live Workflow** – Status-based content publishing
- **Media Management** – Upload and organize images
- **Git History as Audit Log** – Every change is versioned

### 🎨 Design Skins System
- **Figma Integration** – Import design tokens (colors, typography, spacing)
- **Token Management** – Create and manage design skins
- **CSS Generation** – Automatic CSS variable generation from tokens
- **Skin Preview** – Preview content with active design skin
- **Active Skin Selection** – Set which skin the public site uses

### 📐 Layout Contracts
- **Code-Defined Layouts** – Predefined layout structures (hero, article, card, grid)
- **Content Mapping** – Map markdown fields to layout slots
- **Layout Validation** – Validate content against layout contracts
- **No Visual Editing** – Layouts are code-defined, not drag-and-drop

### 🔒 Security & Governance
- **Authentication** – Session-based authentication
- **Path Validation** – Prevents path traversal attacks
- **Content Validation** – Validates markdown before saving
- **Rate Limiting** – 4,000 requests/hour (GitHub allows 5,000/hour)
- **Token Security** – GitHub/Figma tokens never exposed to browser
- **Safe File Operations** – Only allows operations in `content/` and `design/` directories

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- GitHub account with Personal Access Token
- (Optional) Figma account for design token import

### Installation

```bash
# Clone repository
git clone <repository-url>
cd QCS-Engg-Lab

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see docs/ENV_SETUP.md)
```

### Environment Setup

Create a `.env` file in the project root:

```bash
# GitHub API (Required)
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

# Figma API (Optional - only for design token import)
FIGMA_TOKEN=your_figma_token_here

# Studio Authentication (Required)
VITE_STUDIO_EMAIL=admin@example.com
VITE_STUDIO_PASSWORD=your_secure_password
```

See [docs/ENV_SETUP.md](./docs/ENV_SETUP.md) for detailed setup instructions.

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Access Studio

1. Navigate to `http://localhost:5173/studio/login`
2. Log in with credentials from `.env`
3. Start managing content and design skins

## 📁 Project Structure

```
QCS-Engg-Lab/
├── src/
│   ├── routes/              # SvelteKit routes
│   │   ├── studio/          # Studio CMS interface
│   │   │   ├── api/        # API endpoints (GitHub operations)
│   │   │   ├── design-skins/ # Design skins dashboard
│   │   │   └── edit/       # Content editor
│   │   └── [public routes] # Public website pages
│   ├── lib/
│   │   ├── components/     # Reusable components
│   │   ├── studio/         # Studio core libraries
│   │   │   ├── github-api.ts      # GitHub REST API service
│   │   │   ├── figma-api.ts       # Figma token import
│   │   │   ├── design-tokens.ts   # Token → CSS pipeline
│   │   │   ├── layout-contracts.ts # Layout system
│   │   │   ├── validators.ts      # Content validation
│   │   │   └── rate-limiter.ts    # Rate limiting
│   │   ├── content/        # Content loaders
│   │   └── styles/         # Global styles
│   └── app.html            # HTML template
├── content/                 # Markdown content files
├── design/                  # Design skins (created by Studio)
│   ├── skins/              # Design skin files (.json, .css)
│   └── active-skin.json     # Currently active skin
├── assets/                  # Image assets (Git-managed)
├── docs/                    # Documentation
│   ├── ENV_SETUP.md
│   ├── STUDIO_EXTENSION_SUMMARY.md
│   ├── GITHUB_RATE_LIMITS.md
│   └── [other docs]
└── package.json
```

## 🎨 Studio Features

### Content Management
- **List Content** – Browse all markdown files organized by category
- **Edit Content** – Rich text editor with frontmatter management
- **Create Content** – New markdown files with frontmatter
- **Save Draft** – Save changes without publishing
- **Publish** – Commit changes to GitHub with status: live
- **Preview** – Real-time preview with design skin support
- **Split View** – Edit and preview side-by-side
- **Diff View** – Compare changes with live version

### Design Skins
- **Import from Figma** – Extract design tokens from Figma files
- **Create Manually** – Define tokens in JSON format
- **Generate CSS** – Automatic CSS variable generation
- **Set Active Skin** – Choose which skin the public site uses
- **Preview with Skin** – See content with active skin applied

### Layout Contracts
- **Predefined Layouts** – Hero, Article, Card, Grid, Default
- **Content Mapping** – Map markdown fields to layout slots
- **Validation** – Ensure content matches layout requirements

## 🔌 API Endpoints

### Content Operations
- `GET /studio/api/content` – List all content files
- `POST /studio/api/content/save` – Save content (GitHub API)

### Design Skins
- `GET /studio/api/design-skins` – List all skins
- `POST /studio/api/design-skins/create` – Create skin manually
- `POST /studio/api/design-skins/figma-import` – Import from Figma
- `GET /studio/api/design-skins/active` – Get active skin
- `POST /studio/api/design-skins/active` – Set active skin
- `GET /studio/api/design-skins/[name]/css` – Get skin CSS

### Layouts
- `GET /studio/api/layouts` – List all layouts
- `GET /studio/api/layouts?name=hero` – Get specific layout
- `POST /studio/api/layouts/validate` – Validate content

### Authentication
- `GET /studio/api/auth/check` – Check authentication status
- `POST /studio/api/auth/login` – Login
- `POST /studio/api/auth/logout` – Logout

## 🏗️ Architecture

### GitHub as Single Source of Truth
- All content lives as `.md` files in Git
- All design tokens live as `.json` files in Git
- All CSS generated from tokens lives in Git
- Studio NEVER stores HTML or layout data in a database

### Static Site Generation
- Public site is fully static (Vite / Svelte build)
- Studio is dynamic (Node / server runtime)
- Studio NEVER builds the site
- Studio ONLY edits files and commits to Git

### Design System Driven
- Design tokens imported from Figma
- Tokens → CSS variables pipeline
- Layout contracts (code-defined, not visual editing)
- No drag-and-drop canvas
- No Elementor-style freedom

### Safety & Governance
- All paths validated before operations
- Rate limiting prevents API abuse
- Content validation before commits
- Git history serves as audit log
- No overwriting non-content files

## 📚 Documentation

All documentation has been moved to the `docs/` folder:

- **[docs/ENV_SETUP.md](./docs/ENV_SETUP.md)** – Environment configuration guide
- **[docs/STUDIO_EXTENSION_SUMMARY.md](./docs/STUDIO_EXTENSION_SUMMARY.md)** – Complete feature implementation summary
- **[docs/GITHUB_RATE_LIMITS.md](./docs/GITHUB_RATE_LIMITS.md)** – GitHub API rate limits explained
- **[docs/CONTENT_SYSTEM.md](./docs/CONTENT_SYSTEM.md)** – Content system architecture
- **[docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)** – Migration from other systems
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** – Deployment instructions
- **[docs/HOSTINGER_SETUP.md](./docs/HOSTINGER_SETUP.md)** – Hostinger hosting setup

## 🛠️ Tech Stack

### Frontend
- **SvelteKit** – Full-stack framework
- **TypeScript** – Type safety
- **Svelte 5** – Reactive UI framework
- **TipTap** – Rich text editor
- **Marked** – Markdown parsing
- **MDX** – Enhanced markdown

### Backend (Studio)
- **Node.js** – Server runtime
- **GitHub REST API** – Content operations
- **Figma API** – Design token import
- **Session-based Auth** – Simple authentication

### Build & Deploy
- **Vite** – Build tool
- **@sveltejs/adapter-static** – Static site generation
- **Git** – Version control
- **GitHub** – Repository hosting

## 🎯 What This System Is

✅ **Git-native publishing platform**  
✅ **Design-system-driven studio**  
✅ **Developer-first CMS alternative**  
✅ **Content + design orchestration system**  
✅ **Static site generator with CMS**

## ❌ What This System Is NOT

❌ **Website builder**  
❌ **Drag-and-drop tool**  
❌ **Replacement for Figma**  
❌ **WordPress competitor**  
❌ **Visual page editor**  
❌ **HTML storage system**  
❌ **Database-driven CMS**

## 🔐 Security

- **Authentication Required** – All Studio endpoints require valid session
- **Path Validation** – Prevents path traversal attacks
- **Content Validation** – Validates markdown before saving
- **Rate Limiting** – 4,000 requests/hour (prevents abuse)
- **Token Security** – GitHub/Figma tokens never exposed to browser
- **Safe File Operations** – Only allows operations in allowed directories

## 📊 Rate Limits

- **GitHub API**: 5,000 requests/hour (authenticated)
- **Application Rate Limiter**: 4,000 requests/hour (safety buffer)
- **Figma API**: Varies by plan

See [docs/GITHUB_RATE_LIMITS.md](./docs/GITHUB_RATE_LIMITS.md) for details.

## 🚢 Deployment

### GitHub Pages (Public Site)

**Deploy your public website to GitHub Pages for free:**

1. Enable GitHub Pages in repository settings
2. Push code to `main` branch
3. GitHub Actions automatically builds and deploys
4. Site live at: `https://yourusername.github.io/repo-name`

**Note:** Studio (CMS) won't work on GitHub Pages (requires Node.js). Deploy Studio separately to Vercel or run locally.

See **[docs/GITHUB_PAGES_DEPLOY.md](./docs/GITHUB_PAGES_DEPLOY.md)** for complete guide.

### Netlify Deployment (Recommended - Studio Works!)

**Deploy both public site and Studio to Netlify:**
1. Install Netlify adapter: `npm install -D @sveltejs/adapter-netlify`
2. Update `svelte.config.js` to use Netlify adapter
3. Push to GitHub
4. Import repo to [Netlify](https://app.netlify.com)
5. Add environment variables
6. Deploy!

See **[NETLIFY_QUICKSTART.md](./NETLIFY_QUICKSTART.md)** for quick start or **[docs/NETLIFY_DEPLOY.md](./docs/NETLIFY_DEPLOY.md)** for complete guide.

### Studio Deployment (Alternative: Vercel)

**Deploy Studio to Vercel in 5 minutes:**
1. Push code to GitHub
2. Import repo to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

See **[docs/QUICK_DEPLOY_GUIDE.md](./docs/QUICK_DEPLOY_GUIDE.md)** for step-by-step instructions.

### Hostinger (Static or VPS)
- **Shared hosting**: Build with `BUILD_STATIC=1 npm run build`, then upload the contents of `build/` to `public_html/`. Studio will not run (static only).
- **VPS / Node**: Run the app with Node and set env vars; Studio works.

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step Hostinger and Netlify instructions.

### Studio (Server-Side)
Studio requires Node.js runtime. Options:
- **Vercel** – Recommended (free, easy, auto-deploy from Git)
- **Railway** – Free tier, simple setup
- **Render** – Free tier, reliable
- **Hostinger VPS** – If you have VPS hosting
- **Not supported**: Static hosting (GitHub Pages, Hostinger shared hosting)

See [docs/DEPLOY_STUDIO.md](./docs/DEPLOY_STUDIO.md) for complete deployment guide.

## 📝 Content Workflow

1. **Create/Edit** – Use Studio to create or edit markdown files
2. **Save Draft** – Changes saved to GitHub with `status: draft`
3. **Review** – Set `status: review` for review
4. **Publish** – Set `status: live` to publish
5. **Build** – Public site builds from `status: live` content
6. **Deploy** – Static site deployed to hosting

## 🎨 Design Skin Workflow

1. **Import from Figma** – Extract tokens from Figma file
2. **Or Create Manually** – Define tokens in JSON
3. **Generate CSS** – Automatic CSS variable generation
4. **Set Active** – Choose which skin the public site uses
5. **Preview** – Preview content with active skin in Studio
6. **Build** – Public site reads `design/active-skin.json` at build time

## 🐛 Troubleshooting

### Environment Variables Not Loading
- Ensure `.env` file is in project root
- Restart dev server after adding variables
- Variables without `VITE_` prefix are server-side only

### Rate Limit Errors
- Wait for hourly reset
- Check [docs/GITHUB_RATE_LIMITS.md](./docs/GITHUB_RATE_LIMITS.md)
- Increase rate limiter limit if needed

### GitHub API Errors
- Verify `GITHUB_TOKEN` has `repo` scope
- Check token hasn't expired
- Verify `GITHUB_OWNER` and `GITHUB_REPO` are correct

### Studio Not Available
- Studio requires Node.js runtime
- Won't work on static hosting
- See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for hosting options

## 📖 Additional Resources

- **Environment Setup**: [docs/ENV_SETUP.md](./docs/ENV_SETUP.md)
- **SEO & Analytics**: [docs/SEO_ANALYTICS.md](./docs/SEO_ANALYTICS.md) – GTM, GA4, sitemap, Search Console
- **Feature Summary**: [docs/STUDIO_EXTENSION_SUMMARY.md](./docs/STUDIO_EXTENSION_SUMMARY.md)
- **Content System**: [docs/CONTENT_SYSTEM.md](./docs/CONTENT_SYSTEM.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Migration Guide**: [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)

## 📄 License

Private project - QuantumCore Solutions

## 🤝 Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Review GitHub API rate limit status

---

**Built with ❤️ for Git-native content management**
