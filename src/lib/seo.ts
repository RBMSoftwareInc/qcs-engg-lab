/**
 * SEO helpers: base URL, default meta, JSON-LD for search and social.
 * Use VITE_PUBLIC_SITE_URL in .env (e.g. https://yoursite.com) for canonical and OG URLs.
 */

const SITE_NAME = 'QuantumCore Solutions';
const DEFAULT_DESCRIPTION =
	'Architecture before infrastructure. Systems designed to evolve. Engineering lab focused on systems architecture and research-driven development.';

function getEnv(key: string): string {
	if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[key] !== 'undefined') {
		return String(import.meta.env[key]);
	}
	if (typeof process !== 'undefined' && process.env && process.env[key]) {
		return String(process.env[key]);
	}
	return '';
}

/** Public site URL (no trailing slash). Prefer override from Studio config, then env. */
export function getBaseUrl(override?: string | null): string {
	if (override && override.trim()) return override.replace(/\/$/, '');
	const url = getEnv('VITE_PUBLIC_SITE_URL') || getEnv('PUBLIC_SITE_URL');
	if (url) return url.replace(/\/$/, '');
	if (typeof window !== 'undefined') return window.location.origin;
	return 'https://quantumcoresolutions.com';
}

/** Full URL for a path (e.g. /practice → https://yoursite.com/practice) */
export function fullUrl(path: string): string {
	const base = getBaseUrl();
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${base}${p}`;
}

export interface PageMeta {
	title?: string;
	description?: string;
	image?: string;
	path?: string;
	type?: 'website' | 'article';
	publishedTime?: string;
	modifiedTime?: string;
}

/** Default meta for layout. Pass Studio config overrides when available. */
export function getDefaultMeta(overrides?: {
	defaultTitle?: string | null;
	defaultDescription?: string | null;
} | null): { title: string; description: string; siteName: string } {
	return {
		title: (overrides?.defaultTitle && overrides.defaultTitle.trim()) || SITE_NAME,
		description:
			(overrides?.defaultDescription && overrides.defaultDescription.trim()) || DEFAULT_DESCRIPTION,
		siteName: SITE_NAME
	};
}

/** JSON-LD Organization + WebSite for rich results. Pass baseUrl from Studio config when available. */
export function getOrganizationJsonLd(baseUrlOverride?: string | null): string {
	const base = getBaseUrl(baseUrlOverride);
	const data = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: base,
		description: DEFAULT_DESCRIPTION,
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Sharjah',
			addressCountry: 'AE'
		}
	};
	return JSON.stringify(data);
}

/** JSON-LD WebSite. Pass baseUrl from Studio config when available. */
export function getWebSiteJsonLd(baseUrlOverride?: string | null): string {
	const base = getBaseUrl(baseUrlOverride);
	const data = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: base,
		description: DEFAULT_DESCRIPTION,
		publisher: { '@type': 'Organization', name: SITE_NAME }
	};
	return JSON.stringify(data);
}

/** JSON-LD for an article/page (use in insight, signal, practice detail pages if desired) */
export function getArticleJsonLd(meta: PageMeta): string {
	const base = getBaseUrl();
	const url = meta.path ? fullUrl(meta.path) : base;
	const data = {
		'@context': 'https://schema.org',
		'@type': meta.type === 'article' ? 'Article' : 'WebPage',
		name: meta.title || SITE_NAME,
		description: meta.description || DEFAULT_DESCRIPTION,
		url,
		...(meta.image && { image: meta.image.startsWith('http') ? meta.image : fullUrl(meta.image) }),
		...(meta.publishedTime && { datePublished: meta.publishedTime }),
		...(meta.modifiedTime && { dateModified: meta.modifiedTime })
	};
	return JSON.stringify(data);
}
