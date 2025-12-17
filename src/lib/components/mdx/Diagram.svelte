<script lang="ts">
	import { onMount } from 'svelte';

	let { src, alt = '', caption, width, height } = $props<{
		src: string;
		alt?: string;
		caption?: string;
		width?: number;
		height?: number;
	}>();

	let svgRef: HTMLElement;
	let svgContent = $state<string>('');
	let hasError = $state(false);

	onMount(async () => {
		// Only SVG allowed for diagrams
		if (!src.endsWith('.svg')) {
			hasError = true;
			return;
		}

		try {
			// Load SVG content
			const response = await fetch(src);
			if (!response.ok) {
				hasError = true;
				return;
			}
			const text = await response.text();
			svgContent = text;
		} catch (error) {
			hasError = true;
		}
	});
</script>

<figure class="mdx-diagram">
	<div class="diagram-wrapper" style:width={width ? `${width}px` : undefined} style:height={height ? `${height}px` : undefined}>
		{#if hasError}
			<div class="diagram-error">
				<p>Diagram failed to load</p>
			</div>
		{:else if svgContent}
			<div bind:this={svgRef} class="diagram-svg">{@html svgContent}</div>
		{:else}
			<div class="diagram-loading">Loading diagram...</div>
		{/if}
	</div>
	{#if caption}
		<figcaption class="diagram-caption">{caption}</figcaption>
	{/if}
</figure>

<style>
	.mdx-diagram {
		margin: 2rem 0;
		text-align: center;
	}

	.diagram-wrapper {
		position: relative;
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
		background: var(--bg-secondary);
		border-radius: 8px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}

	.diagram-svg {
		width: 100%;
		height: auto;
	}

	.diagram-svg :global(svg) {
		width: 100%;
		height: auto;
		max-width: 100%;
	}

	.diagram-svg :global(svg path),
	.diagram-svg :global(svg line),
	.diagram-svg :global(svg circle),
	.diagram-svg :global(svg rect) {
		stroke: var(--text-primary);
		fill: none;
	}

	.diagram-loading,
	.diagram-error {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 2rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.diagram-caption {
		margin-top: 0.75rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.5;
		font-style: italic;
	}
</style>

