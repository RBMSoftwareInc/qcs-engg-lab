# Studio Implementation Plan

## Current State
- Public site: Static build on Hostinger ✅
- Studio: Requires server-side (doesn't work) ❌

## Solution: GitHub API Studio

### Architecture

```
┌─────────────────┐
│  Static Hosting │  ← Public site (current)
│   (Hostinger)   │
└─────────────────┘

┌─────────────────┐
│  Studio (Client)│  ← GitHub API Studio
│  GitHub API     │     (no backend needed)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   GitHub Repo   │  ← Content storage
└─────────────────┘
```

### How It Works

1. **Authentication:**
   - User enters GitHub Personal Access Token
   - Token stored in `localStorage`
   - Used for all API calls

2. **Content Operations:**
   - **Read**: `GET /repos/{owner}/{repo}/contents/{path}`
   - **Update**: `PUT /repos/{owner}/{repo}/contents/{path}`
   - **Create**: `PUT /repos/{owner}/{repo}/contents/{path}` (new file)
   - **Delete**: `DELETE /repos/{owner}/{repo}/contents/{path}`

3. **Git Operations:**
   - Commits created automatically via API
   - Push happens automatically
   - Full Git history maintained

### Implementation Steps

1. **Create GitHub API Client**
   - `src/lib/studio/github-api.ts`
   - Functions for all GitHub API operations
   - Token management

2. **Update Studio Pages**
   - Replace server API calls with GitHub API calls
   - Update authentication flow
   - Update content loading/editing

3. **Token Management**
   - Token input on first visit
   - Store in `localStorage`
   - Validate token on load

4. **Security**
   - Token validation
   - Error handling
   - Rate limit handling

### Files to Create/Modify

**New Files:**
- `src/lib/studio/github-api.ts` - GitHub API client
- `src/lib/studio/github-auth.ts` - Token management
- `src/routes/studio/github-setup/+page.svelte` - Token entry page

**Modified Files:**
- `src/routes/studio/+page.svelte` - Use GitHub API
- `src/routes/studio/edit/[slug]/+page.svelte` - Use GitHub API
- `src/routes/studio/+layout.svelte` - GitHub auth flow

### GitHub Token Setup

User needs to:
1. Go to GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Scopes needed: `repo` (full repository access)
5. Copy token and enter in Studio

### API Endpoints Used

```
GET  /repos/{owner}/{repo}/contents/{path}
PUT  /repos/{owner}/{repo}/contents/{path}
DELETE /repos/{owner}/{repo}/contents/{path}
GET  /repos/{owner}/{repo}
GET  /user
```

### Benefits

- ✅ Works on static hosting
- ✅ No backend needed
- ✅ Full Git integration
- ✅ Secure (user controls token)
- ✅ Free (GitHub API is free)
- ✅ Same UI/UX

### Limitations

- ⚠️ Token visible in browser (but user controls it)
- ⚠️ Rate limits: 5000 requests/hour (plenty for content editing)
- ⚠️ Requires GitHub account

---

## Alternative: Separate Backend

If you prefer server-side Studio:

### Deploy Studio API to Vercel

1. **Create API routes** (keep current server routes)
2. **Deploy to Vercel:**
   - Connect GitHub repo
   - Vercel auto-detects SvelteKit
   - Deploys automatically

3. **Update Studio frontend:**
   - Point API calls to Vercel URL
   - Keep public site on Hostinger

**Cost:** FREE (Vercel free tier)

---

## My Recommendation

**Build GitHub API Studio** because:
1. Works on your current hosting (no changes needed)
2. No additional costs
3. No server to manage
4. Full functionality
5. Secure and simple

**Should I proceed with GitHub API Studio?**

