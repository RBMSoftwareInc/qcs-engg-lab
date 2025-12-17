/**
 * MDX Configuration
 * 
 * Defines MDX processing rules and allowed components.
 * This enforces content governance at the build level.
 */

export default {
	remarkPlugins: [],
	rehypePlugins: [],
	// Only allow specific components in MDX
	components: {
		// Image components
		Figure: './src/lib/components/mdx/Figure.svelte',
		Diagram: './src/lib/components/mdx/Diagram.svelte',
		// Standard HTML elements (sanitized)
		a: 'a',
		p: 'p',
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
		h4: 'h4',
		ul: 'ul',
		ol: 'ol',
		li: 'li',
		code: 'code',
		pre: 'pre',
		blockquote: 'blockquote',
		strong: 'strong',
		em: 'em'
	}
};

