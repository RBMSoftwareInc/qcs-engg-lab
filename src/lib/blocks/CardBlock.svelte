<script lang="ts">
	let { title = '', description = '', image = '', link = '', linkText = 'Read more' } = $props<{
		title?: string;
		description?: string;
		image?: string;
		link?: string;
		linkText?: string;
	}>();
</script>

<div class="block-card">
	{#if image}
		<div class="block-card-image">
			<img src={image} alt={title} />
		</div>
	{/if}
	<div class="block-card-body">
		<h3 class="block-card-title">{title}</h3>
		{#if description}<p class="block-card-desc">{description}</p>{/if}
		{#if link}
			<a class="block-card-link" href={link}>{linkText}</a>
		{/if}
	</div>
</div>

<style>
	.block-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		overflow: hidden;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.block-card:hover {
		border-color: var(--highlight);
		box-shadow: 0 8px 24px rgba(0,0,0,0.06);
	}
	.block-card-image {
		aspect-ratio: 16/10;
		overflow: hidden;
	}
	.block-card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.block-card-body { padding: 1.5rem; }
	.block-card-title { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--text-primary); }
	.block-card-desc { color: var(--text-secondary); margin: 0 0 1rem; line-height: 1.6; }
	.block-card-link { color: var(--highlight); font-weight: 500; text-decoration: none; }
	.block-card-link:hover { text-decoration: underline; }
</style>
