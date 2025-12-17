import { marked } from 'marked';
import fm from 'front-matter';

export interface ContentMetadata {
	title: string;
	order?: number;
	description?: string;
	[key: string]: any;
}

export interface ContentItem {
	metadata: ContentMetadata;
	content: string;
	html: string;
	slug: string;
	path: string;
}

// Load all markdown files as raw text
const contentModules = import.meta.glob('/content/**/*.md', { 
	eager: true, 
	query: '?raw'
});

export function loadContent(): ContentItem[] {
	const items: ContentItem[] = [];

	for (const path in contentModules) {
		const module = contentModules[path] as any;
		const rawContent = typeof module === 'string' ? module : module.default || module;

		// Parse frontmatter
		const parsed = fm<ContentMetadata>(rawContent);
		
		// Convert markdown to HTML
		const html = marked.parse(parsed.body) as string;

		// Extract slug from path
		const slug = path
			.replace('/content/', '')
			.replace('.md', '')
			.split('/')
			.pop() || '';

		items.push({
			metadata: parsed.attributes,
			content: parsed.body,
			html,
			slug,
			path
		});
	}

	// Sort by order if present
	return items.sort((a, b) => {
		const orderA = a.metadata.order ?? 999;
		const orderB = b.metadata.order ?? 999;
		return orderA - orderB;
	});
}

export function loadContentByPath(path: string): ContentItem | null {
	const items = loadContent();
	return items.find(item => item.path.includes(path)) || null;
}

export function loadContentBySlug(slug: string): ContentItem | null {
	const items = loadContent();
	return items.find(item => item.slug === slug) || null;
}

export function loadContentByDirectory(dir: string): ContentItem[] {
	const items = loadContent();
	return items.filter(item => item.path.includes(`/content/${dir}/`));
}
