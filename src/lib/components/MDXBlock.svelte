<script lang="ts">
	import MDXRenderer from './mdx/MDXRenderer.svelte';
	import { marked } from 'marked';

	let { content, html } = $props<{
		content?: string;
		html?: string;
	}>();

	// For now, use marked as fallback until full MDX compilation is set up
	// In production, this would use MDX compiler
	const renderedHTML = $derived(html || (content ? marked.parse(content) as string : ''));
</script>

<div class="mdx-block">
	{@html renderedHTML}
</div>

<style>
	.mdx-block {
		line-height: 1.7;
		color: var(--text-primary);
	}
</style>

