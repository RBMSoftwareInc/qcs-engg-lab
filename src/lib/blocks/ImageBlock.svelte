<script lang="ts">
	let { src = '', alt = 'Image', caption = '', link = '' } = $props<{
		src?: string;
		alt?: string;
		caption?: string;
		link?: string;
	}>();
</script>

<figure class="block-image">
	{#if link}
		<a href={link} class="block-image-link">
			<img src={src} alt={alt} loading="lazy" />
		</a>
	{:else}
		<img src={src} alt={alt} loading="lazy" />
	{/if}
	{#if caption}<figcaption class="block-image-caption">{caption}</figcaption>{/if}
</figure>

<style>
	.block-image { margin: 2rem 0; text-align: center; }
	.block-image img { max-width: 100%; height: auto; border-radius: 8px; }
	.block-image-link { display: inline-block; }
	.block-image-caption { font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem; }
</style>
