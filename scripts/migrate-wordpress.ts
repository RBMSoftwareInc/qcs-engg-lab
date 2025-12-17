#!/usr/bin/env node
/**
 * WordPress to MDX Migration Tool
 * 
 * Exports WordPress content via REST API and converts to MDX format.
 * Handles HTML to MDX conversion, Elementor markup removal, and frontmatter generation.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { getDefaultMetadata, type ContentType } from '../src/lib/content/schema.js';

interface WordPressPost {
	id: number;
	title: { rendered: string };
	content: { rendered: string };
	excerpt: { rendered: string };
	slug: string;
	date: string;
	modified: string;
	status: string;
	link: string;
	_embedded?: {
		'wp:featuredmedia'?: Array<{ source_url: string }>;
	};
}

interface MigrationOptions {
	wpUrl: string;
	wpUser?: string;
	wpPassword?: string;
	contentType?: ContentType;
	outputDir?: string;
	dryRun?: boolean;
}

/**
 * Fetch WordPress posts via REST API
 */
async function fetchWordPressPosts(options: MigrationOptions): Promise<WordPressPost[]> {
	const { wpUrl, wpUser, wpPassword } = options;
	
	const url = `${wpUrl}/wp-json/wp/v2/posts?per_page=100&status=publish`;
	const headers: HeadersInit = {
		'Content-Type': 'application/json'
	};

	// Add basic auth if provided
	if (wpUser && wpPassword) {
		const credentials = Buffer.from(`${wpUser}:${wpPassword}`).toString('base64');
		headers['Authorization'] = `Basic ${credentials}`;
	}

	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching WordPress posts:', error);
		throw error;
	}
}

/**
 * Strip Elementor markup and clean HTML
 */
function cleanHTML(html: string): string {
	// Remove Elementor wrapper divs
	html = html.replace(/<div[^>]*class="[^"]*elementor[^"]*"[^>]*>/gi, '');
	html = html.replace(/<\/div>/g, ''); // Remove closing divs (simplified)
	
	// Remove empty paragraphs
	html = html.replace(/<p>\s*<\/p>/gi, '');
	
	// Normalize whitespace
	html = html.replace(/\s+/g, ' ').trim();
	
	return html;
}

/**
 * Convert HTML to MDX-compatible markdown
 */
function htmlToMDX(html: string): string {
	// Convert headings
	html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
	html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
	html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
	html = html.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
	
	// Convert paragraphs
	html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
	
	// Convert lists
	html = html.replace(/<ul[^>]*>/gi, '');
	html = html.replace(/<\/ul>/gi, '\n');
	html = html.replace(/<ol[^>]*>/gi, '');
	html = html.replace(/<\/ol>/gi, '\n');
	html = html.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
	
	// Convert links (keep only href and text)
	html = html.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
	
	// Convert images to Figure component
	html = html.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '<Figure src="$1" alt="$2" />');
	html = html.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '<Figure src="$1" />');
	
	// Convert code blocks
	html = html.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```');
	html = html.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
	
	// Convert blockquotes
	html = html.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
	
	// Remove remaining HTML tags (except allowed ones)
	html = html.replace(/<(?!Figure|Diagram)[^>]+>/gi, '');
	
	// Clean up multiple newlines
	html = html.replace(/\n{3,}/g, '\n\n');
	
	return html.trim();
}

/**
 * Generate frontmatter from WordPress post
 */
function generateFrontmatter(post: WordPressPost, options: MigrationOptions): string {
	const metadata = getDefaultMetadata(options.contentType || 'page');
	
	const frontmatter = {
		type: options.contentType || 'page',
		status: 'draft', // Always start as draft for review
		title: post.title.rendered,
		description: post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 160),
		legacyUrl: new URL(post.link).pathname,
		publishedAt: post.date,
		updatedAt: post.modified,
		order: 999
	};

	return `---\n${Object.entries(frontmatter)
		.map(([key, value]) => {
			if (typeof value === 'string' && value.includes('\n')) {
				return `${key}: |\n  ${value.split('\n').join('\n  ')}`;
			}
			return `${key}: ${JSON.stringify(value)}`;
		})
		.join('\n')}\n---\n\n`;
}

/**
 * Migrate WordPress post to MDX
 */
async function migratePost(post: WordPressPost, options: MigrationOptions): Promise<void> {
	const cleanedHTML = cleanHTML(post.content.rendered);
	const mdxContent = htmlToMDX(cleanedHTML);
	const frontmatter = generateFrontmatter(post, options);
	const fullContent = frontmatter + mdxContent;

	const outputDir = options.outputDir || join(process.cwd(), 'content', 'migrated');
	const slug = post.slug;
	const filePath = join(outputDir, `${slug}.mdx`);

	if (!existsSync(dirname(filePath))) {
		mkdirSync(dirname(filePath), { recursive: true });
	}

	if (!options.dryRun) {
		writeFileSync(filePath, fullContent, 'utf-8');
		console.log(`✓ Migrated: ${post.title.rendered} → ${filePath}`);
	} else {
		console.log(`[DRY RUN] Would migrate: ${post.title.rendered} → ${filePath}`);
	}
}

/**
 * Main migration function
 */
async function migrateWordPress(options: MigrationOptions): Promise<void> {
	console.log('Starting WordPress migration...');
	console.log(`Source: ${options.wpUrl}`);
	console.log(`Output: ${options.outputDir || 'content/migrated'}`);
	console.log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}\n`);

	try {
		const posts = await fetchWordPressPosts(options);
		console.log(`Found ${posts.length} posts to migrate\n`);

		for (const post of posts) {
			await migratePost(post, options);
		}

		console.log(`\n✓ Migration complete: ${posts.length} posts processed`);
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}

// CLI interface
const args = process.argv.slice(2);
const options: MigrationOptions = {
	wpUrl: args[0] || process.env.WP_URL || '',
	wpUser: args[1] || process.env.WP_USER,
	wpPassword: args[2] || process.env.WP_PASSWORD,
	contentType: (args[3] as ContentType) || 'page',
	outputDir: args[4],
	dryRun: args.includes('--dry-run')
};

if (!options.wpUrl) {
	console.error('Usage: migrate-wordpress.ts <wp-url> [user] [password] [content-type] [output-dir] [--dry-run]');
	process.exit(1);
}

migrateWordPress(options).catch(console.error);

