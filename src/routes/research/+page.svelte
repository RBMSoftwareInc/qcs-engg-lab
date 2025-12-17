<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { loadContentByPath } from '$lib/content/loader';

	const content = loadContentByPath('/content/research/applied-intelligence.md');
</script>

<svelte:head>
	<title>Research | QuantumCore Solutions</title>
	<meta name="description" content="Applied intelligence research and engineering." />
</svelte:head>

<Section>
	{#if content}
		<Reveal>
			<h1>{content.metadata.title}</h1>
		</Reveal>
		<Reveal delay={0.2}>
			<MarkdownBlock html={content.html} />
		</Reveal>
	{:else}
		<Reveal>
			<h1>Research</h1>
			<p>Content loading...</p>
		</Reveal>
	{/if}
</Section>

