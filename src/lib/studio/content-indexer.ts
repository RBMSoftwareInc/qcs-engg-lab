/**
 * QCS Studio Content Indexer
 * Scans and indexes markdown files in /content directory
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';
import fm from 'front-matter';

export interface ContentFile {
	path: string;
	relativePath: string;
	slug: string;
	title: string;
	status?: string;
	updatedAt?: string;
	createdAt?: string;
	content: string;
	metadata: Record<string, any>;
}

/**
 * Recursively scan directory for markdown files
 */
async function scanDirectory(dirPath: string, basePath: string): Promise<ContentFile[]> {
	const files: ContentFile[] = [];
	const entries = await readdir(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dirPath, entry.name);

		if (entry.isDirectory()) {
			const subFiles = await scanDirectory(fullPath, basePath);
			files.push(...subFiles);
		} else if (entry.isFile() && extname(entry.name) === '.md') {
			try {
				const content = await readFile(fullPath, 'utf-8');
				const parsed = fm<any>(content);
				const stats = await stat(fullPath);

				const relativePath = relative(basePath, fullPath);
				const slug = relativePath.replace(/\.md$/, '').replace(/\//g, '-');

				files.push({
					path: fullPath,
					relativePath,
					slug,
					title: parsed.attributes.title || entry.name.replace(/\.md$/, ''),
					status: parsed.attributes.status || 'draft',
					updatedAt: stats.mtime.toISOString(),
					createdAt: stats.birthtime.toISOString(),
					content: parsed.body,
					metadata: parsed.attributes
				});
			} catch (error) {
				console.warn(`Failed to read ${fullPath}:`, error);
			}
		}
	}

	return files;
}

/**
 * Index all content files
 */
export async function indexContent(contentDir: string): Promise<ContentFile[]> {
	try {
		const files = await scanDirectory(contentDir, contentDir);
		return files.sort((a, b) => {
			// Sort by directory, then by title
			const aDir = a.relativePath.split('/')[0];
			const bDir = b.relativePath.split('/')[0];
			if (aDir !== bDir) return aDir.localeCompare(bDir);
			return a.title.localeCompare(b.title);
		});
	} catch (error) {
		console.error('Failed to index content:', error);
		return [];
	}
}

/**
 * Group files by directory/category
 */
export function groupByCategory(files: ContentFile[]): Record<string, ContentFile[]> {
	const groups: Record<string, ContentFile[]> = {};

	for (const file of files) {
		const category = file.relativePath.split('/')[0] || 'root';
		if (!groups[category]) {
			groups[category] = [];
		}
		groups[category].push(file);
	}

	return groups;
}

