#!/usr/bin/env node
/**
 * Redirect Mapping Generator
 * 
 * Generates Hostinger-compatible redirect rules from MDX frontmatter.
 * Outputs .htaccess format for Apache servers.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import fm from 'front-matter';
import type { ContentMetadata } from '../src/lib/content/schema.js';

/**
 * Recursively find all MDX/MD files
 */
function findContentFiles(dir: string, fileList: string[] = []): string[] {
	const files = readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			findContentFiles(filePath, fileList);
		} else if (extname(file) === '.mdx' || extname(file) === '.md') {
			fileList.push(filePath);
		}
	}

	return fileList;
}

/**
 * Generate redirect mappings from content files
 */
function getRedirectMappings(): Map<string, string> {
	const mappings = new Map<string, string>();
	const contentDir = join(process.cwd(), 'content');
	
	if (!statSync(contentDir).isDirectory()) {
		console.warn('Content directory not found');
		return mappings;
	}

	const files = findContentFiles(contentDir);

	for (const filePath of files) {
		try {
			const content = readFileSync(filePath, 'utf-8');
			const parsed = fm<ContentMetadata>(content);
			
			if (parsed.attributes.legacyUrl) {
				// Generate route from type and slug
				const slug = filePath
					.replace(process.cwd() + '/content/', '')
					.replace(/\.(mdx|md)$/, '')
					.split('/')
					.pop() || '';

				const type = parsed.attributes.type || 'page';
				const routeMap: Record<string, string> = {
					'page': '',
					'domain': '/domains',
					'field-note': '/insights',
					'signal': '/signals',
					'service': '/services',
					'insight': '/insights'
				};

				const base = routeMap[type] || '';
				const route = base ? `${base}/${slug}` : `/${slug}`;
				
				mappings.set(parsed.attributes.legacyUrl, route);
			}
		} catch (error) {
			console.warn(`Error processing ${filePath}:`, error);
		}
	}

	return mappings;
}

const mappings = getRedirectMappings();
const outputPath = join(process.cwd(), 'build', '.htaccess');

// Generate .htaccess redirect rules
const redirectRules = Array.from(mappings.entries())
	.map(([from, to]) => {
		// Ensure paths are properly formatted
		const fromPath = from.startsWith('/') ? from : `/${from}`;
		const toPath = to.startsWith('/') ? to : `/${to}`;
		
		// 301 Permanent Redirect
		return `RewriteRule ^${fromPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$ ${toPath} [R=301,L]`;
	})
	.join('\n');

const htaccessContent = `# Auto-generated redirect rules
# Generated at: ${new Date().toISOString()}
# Total redirects: ${mappings.size}

<IfModule mod_rewrite.c>
RewriteEngine On
${redirectRules}
</IfModule>
`;

// Also generate JSON mapping for reference
const jsonMapping = Object.fromEntries(mappings);
const jsonPath = join(process.cwd(), 'build', 'redirects.json');
writeFileSync(jsonPath, JSON.stringify(jsonMapping, null, 2));

writeFileSync(outputPath, htaccessContent);

console.log(`✓ Generated ${mappings.size} redirect rules`);
console.log(`✓ Output: ${outputPath}`);
console.log(`✓ JSON mapping: ${jsonPath}`);

