<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { loadContentByDirectory, loadContentBySlug } from '$lib/content/loader';
	import { page } from '$app/stores';

	let practiceItem: any = null;

	$: {
		const slug = $page.params.slug;
		// Search across both domains and services
		const domains = loadContentByDirectory('domains');
		const services = loadContentByDirectory('services');
		const allItems = [...domains, ...services];
		practiceItem = allItems.find(item => item.slug === slug) || loadContentBySlug(slug);
	}
</script>

<svelte:head>
	<title>{practiceItem?.metadata.title || 'Practice'} | QuantumCore Solutions</title>
	<meta name="description" content={practiceItem?.metadata.description || ''} />
</svelte:head>

{#if practiceItem}
	<Section class="practice-hero">
		<Reveal>
			<a href="/practice" class="back-link">← Practice</a>
		</Reveal>
		<div class="practice-header">
			{#if practiceItem.metadata.diagram || practiceItem.metadata.image}
				<div class="practice-hero-image">
					<img
						src={practiceItem.metadata.diagram || practiceItem.metadata.image}
						alt={practiceItem.metadata.title}
						loading="eager"
					/>
				</div>
			{:else}
				<div class="practice-image-placeholder">
					<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="20" y="20" width="160" height="160" stroke="currentColor" stroke-width="3" stroke-dasharray="8 8" fill="none" opacity="0.3" />
						<circle cx="100" cy="100" r="40" fill="currentColor" opacity="0.2" />
						<path d="M60 60L140 140M140 60L60 140" stroke="currentColor" stroke-width="2" opacity="0.3" />
					</svg>
					<span>Image Placeholder</span>
				</div>
			{/if}
			<div class="practice-header-content">
				<Reveal delay={0.1}>
					<h1>{practiceItem.metadata.title}</h1>
				</Reveal>
				{#if practiceItem.metadata.description}
					<Reveal delay={0.15}>
						<p class="practice-description">{practiceItem.metadata.description}</p>
					</Reveal>
				{/if}
			</div>
		</div>
	</Section>

	<Section class="practice-content">
		<Reveal delay={0.2}>
			<div class="content-wrapper">
				<MarkdownBlock html={practiceItem.html} />
			</div>
		</Reveal>
	</Section>
{:else}
	<Section>
		<Reveal>
			<h1>Practice Area Not Found</h1>
			<p>The practice area you're looking for doesn't exist.</p>
			<a href="/practice">← Back to Practice</a>
		</Reveal>
	</Section>
{/if}

<style>
	.back-link {
		display: inline-block;
		margin-bottom: 2rem;
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: var(--text-primary);
	}

	.practice-hero {
		padding: 3rem 0;
	}

	.practice-header {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		align-items: center;
	}

	@media (min-width: 768px) {
		.practice-header {
			grid-template-columns: 300px 1fr;
		}
	}

	.practice-hero-image {
		width: 100%;
		height: 300px;
		border-radius: 12px;
		overflow: hidden;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.practice-hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.practice-image-placeholder {
		width: 100%;
		height: 300px;
		border-radius: 12px;
		background: var(--bg-secondary);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--text-muted);
		border: 2px dashed var(--border-subtle);
	}

	.practice-image-placeholder svg {
		opacity: 0.4;
	}

	.practice-image-placeholder span {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
	}

	.practice-header-content h1 {
		margin-bottom: 1.5rem;
	}

	.practice-description {
		font-size: 1.25rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0;
		max-width: 800px;
	}

	.practice-content {
		padding: 4rem 0;
	}

	.content-wrapper {
		max-width: 900px;
		margin: 0 auto;
	}

	.content-wrapper :global(h2) {
		margin-top: 3rem;
		margin-bottom: 1.5rem;
		font-size: 2rem;
	}

	.content-wrapper :global(h3) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}

	.content-wrapper :global(p) {
		margin-bottom: 1.5rem;
		line-height: 1.8;
	}

	.content-wrapper :global(ul),
	.content-wrapper :global(ol) {
		margin-left: 2rem;
		margin-bottom: 1.5rem;
		line-height: 1.8;
	}

	.content-wrapper :global(li) {
		margin-bottom: 0.5rem;
	}

	.content-wrapper :global(blockquote) {
		border-left: 4px solid var(--highlight);
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: var(--text-secondary);
	}

	.content-wrapper :global(code) {
		background: var(--bg-secondary);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.9em;
	}

	.content-wrapper :global(pre) {
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 2rem 0;
	}
</style>

