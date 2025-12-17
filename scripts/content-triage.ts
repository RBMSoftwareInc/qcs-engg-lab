#!/usr/bin/env node
/**
 * Content Triage Tool
 * 
 * Analyzes content and provides recommendations:
 * - Keep / Rewrite / Drop
 * - Flags thin or duplicate content
 * - Encourages aggressive pruning
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
 * Load all content files
 */
function loadAllContent(): Array<{ path: string; slug: string; metadata: ContentMetadata; content: string }> {
	const items: Array<{ path: string; slug: string; metadata: ContentMetadata; content: string }> = [];
	const contentDir = join(process.cwd(), 'content');
	
	if (!statSync(contentDir).isDirectory()) {
		return items;
	}

	const files = findContentFiles(contentDir);

	for (const filePath of files) {
		try {
			const content = readFileSync(filePath, 'utf-8');
			const parsed = fm<ContentMetadata>(content);
			
			const slug = filePath
				.replace(process.cwd() + '/content/', '')
				.replace(/\.(mdx|md)$/, '')
				.split('/')
				.pop() || '';

			// Normalize legacy metadata
			if (!parsed.attributes.type) {
				parsed.attributes.type = 'field-note';
			}
			if (!parsed.attributes.status) {
				parsed.attributes.status = 'live';
			}

			items.push({
				path: filePath,
				slug,
				metadata: parsed.attributes as ContentMetadata,
				content: parsed.body
			});
		} catch (error) {
			console.warn(`Error processing ${filePath}:`, error);
		}
	}

	return items;
}

interface TriageResult {
	path: string;
	slug: string;
	title: string;
	status: 'keep' | 'rewrite' | 'drop';
	reason: string;
	wordCount: number;
	issues: string[];
	recommendations: string[];
}

function analyzeContent(content: string): {
	wordCount: number;
	issues: string[];
	recommendations: string[];
} {
	const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
	const issues: string[] = [];
	const recommendations: string[] = [];

	// Check for thin content
	if (wordCount < 200) {
		issues.push('Thin content (< 200 words)');
		recommendations.push('Consider expanding or merging with related content');
	}

	// Check for marketing language
	const marketingPatterns = [
		/\b(amazing|incredible|revolutionary|game-changing|cutting-edge|next-generation)\b/gi,
		/\b(transform|revolutionize|disrupt|leverage|empower|unlock)\b/gi,
		/\b(best|top|leading|premier|world-class)\b/gi
	];

	let marketingCount = 0;
	for (const pattern of marketingPatterns) {
		const matches = content.match(pattern);
		if (matches) {
			marketingCount += matches.length;
		}
	}

	if (marketingCount > 3) {
		issues.push(`Marketing language detected (${marketingCount} instances)`);
		recommendations.push('Replace marketing verbs with declarative statements');
	}

	// Check for duplicate phrases
	const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
	const phraseMap = new Map<string, number>();
	
	for (const sentence of sentences) {
		const words = sentence.toLowerCase().split(/\s+/).slice(0, 5).join(' ');
		phraseMap.set(words, (phraseMap.get(words) || 0) + 1);
	}

	const duplicates = Array.from(phraseMap.entries())
		.filter(([_, count]) => count > 2)
		.length;

	if (duplicates > 0) {
		issues.push(`Repetitive phrasing detected`);
		recommendations.push('Vary sentence structure and vocabulary');
	}

	// Check for proper structure
	const hasH2 = /^##\s+/m.test(content);
	const hasH3 = /^###\s+/m.test(content);
	
	if (!hasH2 && wordCount > 300) {
		issues.push('Missing section structure (no H2 headings)');
		recommendations.push('Add section headings for better organization');
	}

	// Check for code examples (good for technical content)
	const hasCodeBlocks = /```/.test(content);
	if (!hasCodeBlocks && wordCount > 500) {
		recommendations.push('Consider adding code examples or diagrams');
	}

	return { wordCount, issues, recommendations };
}

function triageContent(): TriageResult[] {
	const items = loadAllContent();
	const results: TriageResult[] = [];

	for (const item of items) {
		const analysis = analyzeContent(item.content);
		
		// Determine status
		let status: 'keep' | 'rewrite' | 'drop' = 'keep';
		let reason = 'Content meets quality standards';

		if (item.metadata.status === 'draft') {
			status = 'rewrite';
			reason = 'Draft status - needs completion';
		} else if (analysis.wordCount < 150) {
			status = 'drop';
			reason = 'Too thin - consider merging or removing';
		} else if (analysis.issues.length > 2) {
			status = 'rewrite';
			reason = 'Multiple quality issues detected';
		} else if (analysis.issues.some(i => i.includes('Marketing'))) {
			status = 'rewrite';
			reason = 'Contains marketing language - needs revision';
		}

		results.push({
			path: item.path,
			slug: item.slug,
			title: item.metadata.title,
			status,
			reason,
			wordCount: analysis.wordCount,
			issues: analysis.issues,
			recommendations: analysis.recommendations
		});
	}

	return results.sort((a, b) => {
		const statusOrder = { drop: 0, rewrite: 1, keep: 2 };
		return statusOrder[a.status] - statusOrder[b.status];
	});
}

function generateReport(results: TriageResult[]): string {
	const byStatus = {
		keep: results.filter(r => r.status === 'keep'),
		rewrite: results.filter(r => r.status === 'rewrite'),
		drop: results.filter(r => r.status === 'drop')
	};

	let report = `# Content Triage Report\n\n`;
	report += `Generated: ${new Date().toISOString()}\n\n`;
	report += `## Summary\n\n`;
	report += `- **Keep**: ${byStatus.keep.length}\n`;
	report += `- **Rewrite**: ${byStatus.rewrite.length}\n`;
	report += `- **Drop**: ${byStatus.drop.length}\n\n`;

	report += `## Recommendations\n\n`;
	report += `### Drop (${byStatus.drop.length})\n\n`;
	for (const item of byStatus.drop) {
		report += `- **${item.title}** (${item.slug})\n`;
		report += `  - Reason: ${item.reason}\n`;
		report += `  - Word count: ${item.wordCount}\n`;
		if (item.issues.length > 0) {
			report += `  - Issues: ${item.issues.join(', ')}\n`;
		}
		report += `\n`;
	}

	report += `### Rewrite (${byStatus.rewrite.length})\n\n`;
	for (const item of byStatus.rewrite) {
		report += `- **${item.title}** (${item.slug})\n`;
		report += `  - Reason: ${item.reason}\n`;
		report += `  - Word count: ${item.wordCount}\n`;
		if (item.issues.length > 0) {
			report += `  - Issues: ${item.issues.join(', ')}\n`;
		}
		if (item.recommendations.length > 0) {
			report += `  - Recommendations: ${item.recommendations.join('; ')}\n`;
		}
		report += `\n`;
	}

	report += `### Keep (${byStatus.keep.length})\n\n`;
	for (const item of byStatus.keep) {
		report += `- **${item.title}** (${item.slug}) - ${item.wordCount} words\n`;
	}

	return report;
}

// Main execution
const results = triageContent();
const report = generateReport(results);

const reportPath = join(process.cwd(), 'content-triage-report.md');
writeFileSync(reportPath, report);

console.log('✓ Content triage complete');
console.log(`✓ Report: ${reportPath}`);
console.log(`\nSummary:`);
console.log(`  Keep: ${results.filter(r => r.status === 'keep').length}`);
console.log(`  Rewrite: ${results.filter(r => r.status === 'rewrite').length}`);
console.log(`  Drop: ${results.filter(r => r.status === 'drop').length}`);

