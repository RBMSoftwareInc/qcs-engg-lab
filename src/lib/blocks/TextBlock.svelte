<script lang="ts">
	let { content = '', align = 'left' } = $props<{
		content?: string;
		align?: string;
	}>();
</script>

<div class="block-text" style="text-align: {align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'};">
	{@html content || '<p>Add your text here.</p>'}
</div>

<style>
	.block-text {
		max-width: 720px;
		margin: 0 auto;
		padding: 1.5rem 0;
		line-height: 1.7;
		color: var(--text-primary);
	}
	.block-text :global(p) { margin-bottom: 1rem; }
	.block-text :global(p:last-child) { margin-bottom: 0; }
	.block-text :global(a) { color: var(--highlight); }
</style>
