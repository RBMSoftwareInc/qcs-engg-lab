<script lang="ts">
	import { onMount } from 'svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import { marked } from 'marked';
	import { safeJsonParse } from '$lib/studio/api-utils';

	let { markdown = '', showSkinPreview = false } = $props<{
		markdown: string;
		showSkinPreview?: boolean;
	}>();

	let html = $derived(marked.parse(markdown) as string);
	let activeSkin = $state<string | null>(null);
	let skinCSS = $state<string | null>(null);
	let loadingSkin = $state(false);

	onMount(async () => {
		if (showSkinPreview) {
			await loadActiveSkin();
		}
	});

	async function loadActiveSkin() {
		loadingSkin = true;
		try {
			// Get active skin name
			const activeResponse = await fetch('/studio/api/design-skins/active');
			const { data: activeData } = await safeJsonParse<{ activeSkin: string | null }>(activeResponse);
			
			if (activeData?.activeSkin) {
				activeSkin = activeData.activeSkin;
				
				// Load skin CSS
				const cssResponse = await fetch(`/studio/api/design-skins/${activeSkin}/css`);
				if (cssResponse.ok) {
					const cssText = await cssResponse.text();
					if (cssText && !cssText.startsWith('<!')) {
						skinCSS = cssText;
					}
				}
			}
		} catch (error) {
			console.warn('Failed to load active skin:', error);
		} finally {
			loadingSkin = false;
		}
	}
</script>

<div class="content-preview">
	{#if showSkinPreview && skinCSS}
		<style>
			{@html skinCSS}
		</style>
	{/if}
	
	{#if showSkinPreview && activeSkin}
		<div class="skin-indicator">
			<span class="skin-label">Preview with:</span>
			<span class="skin-name">{activeSkin}</span>
		</div>
	{/if}
	
	<MarkdownBlock html={html} />
</div>

<style>
	.content-preview {
		width: 100%;
		height: 100%;
		overflow-y: auto;
		padding: 2rem;
		background: var(--bg-primary);
		position: relative;
	}

	.skin-indicator {
		position: sticky;
		top: 0;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-subtle);
		padding: 0.75rem 1rem;
		margin: -2rem -2rem 2rem -2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		z-index: 10;
	}

	.skin-label {
		color: var(--text-secondary);
	}

	.skin-name {
		color: var(--text-primary);
		font-weight: 600;
		font-family: 'IBM Plex Mono', monospace;
	}
</style>

