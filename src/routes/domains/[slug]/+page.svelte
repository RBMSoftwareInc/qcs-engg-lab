<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { loadContentBySlug } from '$lib/content/loader';
	import { page } from '$app/stores';

	let slug = $derived($page.params.slug || '');
	let content = $derived(loadContentBySlug(slug));
</script>

<svelte:head>
	<title>{content?.metadata.title || 'Domain'} | QuantumCore Solutions</title>
	<meta name="description" content={content?.metadata.description || ''} />
</svelte:head>

<Section>
	{#if content}
		<Reveal>
			<h1>{content.metadata.title}</h1>
		</Reveal>
		{#if content.metadata.description}
			<Reveal delay={0.1}>
				<p class="domain-description">{content.metadata.description}</p>
			</Reveal>
		{/if}
		<Reveal delay={0.2}>
			<MarkdownBlock html={content.html} />
		</Reveal>
	{:else}
		<Reveal>
			<h1>Domain Not Found</h1>
			<p>The requested domain could not be found.</p>
			<a href="/">Return home</a>
		</Reveal>
	{/if}
</Section>

<style>
	.domain-description {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: 2rem;
		line-height: 1.7;
	}
</style>

