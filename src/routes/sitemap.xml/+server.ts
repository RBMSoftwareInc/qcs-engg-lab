import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

function getBaseUrl(): string {
	const configPath = join(process.cwd(), 'config/seo.json');
	if (existsSync(configPath)) {
		try {
			const raw = readFileSync(configPath, 'utf-8');
			const parsed = JSON.parse(raw) as { siteUrl?: string };
			if (parsed.siteUrl && typeof parsed.siteUrl === 'string' && parsed.siteUrl.trim()) {
				return parsed.siteUrl.trim().replace(/\/$/, '');
			}
		} catch {
			// ignore
		}
	}
	return process.env.VITE_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || 'https://quantumcoresolutions.com';
}

function getStaticRoutes(): string[] {
	return [
		'',
		'/about',
		'/practice',
		'/philosophy',
		'/insights',
		'/signals',
		'/research',
		'/domains',
		'/services'
	];
}

function getContentSlugs(contentDir: string, subdir: string): string[] {
	const dir = join(contentDir, subdir);
	const slugs: string[] = [];
	try {
		if (!statSync(dir).isDirectory()) return slugs;
		for (const name of readdirSync(dir)) {
			const full = join(dir, name);
			if (statSync(full).isDirectory()) {
				slugs.push(name);
			} else if (name.endsWith('.md') || name.endsWith('.mdx')) {
				slugs.push(name.replace(/\.(md|mdx)$/, ''));
			}
		}
	} catch {
		// dir may not exist
	}
	return slugs;
}

function getAllContentUrls(contentDir: string): string[] {
	const urls: string[] = [];
	const practiceSlugs = new Set<string>();

	for (const subdir of ['domains', 'services']) {
		const slugs = getContentSlugs(contentDir, subdir);
		for (const slug of slugs) {
			urls.push(`/${subdir}/${slug}`);
			practiceSlugs.add(slug);
		}
	}
	for (const subdir of ['insights', 'signals']) {
		const slugs = getContentSlugs(contentDir, subdir);
		for (const slug of slugs) urls.push(`/${subdir}/${slug}`);
	}
	for (const slug of practiceSlugs) {
		urls.push(`/practice/${slug}`);
	}
	return urls;
}

export async function GET() {
	const BASE_URL = getBaseUrl();
	const contentDir = join(process.cwd(), 'content');
	const staticRoutes = getStaticRoutes();
	const contentUrls = getAllContentUrls(contentDir);
	const allPaths = [...staticRoutes, ...contentUrls];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
	.map(
		(path) => `  <url>
    <loc>${BASE_URL}${path.startsWith('/') ? path : '/' + path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : path.split('/').filter(Boolean).length === 1 ? '0.9' : '0.8'}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
