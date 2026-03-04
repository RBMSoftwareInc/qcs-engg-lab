<script lang="ts">
	import BlockRenderer from '$lib/blocks/BlockRenderer.svelte';
	import type { PageData } from './$types';

	let { data } = $props<PageData>();
</script>

<svelte:head>
	<title>{data.page.title} | QCS</title>
	{#if data.page.description}
		<meta name="description" content={data.page.description} />
	{/if}
</svelte:head>

<main class="page-blocks">
	<BlockRenderer blocks={data.page.blocks} />
</main>

<style>
	.page-blocks {
		min-height: 40vh;
	}
</style>
