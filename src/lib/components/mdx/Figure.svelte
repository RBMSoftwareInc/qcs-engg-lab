<script lang="ts">
	import { onMount } from 'svelte';

	let { src, alt = '', caption, width, height, lazy = true } = $props<{
		src: string;
		alt?: string;
		caption?: string;
		width?: number;
		height?: number;
		lazy?: boolean;
	}>();

	let imgRef: HTMLImageElement;
	let isLoaded = $state(false);
	let hasError = $state(false);

	onMount(() => {
		if (imgRef) {
			imgRef.addEventListener('load', () => {
				isLoaded = true;
			});
			imgRef.addEventListener('error', () => {
				hasError = true;
			});
		}
	});

	// Validate image format
	const isValidFormat = src.endsWith('.webp') || src.endsWith('.svg');
	const imageSrc = isValidFormat ? src : src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
</script>

<figure class="mdx-figure">
	<div class="figure-wrapper" style:width={width ? `${width}px` : undefined} style:height={height ? `${height}px` : undefined}>
		{#if hasError}
			<div class="figure-error">
				<p>Image failed to load</p>
			</div>
		{:else}
			<img
				bind:this={imgRef}
				src={imageSrc}
				alt={alt}
				loading={lazy ? 'lazy' : 'eager'}
				decoding="async"
				class="figure-image"
				class:loaded={isLoaded}
				style:aspect-ratio={width && height ? `${width}/${height}` : undefined}
			/>
		{/if}
	</div>
	{#if caption}
		<figcaption class="figure-caption">{caption}</figcaption>
	{/if}
</figure>

<style>
	.mdx-figure {
		margin: 2rem 0;
		text-align: center;
	}

	.figure-wrapper {
		position: relative;
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
		background: var(--bg-secondary);
		border-radius: 8px;
		overflow: hidden;
		aspect-ratio: 16 / 9;
	}

	.figure-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.figure-image.loaded {
		opacity: 1;
	}

	.figure-error {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 2rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.figure-caption {
		margin-top: 0.75rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.5;
		font-style: italic;
	}

	@media (prefers-reduced-motion: reduce) {
		.figure-image {
			transition: none;
		}
	}
</style>

