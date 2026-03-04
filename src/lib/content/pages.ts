/**
 * Block-based page loader. Reads content/pages/*.json (server-side or at build).
 * Used by the public /page/[slug] route and by Studio API.
 *
 * i18n: optional locale uses content/{locale}/pages/ (e.g. content/fr/pages/home.json).
 * When locale is omitted or is default, uses content/pages/ for backward compatibility.
 */

import type { PageModel } from '$lib/blocks/types';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';

const CONTENT_ROOT = join(process.cwd(), 'content');

function pagesDirForLocale(locale?: Locale): string {
	if (!locale || locale === DEFAULT_LOCALE) {
		return join(CONTENT_ROOT, 'pages');
	}
	return join(CONTENT_ROOT, locale, 'pages');
}

function safePath(slug: string, locale?: Locale): string {
	const clean = slug.replace(/[^a-z0-9-_]/gi, '');
	return join(pagesDirForLocale(locale), `${clean}.json`);
}

/** Write page JSON to local content/pages/ or content/{locale}/pages/ (for dev or when GitHub save fails) */
export function savePageToLocal(slug: string, page: PageModel, locale?: Locale): void {
	const dir = pagesDirForLocale(locale);
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		safePath(slug, locale),
		JSON.stringify(
			{
				title: page.title,
				slug: page.slug ?? slug,
				description: page.description,
				blocks: page.blocks ?? []
			},
			null,
			2
		),
		'utf-8'
	);
}

export function getPageSlugs(locale?: Locale): string[] {
	try {
		const dir = pagesDirForLocale(locale);
		if (!existsSync(dir)) return [];
		const files = readdirSync(dir);
		return files
			.filter((f) => f.endsWith('.json'))
			.map((f) => f.replace(/\.json$/, ''));
	} catch {
		return [];
	}
}

export function getPageBySlug(slug: string, locale?: Locale): PageModel | null {
	try {
		const path = safePath(slug, locale);
		if (!existsSync(path)) return null;
		const raw = readFileSync(path, 'utf-8');
		const data = JSON.parse(raw) as unknown;
		if (!data || typeof data !== 'object' || !Array.isArray((data as PageModel).blocks)) {
			return null;
		}
		const page = data as PageModel;
		// Ensure required fields
		return {
			title: page.title ?? 'Untitled',
			slug: page.slug ?? slug,
			description: page.description,
			blocks: page.blocks ?? []
		};
	} catch {
		return null;
	}
}
