# Environment Configuration for QCS Studio

QCS Studio requires the following environment variables to be set for full functionality.

## Required Environment Variables

### GitHub API Configuration

These are required for all content operations via GitHub REST API:

```bash
# GitHub Personal Access Token (PAT)
# Create at: https://github.com/settings/tokens
# Required scopes: repo (full control of private repositories)
GITHUB_TOKEN=ghp_your_token_here

# GitHub repository owner (username or organization)
GITHUB_OWNER=your-username

# Repository name
GITHUB_REPO=your-repo-name

# Branch name (optional, defaults to 'main')
GITHUB_BRANCH=main
```

### Figma API Configuration (Optional)

Required only if you want to import design tokens from Figma:

```bash
# Figma Personal Access Token
# Create at: https://www.figma.com/developers/api#access-tokens
FIGMA_TOKEN=your_figma_token_here
```

### Studio Authentication

Required for Studio login:

```bash
# Studio admin email
VITE_STUDIO_EMAIL=admin@example.com

# Studio admin password
VITE_STUDIO_PASSWORD=your_secure_password_here
```

## Setup Instructions

### 1. Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name: "QCS Studio"
4. Select scopes:
   - `repo` (Full control of private repositories)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again)

### 2. Create Figma Personal Access Token (Optional)

1. Go to https://www.figma.com/developers/api#access-tokens
2. Click "Create a new personal access token"
3. Give it a name: "QCS Studio"
4. Copy the token

### 3. Configure Environment Variables

#### For Local Development

Create a `.env` file in the project root:

```bash
# .env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

FIGMA_TOKEN=your_figma_token_here

VITE_STUDIO_EMAIL=admin@example.com
VITE_STUDIO_PASSWORD=your_secure_password_here
```

**Important:** Never commit `.env` to Git. It's already in `.gitignore`.

#### For Production Deployment

Set environment variables in your hosting platform:

**Vercel:**
- Go to Project Settings → Environment Variables
- Add each variable for Production, Preview, and Development

**Netlify:**
- Go to Site Settings → Environment Variables
- Add each variable

**Node.js Hosting:**
- Set in your process manager (PM2, systemd, etc.)
- Or use a `.env` file (ensure it's not publicly accessible)

## Security Best Practices

1. **Never expose tokens to the browser**
   - All GitHub and Figma API calls happen server-side only
   - Tokens are never sent to the client

2. **Use environment-specific tokens**
   - Create separate tokens for development and production
   - Rotate tokens regularly

3. **Limit token scopes**
   - GitHub: Only grant `repo` scope if needed
   - Figma: Tokens have read-only access by default

4. **Secure password storage**
   - Use strong passwords for `VITE_STUDIO_PASSWORD`
   - Consider using environment variable encryption in production

5. **Monitor API usage**
   - GitHub API: 5,000 requests/hour (authenticated)
   - Figma API: Check your plan limits
   - Studio includes rate limiting to prevent abuse

## Verification

After setting up environment variables, verify they're working:

1. Start the development server: `npm run dev`
2. Navigate to `/studio/login`
3. Log in with your credentials
4. Try creating or editing content
5. Check that changes are committed to GitHub

## Troubleshooting

### "GitHub configuration missing" error

- Ensure all `GITHUB_*` variables are set
- Check that variable names match exactly (case-sensitive)
- Restart your development server after adding variables

### "Figma token not configured" error

- This is only needed for Figma imports
- If you're not using Figma, you can ignore this error
- The error only appears when trying to import from Figma

### "Unauthorized" errors

- Check that your GitHub token has the correct scopes
- Verify the token hasn't expired
- Ensure `GITHUB_OWNER` and `GITHUB_REPO` match your repository

### Rate limit errors

- Studio includes rate limiting (80 requests/hour)
- GitHub allows 5,000 requests/hour for authenticated requests
- If you hit limits, wait for the reset time shown in the error

## Example .env File

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=myusername
GITHUB_REPO=my-repo
GITHUB_BRANCH=main

# Figma Configuration (Optional)
FIGMA_TOKEN=figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Studio Authentication
VITE_STUDIO_EMAIL=admin@mycompany.com
VITE_STUDIO_PASSWORD=SecurePassword123!
```
