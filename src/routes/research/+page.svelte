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

<Section class="research-page">
	<div class="research-hero">
		<div class="research-hero-text">
			{#if content}
				<Reveal>
					<h1>{content.metadata.title}</h1>
				</Reveal>
			{:else}
				<Reveal>
					<h1>Research</h1>
					<p>Content loading...</p>
				</Reveal>
			{/if}
		</div>
		<div class="research-hero-image">
			<img src="/assets/images/shared/research-engg.svg" alt="" role="presentation" loading="lazy" />
		</div>
	</div>
	{#if content}
		<Reveal delay={0.2}>
			<MarkdownBlock html={content.html} />
		</Reveal>
	{/if}
</Section>

<style>
	.research-page {
		padding-bottom: 3rem;
	}
	.research-hero {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		align-items: center;
		margin-bottom: 2rem;
	}
	@media (min-width: 768px) {
		.research-hero {
			grid-template-columns: 1fr auto;
		}
	}
	.research-hero-image {
		opacity: 0.7;
	}
	.research-hero-image img {
		max-width: 320px;
		width: 100%;
		height: auto;
	}
</style>
