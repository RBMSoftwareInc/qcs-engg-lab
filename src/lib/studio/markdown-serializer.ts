/**
 * Markdown Serialization Utilities
 * Converts TipTap JSON to Markdown and vice versa
 */

import { Node as ProseMirrorNode } from '@tiptap/pm/model';

export interface MarkdownSerializerOptions {
	hardBreak?: boolean;
	bulletListMarker?: string;
}

/**
 * Convert TipTap JSON to Markdown
 */
export function tiptapToMarkdown(doc: any, options: MarkdownSerializerOptions = {}): string {
	if (!doc || !doc.content) return '';

	const lines: string[] = [];

	function processNode(node: any, depth = 0): void {
		const indent = '  '.repeat(depth);

		switch (node.type) {
			case 'doc':
				if (node.content) {
					node.content.forEach((child: any) => processNode(child, depth));
				}
				break;

			case 'paragraph':
				if (node.content && node.content.length > 0) {
					const text = node.content.map((child: any) => processInline(child)).join('');
					if (text.trim()) {
						lines.push(text);
					} else {
						lines.push('');
					}
				} else {
					lines.push('');
				}
				break;

			case 'heading':
				const level = node.attrs.level || 1;
				const headingText = node.content ? node.content.map((child: any) => processInline(child)).join('') : '';
				lines.push('#'.repeat(level) + ' ' + headingText);
				break;

			case 'bulletList':
				if (node.content) {
					node.content.forEach((item: any) => processNode(item, depth));
				}
				break;

			case 'orderedList':
				if (node.content) {
					node.content.forEach((item: any, index: number) => {
						const itemText = item.content ? item.content.map((child: any) => processInline(child)).join('') : '';
						lines.push(`${index + 1}. ${itemText}`);
					});
				}
				break;

			case 'listItem':
				if (node.content) {
					const itemText = node.content.map((child: any) => {
						if (child.type === 'paragraph') {
							return child.content ? child.content.map((c: any) => processInline(c)).join('') : '';
						}
						return '';
					}).join('');
					lines.push(`- ${itemText}`);
				}
				break;

			case 'blockquote':
				if (node.content) {
					const quoteText = node.content.map((child: any) => {
						if (child.type === 'paragraph') {
							return child.content ? child.content.map((c: any) => processInline(c)).join('') : '';
						}
						return '';
					}).join('\n');
					quoteText.split('\n').forEach((line: string) => {
						lines.push('> ' + line);
					});
				}
				break;

			case 'codeBlock':
				const code = node.content ? node.content.map((child: any) => child.text || '').join('') : '';
				const language = node.attrs.language || '';
				lines.push('```' + language);
				code.split('\n').forEach((line: string) => lines.push(line));
				lines.push('```');
				break;

			case 'horizontalRule':
				lines.push('---');
				break;

			case 'image':
				const src = node.attrs.src || '';
				const alt = node.attrs.alt || '';
				const title = node.attrs.title || '';
				if (title) {
					lines.push(`![${alt}](${src} "${title}")`);
				} else {
					lines.push(`![${alt}](${src})`);
				}
				break;

			case 'hardBreak':
				lines.push('');
				break;

			default:
				if (node.content) {
					node.content.forEach((child: any) => processNode(child, depth));
				}
		}
	}

	function processInline(node: any): string {
		if (typeof node === 'string') return node;

		switch (node.type) {
			case 'text':
				let text = node.text || '';
				// Apply marks
				if (node.marks) {
					for (const mark of node.marks) {
						switch (mark.type) {
							case 'bold':
								text = `**${text}**`;
								break;
							case 'italic':
								text = `*${text}*`;
								break;
							case 'code':
								text = `\`${text}\``;
								break;
							case 'link':
								const href = mark.attrs.href || '';
								text = `[${text}](${href})`;
								break;
						}
					}
				}
				return text;

			case 'hardBreak':
				return '\n';

			default:
				return '';
		}
	}

	processNode(doc);
	return lines.join('\n');
}

/**
 * Convert Markdown to TipTap JSON
 * This is a simplified version - TipTap's markdown extension handles this better
 */
export function markdownToTiptap(markdown: string): any {
	// For now, we'll let TipTap's markdown extension handle parsing
	// This function is a placeholder for custom parsing if needed
	return {
		type: 'doc',
		content: []
	};
}

