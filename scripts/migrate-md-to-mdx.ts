#!/usr/bin/env node
/**
 * Migrate .md files to .mdx with proper frontmatter
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import fm from 'front-matter';
import type { ContentMetadata } from '../src/lib/content/schema.js';

interface LegacyMetadata {
	title: string;
	order?: number;
	description?: string;
	diagram?: string;
	icon?: string;
	image?: string;
	category?: string;
	type?: string;
	date?: string;
	heroImage?: string;
	features?: string[];
	benefits?: Array<{ title: string; description: string }>;
	[key: string]: any;
}

/**
 * Determine content type from directory path
 */
function getContentTypeFromPath(filePath: string): ContentMetadata['type'] {
	if (filePath.includes('/domains/')) return 'domain';
	if (filePath.includes('/signals/')) return 'signal';
	if (filePath.includes('/services/')) return 'service';
	if (filePath.includes('/insights/') || filePath.includes('/field-notes/')) return 'field-note';
	if (filePath.includes('/about/')) return 'page';
	if (filePath.includes('/hero/')) return 'page';
	if (filePath.includes('/philosophy/')) return 'page';
	if (filePath.includes('/research/')) return 'insight';
	return 'page';
}

/**
 * Convert legacy metadata to new schema
 */
function convertMetadata(legacy: LegacyMetadata, filePath: string): ContentMetadata {
	const type = getContentTypeFromPath(filePath);
	const now = new Date().toISOString();

	const base: Partial<ContentMetadata> = {
		type,
		status: 'live', // All existing content is live
		title: legacy.title || 'Untitled',
		description: legacy.description,
		order: legacy.order ?? 999,
		publishedAt: legacy.date ? new Date(legacy.date).toISOString() : now,
		updatedAt: now
	};

	// Type-specific fields
	if (type === 'domain') {
		return {
			...base,
			type: 'domain',
			icon: legacy.icon,
			diagram: legacy.diagram
		} as DomainMetadata;
	}

	if (type === 'signal') {
		return {
			...base,
			type: 'signal',
			category: legacy.category || 'case-study',
			icon: legacy.icon as 'scale' | 'analytics' | 'cloud' | 'intelligence' | undefined,
			image: legacy.image
		} as SignalMetadata;
	}

	if (type === 'service') {
		return {
			...base,
			type: 'service',
			icon: legacy.icon as 'architecture' | 'development' | 'team' | 'optimization' | 'consulting' | undefined,
			features: legacy.features,
			benefits: legacy.benefits
		} as ServiceMetadata;
	}

	if (type === 'field-note') {
		return {
			...base,
			type: 'field-note',
			category: legacy.category || legacy.type,
			heroImage: legacy.image || legacy.heroImage
		} as FieldNoteMetadata;
	}

	if (type === 'insight') {
		return {
			...base,
			type: 'insight',
			category: legacy.category,
			heroImage: legacy.image || legacy.heroImage
		} as InsightMetadata;
	}

	return base as PageMetadata;
}

/**
 * Format frontmatter as YAML string
 */
function formatFrontmatter(metadata: ContentMetadata): string {
	const lines: string[] = ['---'];

	for (const [key, value] of Object.entries(metadata)) {
		if (value === undefined || value === null) continue;

		if (Array.isArray(value)) {
			if (value.length === 0) continue;
			
			// Handle benefits array
			if (key === 'benefits' && typeof value[0] === 'object') {
				lines.push(`${key}:`);
				for (const item of value) {
					lines.push(`  - title: ${JSON.stringify(item.title)}`);
					lines.push(`    description: ${JSON.stringify(item.description)}`);
				}
			} else {
				lines.push(`${key}:`);
				for (const item of value) {
					lines.push(`  - ${JSON.stringify(item)}`);
				}
			}
		} else if (typeof value === 'object') {
			lines.push(`${key}:`);
			for (const [k, v] of Object.entries(value)) {
				lines.push(`  ${k}: ${JSON.stringify(v)}`);
			}
		} else {
			lines.push(`${key}: ${JSON.stringify(value)}`);
		}
	}

	lines.push('---');
	return lines.join('\n');
}

/**
 * Find all .md files recursively
 */
function findMarkdownFiles(dir: string, fileList: string[] = []): string[] {
	if (!existsSync(dir) || !statSync(dir).isDirectory()) {
		return fileList;
	}

	const files = readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			findMarkdownFiles(filePath, fileList);
		} else if (extname(file) === '.md') {
			fileList.push(filePath);
		}
	}

	return fileList;
}

/**
 * Migrate a single file
 */
function migrateFile(filePath: string): { success: boolean; error?: string } {
	try {
		const content = readFileSync(filePath, 'utf-8');
		const parsed = fm<LegacyMetadata>(content);

		// Convert metadata
		const newMetadata = convertMetadata(parsed.attributes, filePath);

		// Format new frontmatter
		const frontmatter = formatFrontmatter(newMetadata);

		// Create .mdx content
		const mdxContent = frontmatter + '\n\n' + parsed.body.trim() + '\n';

		// Write .mdx file
		const mdxPath = filePath.replace('.md', '.mdx');
		writeFileSync(mdxPath, mdxContent, 'utf-8');

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}

/**
 * Main migration function
 */
function migrateAll(): void {
	const contentDir = join(process.cwd(), 'content');
	const files = findMarkdownFiles(contentDir);

	console.log(`Found ${files.length} .md files to migrate\n`);

	let successCount = 0;
	let errorCount = 0;

	for (const file of files) {
		const result = migrateFile(file);
		const relativePath = file.replace(process.cwd() + '/', '');

		if (result.success) {
			console.log(`✓ ${relativePath} → ${relativePath.replace('.md', '.mdx')}`);
			successCount++;
		} else {
			console.error(`✗ ${relativePath}: ${result.error}`);
			errorCount++;
		}
	}

	console.log(`\n✓ Migration complete:`);
	console.log(`  Success: ${successCount}`);
	console.log(`  Errors: ${errorCount}`);
	console.log(`\nNote: Original .md files are preserved. Review .mdx files and delete .md files when ready.`);
}

// Run migration
migrateAll();

