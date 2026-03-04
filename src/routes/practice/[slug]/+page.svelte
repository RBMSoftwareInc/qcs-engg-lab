<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import OnThisPage from '$lib/components/OnThisPage.svelte';
	import RelatedLinks from '$lib/components/RelatedLinks.svelte';
	import { loadContentByDirectory, loadContentBySlug } from '$lib/content/loader';
	import { page } from '$app/stores';

	const PRACTICE_IMAGES = [
		'/assets/images/shared/practice-1-layers.svg',
		'/assets/images/shared/practice-2-nodes.svg',
		'/assets/images/shared/practice-3-pipeline.svg',
		'/assets/images/shared/practice-4-grid.svg',
		'/assets/images/shared/practice-5-modules.svg',
		'/assets/images/shared/practice-6-radial.svg'
	];
	function getPracticeImageForSlug(metadata: { diagram?: string; image?: string }, slug: string) {
		return metadata.diagram || metadata.image || PRACTICE_IMAGES[slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PRACTICE_IMAGES.length];
	}

	let practiceItem: any = null;
	let allPracticeItems: { slug: string; metadata: { title: string } }[] = [];
	let prevNext = $derived.by(() => {
		if (!practiceItem?.slug) return { prev: null, next: null };
		const idx = allPracticeItems.findIndex((a) => a.slug === practiceItem.slug);
		if (idx < 0) return { prev: null, next: null };
		return {
			prev: idx > 0 ? { title: allPracticeItems[idx - 1].metadata.title, href: `/practice/${allPracticeItems[idx - 1].slug}` } : null,
			next: idx < allPracticeItems.length - 1 ? { title: allPracticeItems[idx + 1].metadata.title, href: `/practice/${allPracticeItems[idx + 1].slug}` } : null
		};
	});

	$: {
		const slug = $page.params.slug;
		const domains = loadContentByDirectory('domains');
		const services = loadContentByDirectory('services');
		const allItems = [...(domains || []), ...(services || [])].sort((a, b) => (a.metadata.order ?? 999) - (b.metadata.order ?? 999));
		allPracticeItems = allItems;
		practiceItem = allItems.find((item: any) => item.slug === slug) || loadContentBySlug(slug);
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
			<div class="practice-hero-image">
				<img
					src={getPracticeImageForSlug(practiceItem.metadata, practiceItem.slug)}
					alt={practiceItem.metadata.title}
					loading="eager"
				/>
			</div>
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
			<div class="practice-layout">
				<div class="practice-main">
					<div class="content-wrapper">
						<MarkdownBlock html={practiceItem.html} />
					</div>
					<RelatedLinks
						prev={prevNext.prev}
						next={prevNext.next}
						backHref="/practice"
						backLabel="All Practice"
					/>
				</div>
				<aside class="practice-sidebar">
					<OnThisPage selector=".practice-main" headingTag="h2" />
				</aside>
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

	.practice-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}

	@media (min-width: 1024px) {
		.practice-layout {
			grid-template-columns: 1fr 200px;
		}

		.practice-sidebar {
			order: 2;
		}
	}

	.practice-main {
		min-width: 0;
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

