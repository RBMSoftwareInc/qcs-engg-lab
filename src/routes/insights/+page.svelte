<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import ArticlePreviewModal from '$lib/components/ArticlePreviewModal.svelte';
	import NewsletterModal from '$lib/components/NewsletterModal.svelte';
	import { loadContentByDirectory } from '$lib/content/loader';

	const allArticles = loadContentByDirectory('insights');

	let selectedCategory = $state('all');
	let selectedType = $state('all');
	let currentPage = $state(1);
	let previewArticle = $state<typeof allArticles[0] | null>(null);
	let showPreview = $state(false);
	let showNewsletter = $state(false);

	const itemsPerPage = 9;

	// Get unique categories and types
	const categories = Array.from(new Set(allArticles.map((a) => a.metadata.category).filter(Boolean)));
	const types = Array.from(new Set(allArticles.map((a) => a.metadata.type).filter(Boolean)));

	// Filter articles
	let filteredArticles = $derived(
		allArticles.filter((article) => {
			const categoryMatch = selectedCategory === 'all' || article.metadata.category === selectedCategory;
			const typeMatch = selectedType === 'all' || article.metadata.type === selectedType;
			return categoryMatch && typeMatch;
		})
	);

	// Paginate
	let paginatedArticles = $derived(
		filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	let totalPages = $derived(Math.ceil(filteredArticles.length / itemsPerPage));

	// Reset to page 1 when filters change
	$effect(() => {
		selectedCategory;
		selectedType;
		currentPage = 1;
	});

	function handlePreview(slug: string) {
		const article = allArticles.find((a) => a.slug === slug);
		if (article) {
			previewArticle = article;
			showPreview = true;
		}
	}

	function handleCategoryChange(category: string) {
		selectedCategory = category;
	}

	function handleTypeChange(type: string) {
		selectedType = type;
	}

	function handlePageChange(page: number) {
		currentPage = page;
	}
</script>

<svelte:head>
	<title>Insights | QuantumCore Solutions</title>
	<meta name="description" content="Research insights, technical articles, and strategic thinking from QuantumCore Solutions." />
</svelte:head>

<Section class="insights-hero">
	<Reveal>
		<h1>Insights</h1>
		<p class="insights-intro">
			Research insights, technical articles, and strategic thinking. Engineering observations that shape how we build systems.
		</p>
		<button class="newsletter-btn" onclick={() => (showNewsletter = true)}>
			Subscribe to Newsletter
		</button>
	</Reveal>
</Section>

<Section class="insights-content">
	<FilterBar
		categories={categories}
		types={types}
		selectedCategory={selectedCategory}
		selectedType={selectedType}
		onCategoryChange={handleCategoryChange}
		onTypeChange={handleTypeChange}
	/>

	<div class="articles-grid">
		{#each paginatedArticles as article, index}
			<Reveal delay={index * 0.05}>
				<ArticleCard article={article} onPreview={handlePreview} />
			</Reveal>
		{/each}
	</div>

	{#if filteredArticles.length === 0}
		<Reveal>
			<div class="empty-state">
				<p>No articles found matching your filters.</p>
				<button class="clear-filters" onclick={() => { selectedCategory = 'all'; selectedType = 'all'; }}>
					Clear Filters
				</button>
			</div>
		</Reveal>
	{/if}

	{#if totalPages > 1}
		<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
	{/if}
</Section>

<ArticlePreviewModal bind:open={showPreview} article={previewArticle} />
<NewsletterModal bind:open={showNewsletter} />

<style>
	.insights-hero {
		text-align: center;
		padding: 3rem 0 2rem;
	}

	.insights-intro {
		font-size: 1.3rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 1.5rem auto 2rem;
		max-width: 700px;
	}

	.newsletter-btn {
		padding: 0.875rem 2rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(31, 41, 55, 0.15);
	}

	.newsletter-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(31, 41, 55, 0.25);
	}

	.insights-content {
		padding: 2rem 0 4rem;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	@media (min-width: 768px) {
		.articles-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.articles-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bg-secondary);
		border-radius: 12px;
	}

	.empty-state p {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.clear-filters {
		padding: 0.75rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.clear-filters:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(31, 41, 55, 0.2);
	}
</style>

