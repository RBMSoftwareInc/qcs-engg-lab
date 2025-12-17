/**
 * Markdown Parser for TipTap
 * Converts Markdown to TipTap JSON and vice versa
 */

import { marked } from 'marked';

/**
 * Convert Markdown to TipTap JSON
 * This is a simplified parser - TipTap will handle the structure
 */
export function markdownToTiptap(markdown: string): any {
	// TipTap can parse markdown directly, but we need to provide a structure
	// For now, we'll use a simple approach and let TipTap handle it
	const tokens = marked.lexer(markdown);
	
	return {
		type: 'doc',
		content: parseTokens(tokens)
	};
}

function parseTokens(tokens: any[]): any[] {
	const nodes: any[] = [];
	
	for (const token of tokens) {
		switch (token.type) {
			case 'heading':
				nodes.push({
					type: 'heading',
					attrs: { level: token.depth },
					content: parseInline(token.tokens || [])
				});
				break;
				
			case 'paragraph':
				nodes.push({
					type: 'paragraph',
					content: parseInline(token.tokens || [])
				});
				break;
				
			case 'list':
				const listType = token.ordered ? 'orderedList' : 'bulletList';
				nodes.push({
					type: listType,
					content: token.items.map((item: any) => ({
						type: 'listItem',
						content: [{
							type: 'paragraph',
							content: parseInline(item.tokens || [])
						}]
					}))
				});
				break;
				
			case 'blockquote':
				nodes.push({
					type: 'blockquote',
					content: parseTokens(token.tokens || [])
				});
				break;
				
			case 'code':
				nodes.push({
					type: 'codeBlock',
					attrs: { language: token.lang || '' },
					content: [{
						type: 'text',
						text: token.text
					}]
				});
				break;
				
			case 'hr':
				nodes.push({
					type: 'horizontalRule'
				});
				break;
				
			default:
				// Fallback to paragraph
				if (token.text) {
					nodes.push({
						type: 'paragraph',
						content: [{
							type: 'text',
							text: token.text
						}]
					});
				}
		}
	}
	
	return nodes;
}

function parseInline(tokens: any[]): any[] {
	const nodes: any[] = [];
	
	for (const token of tokens) {
		switch (token.type) {
			case 'text':
				nodes.push({
					type: 'text',
					text: token.text
				});
				break;
				
			case 'strong':
				nodes.push({
					type: 'text',
					text: token.text,
					marks: [{ type: 'bold' }]
				});
				break;
				
			case 'em':
				nodes.push({
					type: 'text',
					text: token.text,
					marks: [{ type: 'italic' }]
				});
				break;
				
			case 'code':
				nodes.push({
					type: 'text',
					text: token.text,
					marks: [{ type: 'code' }]
				});
				break;
				
			case 'link':
				nodes.push({
					type: 'text',
					text: token.text,
					marks: [{
						type: 'link',
						attrs: { href: token.href }
					}]
				});
				break;
				
			case 'image':
				nodes.push({
					type: 'image',
					attrs: {
						src: token.href,
						alt: token.text || ''
					}
				});
				break;
		}
	}
	
	return nodes;
}

