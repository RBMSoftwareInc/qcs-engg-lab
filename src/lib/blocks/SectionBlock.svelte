<script lang="ts">
	let { title = '', id = '', background = 'light' } = $props<{
		title?: string;
		id?: string;
		background?: string;
	}>();
</script>

<section id={id || undefined} class="block-section block-section-{background}">
	<div class="block-section-inner">
		{#if title}<h2 class="block-section-title">{title}</h2>{/if}
	</div>
</section>

<style>
	.block-section { padding: 3rem 2rem; }
	.block-section-dark { background: var(--bg-secondary); }
	.block-section-inner { max-width: 1200px; margin: 0 auto; }
	.block-section-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem; color: var(--text-primary); }
</style>
