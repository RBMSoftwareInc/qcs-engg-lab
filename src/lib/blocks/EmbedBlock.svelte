<script lang="ts">
	let { url = '', html = '' } = $props<{ url?: string; html?: string }>();
</script>

<div class="block-embed">
	{#if html}
		{@html html}
	{:else if url}
		<iframe
			src={url}
			title="Embed"
			loading="lazy"
			class="block-embed-iframe"
		></iframe>
	{:else}
		<p class="block-embed-placeholder">Add embed URL or HTML</p>
	{/if}
</div>

<style>
	.block-embed { margin: 2rem 0; }
	.block-embed-iframe { width: 100%; min-height: 400px; border: none; border-radius: 8px; }
	.block-embed-placeholder { padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-secondary); border-radius: 8px; }
</style>
