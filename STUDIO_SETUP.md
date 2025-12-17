# QCS Studio Setup Guide

QCS Studio is a Git-native content management system for the QuantumCore Solutions website.

## Environment Variables

Create a `.env` file in the project root with:

```env
VITE_STUDIO_EMAIL=your-email@example.com
VITE_STUDIO_PASSWORD=your-secure-password
```

**Important:** Never commit `.env` to Git. Add it to `.gitignore`.

## Git Configuration

QCS Studio requires Git to be configured with SSH authentication for the repository.

### SSH Setup

1. Generate SSH key if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. Add SSH key to your Git hosting service (GitHub, GitLab, etc.)

3. Test SSH connection:
   ```bash
   ssh -T git@github.com  # or your Git host
   ```

### Repository Configuration

Ensure your repository is configured with:
- Remote named `origin`
- Default branch `main` (or update `git.ts` if using `master`)

## Accessing the Studio

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/studio`

3. Login with credentials from `.env`

## Features

### Content Management
- **List Content**: View all markdown files organized by category
- **Edit Content**: Full markdown editor with frontmatter editing
- **Create Content**: New content wizard with category selection
- **Publish Workflow**: Draft → Review → Live status management

### Media Management
- **Upload Images**: Drag-and-drop or file picker
- **Copy Paths**: One-click copy of image paths for markdown
- **Auto-commit**: All uploads are automatically committed to Git

### Git Operations
- **Auto-commit**: Every save automatically commits and pushes
- **Pull Changes**: Pull latest changes from remote
- **Status Check**: View current Git status

## File Structure

```
/content/          # All markdown content files
  domains/         # Domain-specific content
  services/        # Service descriptions
  insights/        # Articles and insights
  signals/         # Signals and case studies
  about/           # About pages

/static/assets/images/  # Uploaded media files
```

## Security Notes

- Authentication is simple (email/password) - suitable for internal use
- All Git operations happen server-side
- File paths are validated to prevent directory traversal
- Session cookies are HTTP-only and secure in production

## Production Deployment

1. Set environment variables on your hosting platform
2. Ensure Git SSH keys are available in the deployment environment
3. Configure Git user for commits:
   ```bash
   git config user.name "QCS Studio"
   git config user.email "studio@quantumcoresolutions.com"
   ```

## Troubleshooting

### Git Push Fails
- Check SSH key is configured
- Verify remote URL: `git remote -v`
- Test SSH connection manually

### Authentication Fails
- Verify environment variables are set
- Check `.env` file is in project root
- Restart dev server after changing `.env`

### Content Not Saving
- Check Git status in Settings
- Verify write permissions on `/content` directory
- Check Git is initialized: `git status`

## Philosophy

QCS Studio is not a traditional CMS. It's a controlled editorial interface for engineers who understand Git. All changes are versioned, traceable, and follow your existing Git workflow.

