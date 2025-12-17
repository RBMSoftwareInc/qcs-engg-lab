<script lang="ts">
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import { marked } from 'marked';

	let { markdown = '' } = $props<{
		markdown: string;
	}>();

	let html = $derived(marked.parse(markdown) as string);
</script>

<div class="content-preview">
	<MarkdownBlock html={html} />
</div>

<style>
	.content-preview {
		width: 100%;
		height: 100%;
		overflow-y: auto;
		padding: 2rem;
		background: var(--bg-primary);
	}
</style>

