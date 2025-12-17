/**
 * MDX Content Loader
 * 
 * Loads and processes MDX files with frontmatter validation,
 * status filtering, and dynamic route generation.
 */

import fm from 'front-matter';
import { validateMetadata, type ContentMetadata, type ContentStatus } from './schema';

export interface MDXContentItem {
	metadata: ContentMetadata;
	content: string;
	slug: string;
	path: string;
	route: string;
}

// Load all MDX files as raw text
const mdxModules = import.meta.glob('/content/**/*.mdx', {
	eager: true,
	query: '?raw'
});

// Fallback to .md files during migration
const mdModules = import.meta.glob('/content/**/*.md', {
	eager: true,
	query: '?raw'
});

/**
 * Load all MDX content items
 */
export function loadMDXContent(status: ContentStatus = 'live'): MDXContentItem[] {
	const items: MDXContentItem[] = [];

	// Process MDX files
	for (const path in mdxModules) {
		const module = mdxModules[path] as any;
		const rawContent = typeof module === 'string' ? module : module.default || module;

		try {
			const parsed = fm<ContentMetadata>(rawContent);
			
			// Validate metadata
			const validation = validateMetadata(parsed.attributes);
			if (!validation.valid) {
				console.warn(`Invalid metadata in ${path}:`, validation.errors);
				continue;
			}

			// Filter by status
			if (parsed.attributes.status !== status && status !== 'all') {
				continue;
			}

			const slug = extractSlug(path);
			const route = generateRoute(parsed.attributes.type, slug);

			items.push({
				metadata: parsed.attributes,
				content: parsed.body,
				slug,
				path,
				route
			});
		} catch (error) {
			console.error(`Error processing ${path}:`, error);
		}
	}

	// Process legacy .md files (during migration)
	// Only process if .mdx version doesn't exist
	const mdxPaths = new Set(Object.keys(mdxModules));
	
	for (const path in mdModules) {
		// Skip if MDX version exists
		const mdxPath = path.replace('.md', '.mdx');
		if (mdxPaths.has(mdxPath)) {
			continue;
		}

		const module = mdModules[path] as any;
		const rawContent = typeof module === 'string' ? module : module.default || module;

		try {
			const parsed = fm<ContentMetadata>(rawContent);
			
			// Validate and convert legacy metadata
			const metadata = normalizeLegacyMetadata(parsed.attributes);
			const validation = validateMetadata(metadata);
			
			if (!validation.valid) {
				console.warn(`Invalid metadata in ${path}:`, validation.errors);
				continue;
			}

			if (metadata.status !== status && status !== 'all') {
				continue;
			}

			const slug = extractSlug(path);
			const route = generateRoute(metadata.type, slug);

			items.push({
				metadata,
				content: parsed.body,
				slug,
				path,
				route
			});
		} catch (error) {
			console.error(`Error processing ${path}:`, error);
		}
	}

	// Sort by order, then by title
	return items.sort((a, b) => {
		const orderA = a.metadata.order ?? 999;
		const orderB = b.metadata.order ?? 999;
		if (orderA !== orderB) {
			return orderA - orderB;
		}
		return a.metadata.title.localeCompare(b.metadata.title);
	});
}

/**
 * Load content by slug
 */
export function loadMDXBySlug(slug: string, status: ContentStatus = 'live'): MDXContentItem | null {
	const items = loadMDXContent(status);
	return items.find(item => item.slug === slug) || null;
}

/**
 * Load content by directory
 */
export function loadMDXByDirectory(dir: string, status: ContentStatus = 'live'): MDXContentItem[] {
	const items = loadMDXContent(status);
	return items.filter(item => item.path.includes(`/content/${dir}/`));
}

/**
 * Load content by type
 */
export function loadMDXByType(type: ContentMetadata['type'], status: ContentStatus = 'live'): MDXContentItem[] {
	const items = loadMDXContent(status);
	return items.filter(item => item.metadata.type === type);
}

/**
 * Extract slug from file path
 */
function extractSlug(path: string): string {
	return path
		.replace('/content/', '')
		.replace(/\.(mdx|md)$/, '')
		.split('/')
		.pop() || '';
}

/**
 * Generate route from content type and slug
 */
function generateRoute(type: ContentMetadata['type'], slug: string): string {
	const routeMap: Record<ContentMetadata['type'], string> = {
		'page': '',
		'domain': '/domains',
		'field-note': '/insights',
		'signal': '/signals',
		'service': '/services',
		'insight': '/insights'
	};

	const base = routeMap[type] || '';
	return base ? `${base}/${slug}` : `/${slug}`;
}

/**
 * Normalize legacy metadata to new schema
 */
function normalizeLegacyMetadata(metadata: any): ContentMetadata {
	// Infer type from path if not present
	if (!metadata.type) {
		if (metadata.diagram) {
			metadata.type = 'domain';
		} else if (metadata.category === 'case-study') {
			metadata.type = 'signal';
		} else {
			metadata.type = 'field-note';
		}
	}

	// Set status to live if not present (legacy content is assumed live)
	if (!metadata.status) {
		metadata.status = 'live';
	}

	return metadata as ContentMetadata;
}

/**
 * Get all redirect mappings from content
 */
export function getRedirectMappings(): Map<string, string> {
	const mappings = new Map<string, string>();
	const items = loadMDXContent('all'); // Get all statuses for redirect mapping

	for (const item of items) {
		if (item.metadata.legacyUrl) {
			mappings.set(item.metadata.legacyUrl, item.route);
		}
	}

	return mappings;
}

