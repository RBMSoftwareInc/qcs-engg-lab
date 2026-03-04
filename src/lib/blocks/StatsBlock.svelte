<script lang="ts">
	let { items = [] } = $props<{
		items?: Array<{ value?: string; label?: string }>;
	}>();
	const list = $derived(Array.isArray(items) ? items : []);
</script>

<div class="block-stats">
	{#each list as item}
		<div class="block-stats-item">
			<span class="block-stats-value">{item.value ?? '—'}</span>
			<span class="block-stats-label">{item.label ?? ''}</span>
		</div>
	{/each}
</div>

<style>
	.block-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 3rem; padding: 3rem 2rem; }
	.block-stats-item { text-align: center; }
	.block-stats-value { display: block; font-size: 2rem; font-weight: 700; color: var(--highlight); }
	.block-stats-label { font-size: 0.9rem; color: var(--text-muted); }
</style>
