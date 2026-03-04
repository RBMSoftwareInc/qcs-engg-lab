<script lang="ts">
	let { title = '', items = [] } = $props<{
		title?: string;
		items?: Array<{ title?: string; description?: string; icon?: string }>;
	}>();
	const list = $derived(Array.isArray(items) ? items : []);
</script>

<div class="block-tile">
	{#if title}<h2 class="block-tile-title">{title}</h2>{/if}
	<div class="block-tile-grid">
		{#each list as item}
			<div class="block-tile-item">
				{#if item.icon}<span class="block-tile-icon">{item.icon}</span>{/if}
				<h3 class="block-tile-item-title">{item.title ?? 'Tile'}</h3>
				{#if item.description}<p class="block-tile-item-desc">{item.description}</p>{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.block-tile { padding: 2rem 0; }
	.block-tile-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem; text-align: center; color: var(--text-primary); }
	.block-tile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
	.block-tile-item { padding: 1.5rem; background: var(--bg-secondary); border-radius: 10px; border: 1px solid var(--border-subtle); }
	.block-tile-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
	.block-tile-item-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--text-primary); }
	.block-tile-item-desc { font-size: 0.9rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
</style>
