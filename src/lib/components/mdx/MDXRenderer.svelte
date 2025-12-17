<script lang="ts">
	import { onMount } from 'svelte';
	import Figure from './Figure.svelte';
	import Diagram from './Diagram.svelte';

	let { content, components } = $props<{
		content: string;
		components?: Record<string, any>;
	}>();

	let renderedContent = $state<string>('');

	// Default MDX components
	const defaultComponents = {
		Figure,
		Diagram,
		// Allow only safe HTML elements
		a: (props: any) => {
			const { href, children, ...rest } = props;
			return `<a href="${href}" ${Object.entries(rest).map(([k, v]) => `${k}="${v}"`).join(' ')}>${children}</a>`;
		},
		img: (props: any) => {
			const { src, alt, ...rest } = props;
			return `<img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async" ${Object.entries(rest).map(([k, v]) => `${k}="${v}"`).join(' ')} />`;
		}
	};

	const mdxComponents = { ...defaultComponents, ...components };

	onMount(() => {
		// In a real implementation, this would use MDX compiler
		// For now, we'll use marked with component placeholders
		// This is a simplified version - full MDX compilation would require build-time processing
		renderedContent = content;
	});
</script>

<div class="mdx-content">
	{@html renderedContent}
</div>

<style>
	.mdx-content {
		line-height: 1.7;
		color: var(--text-primary);
	}

	.mdx-content :global(h1),
	.mdx-content :global(h2),
	.mdx-content :global(h3),
	.mdx-content :global(h4) {
		font-weight: 600;
		line-height: 1.3;
		margin-top: 2rem;
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
	}

	.mdx-content :global(h1) {
		font-size: 2.5rem;
	}

	.mdx-content :global(h2) {
		font-size: 2rem;
	}

	.mdx-content :global(h3) {
		font-size: 1.5rem;
	}

	.mdx-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.mdx-content :global(ul),
	.mdx-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 2rem;
	}

	.mdx-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.mdx-content :global(code) {
		background: var(--bg-secondary);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
		font-family: 'Space Mono', monospace;
	}

	.mdx-content :global(pre) {
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.mdx-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.mdx-content :global(blockquote) {
		border-left: 4px solid var(--highlight);
		padding-left: 1.5rem;
		margin: 1.5rem 0;
		font-style: italic;
		color: var(--text-secondary);
	}

	.mdx-content :global(a) {
		color: var(--highlight);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s ease;
	}

	.mdx-content :global(a:hover) {
		border-bottom-color: var(--highlight);
	}

	.mdx-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 1.5rem 0;
	}
</style>

