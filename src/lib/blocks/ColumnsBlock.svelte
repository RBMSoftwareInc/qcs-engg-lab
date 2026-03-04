<script lang="ts">
	let { columns = 2, col1 = '', col2 = '', col3 = '' } = $props<{
		columns?: number;
		col1?: string;
		col2?: string;
		col3?: string;
	}>();
	const cols = Math.min(3, Math.max(2, Number(columns) || 2));
</script>

<div class="block-columns" style="--cols: {cols};">
	<div class="block-column">{@html col1 || '<p>Column 1</p>'}</div>
	<div class="block-column">{@html col2 || '<p>Column 2</p>'}</div>
	{#if cols >= 3}
		<div class="block-column">{@html col3 || '<p>Column 3</p>'}</div>
	{/if}
</div>

<style>
	.block-columns { display: grid; grid-template-columns: repeat(var(--cols), 1fr); gap: 2rem; padding: 2rem 0; }
	.block-column { min-width: 0; line-height: 1.7; }
	.block-column :global(p) { margin-bottom: 1rem; }
	@media (max-width: 768px) { .block-columns { grid-template-columns: 1fr; } }
</style>
