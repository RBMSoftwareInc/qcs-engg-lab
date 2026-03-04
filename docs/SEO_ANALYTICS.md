# SEO & Analytics Setup

Make the site discoverable and measurable: search engines, Google Tag Manager (GTM), and Google Analytics 4 (GA4).

## Configure from Studio (recommended)

You can manage SEO and analytics **from the Studio admin** without editing env or code:

1. Log in to **Studio** → **Settings** → open **SEO & Analytics settings**.
2. Edit **Site URL**, **Default title**, **Default description**, **GTM ID**, **GA Measurement ID**, default **OG image**, and **Twitter handle**.
3. Click **Save SEO config**. Values are stored in `config/seo.json` in the repo and used on the next build or deploy.

Env vars (e.g. `VITE_PUBLIC_SITE_URL`, `VITE_GTM_ID`) still work and can override or fill in when the config file is missing.

## What’s already in the app

- **Meta tags**: Per-page `<title>` and `<meta name="description">` (from content or defaults).
- **Canonical URL**: `<link rel="canonical">` on every page (uses `VITE_PUBLIC_SITE_URL` when set).
- **Open Graph**: `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type` for sharing.
- **Twitter Card**: `twitter:card`, `twitter:title`, `twitter:description`.
- **JSON-LD**: Organization and WebSite schema for rich results in search.
- **Sitemap**: `/sitemap.xml` (generated from static routes + content).
- **robots.txt**: Allows all crawlers and points to the sitemap.
- **GTM & GA4**: Loaded only when you set the env vars below (no scripts if unset).

## Environment variables

Add to `.env` (and to your host’s env in production):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_PUBLIC_SITE_URL` | Public site URL (no trailing slash). Used for canonical, OG, and sitemap. | `https://quantumcoresolutions.com` |
| `VITE_GTM_ID` | Google Tag Manager container ID. Leave empty to disable GTM. | `GTM-XXXXXXX` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID. Leave empty to disable GA4. | `G-XXXXXXXXXX` |

- If `VITE_PUBLIC_SITE_URL` is not set, the app falls back to `window.location.origin` in the browser and a default in sitemap.
- GTM and GA4 scripts are only injected when the corresponding ID is set.

## Google Tag Manager (GTM)

1. Create a container at [tagmanager.google.com](https://tagmanager.google.com) (Web).
2. Copy the container ID (e.g. `GTM-XXXXXXX`).
3. Set `VITE_GTM_ID=GTM-XXXXXXX` in `.env` and in your production environment.
4. In GTM, add tags (e.g. GA4, conversion pixels) and publish. The app only loads the GTM snippet; all tags are managed in GTM.

## Google Analytics 4 (GA4)

**Option A – Via GTM**  
Add a GA4 tag in GTM using your Measurement ID. You do not need `VITE_GA_MEASUREMENT_ID` unless you want the script loaded directly.

**Option B – Direct GA4**  
1. Create a GA4 property at [analytics.google.com](https://analytics.google.com).  
2. Copy the Measurement ID (e.g. `G-XXXXXXXXXX`).  
3. Set `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in `.env` and in production.  
4. The app will load `gtag.js` and send page views.

## Google Search Console & ranking

1. **Verify ownership**  
   - Go to [Search Console](https://search.google.com/search-console).  
   - Add your property (e.g. `https://quantumcoresolutions.com`).  
   - Use “HTML tag” verification: add the meta tag they give you to `<head>`.  
   - Or use DNS or file verification if you prefer.

2. **Submit sitemap**  
   - In Search Console → Sitemaps, submit: `https://yourdomain.com/sitemap.xml`.  
   - Ensure `VITE_PUBLIC_SITE_URL` (or your production URL) matches the domain you verified.

3. **robots.txt**  
   - The repo’s `static/robots.txt` points the Sitemap to `https://quantumcoresolutions.com/sitemap.xml`.  
   - If your live site uses a different domain, either:  
     - Set `VITE_PUBLIC_SITE_URL` to that domain and serve `robots.txt` from a route that outputs the same Sitemap URL, or  
     - Replace the Sitemap line in `static/robots.txt` with your real domain.

4. **Ranking**  
   - Ranking is determined by Google (relevance, quality, links, etc.).  
   - Good foundations already in place: unique titles and descriptions, canonical URLs, sitemap, fast static pages.  
   - Use Search Console to monitor indexing, queries, and any issues.

## Per-page OG image (optional)

For a page to override the default OG image (e.g. for an article), add in that page’s `svelte:head`:

```html
<meta property="og:image" content="https://yourdomain.com/path/to/image.jpg" />
<meta name="twitter:image" content="https://yourdomain.com/path/to/image.jpg" />
```

Use absolute URLs for `og:image` and `twitter:image`.

## Summary checklist

- [ ] Set `VITE_PUBLIC_SITE_URL` to your production URL.
- [ ] Set `VITE_GTM_ID` and/or `VITE_GA_MEASUREMENT_ID` if you use GTM/GA4.
- [ ] Verify the site in Google Search Console.
- [ ] Submit `https://yourdomain.com/sitemap.xml` in Search Console.
- [ ] Update `static/robots.txt` Sitemap line if your domain is not quantumcoresolutions.com.
