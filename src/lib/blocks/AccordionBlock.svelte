<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	let { items = [], allowMultiple = false } = $props<{
		items?: Array<{ title: string; content: string; icon?: string }>;
		allowMultiple?: boolean;
	}>();
	const list = $derived(Array.isArray(items) ? items : []);
</script>

<div class="block-accordion">
	<Accordion items={list} allowMultiple={allowMultiple} />
</div>

<style>
	.block-accordion {
		max-width: 720px;
		margin: 0 auto;
	}
</style>
