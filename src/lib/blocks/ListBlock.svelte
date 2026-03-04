<script lang="ts">
	let { items = [], ordered = false } = $props<{
		items?: string[] | unknown[];
		ordered?: boolean;
	}>();
	const list = $derived(Array.isArray(items) ? items.map((i) => (typeof i === 'string' ? i : String(i))) : []);
</script>

{#if ordered}
	<ol class="block-list">
		{#each list as item}<li>{item}</li>{/each}
	</ol>
{:else}
	<ul class="block-list">
		{#each list as item}<li>{item}</li>{/each}
	</ul>
{/if}

<style>
	.block-list { padding: 1rem 0 1rem 1.5rem; max-width: 720px; margin: 0 auto; line-height: 1.7; color: var(--text-primary); }
	.block-list li { margin-bottom: 0.5rem; }
</style>
