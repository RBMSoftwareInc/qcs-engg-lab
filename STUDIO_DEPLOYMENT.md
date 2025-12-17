# QCS Studio Deployment Guide

## ⚠️ Important: Studio Requires Server-Side Capabilities

QCS Studio uses server-side API routes (`/studio/api/*`) that require a Node.js runtime. **It cannot run on static hosting** like Hostinger shared hosting.

## The Problem

When deployed as a static site, Studio's API routes return HTML (index.html) instead of JSON, causing errors like:
```
SyntaxError: Unexpected token '<', "<!doctype html>" is not valid JSON
```

## Deployment Options

### Option 1: Hostinger VPS (Recommended for Hostinger Users)

If you have Hostinger VPS hosting:

1. **Deploy the full SvelteKit app** (not just static build)
2. **Use `adapter-node`** instead of `adapter-static`
3. **Run as a Node.js application**

**Steps:**
```bash
# Install adapter-node
npm install -D @sveltejs/adapter-node

# Update svelte.config.js
import adapter from '@sveltejs/adapter-node';

# Build
npm run build

# Start server
node build/index.js
```

### Option 2: Separate Backend Service

Deploy Studio API to a Node.js service (Vercel, Railway, Render, etc.):

1. **Keep public site static** (current setup)
2. **Deploy Studio API separately** to a Node.js service
3. **Update API URLs** in Studio to point to the backend service

### Option 3: Local Development Only

Use Studio locally for content management:

1. **Run Studio locally**: `npm run dev`
2. **Edit content** via `http://localhost:5173/studio`
3. **Commit changes to Git**
4. **Deploy static site** to Hostinger (public site only)

### Option 4: Hybrid Approach

1. **Public site**: Static deployment to Hostinger (current)
2. **Studio**: Deploy to a separate Node.js service
3. **Content sync**: Studio commits to Git, static site rebuilds on push

## Current Status

- ✅ **Public site** works perfectly on static hosting
- ❌ **Studio** requires server-side capabilities
- ✅ **Error handling** added to gracefully handle missing API routes

## Quick Fix for Testing

If you just want to test the public site without Studio:

1. The `.htaccess` file is correctly configured
2. Public routes (`/practice`, `/philosophy`, etc.) work fine
3. Studio will show an error message explaining the limitation

## Recommended Solution

For a production setup with Hostinger:

1. **Use Hostinger VPS** (if available)
2. **Deploy full SvelteKit app** with `adapter-node`
3. **Configure environment variables** in Hostinger VPS
4. **Set up process manager** (PM2) to keep Studio running

## Alternative: Content Management Workflow

If you can't deploy Studio server-side:

1. **Edit content locally** using Studio at `localhost:5173/studio`
2. **Commit changes** to Git
3. **Push to repository**
4. **Rebuild static site** (can be automated with CI/CD)
5. **Deploy static build** to Hostinger

This workflow keeps content management local while the public site remains static.

