<script lang="ts">
	import CardBlock from './CardBlock.svelte';
	let { title = '', columns = 3, items = [] } = $props<{
		title?: string;
		columns?: number;
		items?: Array<{ title?: string; description?: string; image?: string; link?: string }>;
	}>();
	const list = $derived(Array.isArray(items) ? items : []);
	const cols = Math.min(4, Math.max(1, Number(columns) || 3));
</script>

<div class="block-grid" style="--cols: {cols};">
	{#if title}<h2 class="block-grid-title">{title}</h2>{/if}
	<div class="block-grid-inner">
		{#each list as item}
			<div class="block-grid-item">
				<CardBlock
					title={item.title ?? ''}
					description={item.description ?? ''}
					image={item.image ?? ''}
					link={item.link ?? ''}
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	.block-grid { padding: 2rem 0; }
	.block-grid-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem; text-align: center; color: var(--text-primary); }
	.block-grid-inner { display: grid; grid-template-columns: repeat(var(--cols), 1fr); gap: 1.5rem; }
	@media (max-width: 768px) {
		.block-grid-inner { grid-template-columns: 1fr; }
	}
</style>
