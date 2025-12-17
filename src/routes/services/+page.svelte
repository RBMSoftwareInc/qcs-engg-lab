<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import ServiceSlider from '$lib/components/ServiceSlider.svelte';
	import ArticlePreviewModal from '$lib/components/ArticlePreviewModal.svelte';
	import { loadContentByDirectory } from '$lib/content/loader';

	const allServices = loadContentByDirectory('services');
	let previewService = $state<typeof allServices[0] | null>(null);
	let showPreview = $state(false);

	// Convert services to slider format for featured section
	const featuredServices = allServices.slice(0, 3).map((service) => ({
		id: service.slug,
		icon: (service.metadata.icon || 'architecture') as 'architecture' | 'development' | 'team' | 'optimization' | 'consulting',
		title: service.metadata.title,
		description: service.metadata.description || '',
		details: service.content.substring(0, 200) + '...',
		image: service.metadata.image || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'
	}));

	function handleViewMore(slug: string) {
		const service = allServices.find((s) => s.slug === slug);
		if (service) {
			previewService = service;
			showPreview = true;
		}
	}
</script>

<svelte:head>
	<title>Services | QuantumCore Solutions</title>
	<meta
		name="description"
		content="Enterprise architecture, custom development, team augmentation, system optimization, and strategic consulting services."
	/>
</svelte:head>

<Section class="services-hero">
	<Reveal>
		<h1>Engineering Services</h1>
		<p class="services-intro">
			We architect, develop, and optimize enterprise systems. Our services are designed to extend your capabilities, accelerate your innovation, and deliver measurable business outcomes.
		</p>
	</Reveal>
</Section>

{#if featuredServices.length > 0}
	<Section class="services-featured-section">
		<Reveal>
			<h2>Featured Services</h2>
			<p class="section-intro">
				Explore our core engineering services through an interactive experience.
			</p>
		</Reveal>
		<ServiceSlider items={featuredServices} />
	</Section>
{/if}

<Section class="services-grid-section">
	<Reveal>
		<h2>Our Services</h2>
		<p class="section-intro">
			Comprehensive engineering services designed to solve complex problems and deliver lasting value.
		</p>
	</Reveal>

	<div class="services-grid">
		{#each allServices as service, index}
			<Reveal delay={index * 0.1}>
				<ServiceCard service={service} onViewMore={handleViewMore} />
			</Reveal>
		{/each}
	</div>

	{#if allServices.length === 0}
		<Reveal>
			<div class="empty-state">
				<p>No services available yet. Check back soon.</p>
			</div>
		</Reveal>
	{/if}
</Section>

<Section class="services-cta-section">
	<Reveal>
		<div class="cta-content">
			<h2>Ready to Transform Your Systems?</h2>
			<p>
				Let's discuss how our engineering services can solve your unique challenges and deliver measurable results.
			</p>
			<a href="/" class="cta-button" onclick={(e) => { e.preventDefault(); document.querySelector('.nav-initiate')?.click(); }}>
				Initiate Conversation
			</a>
		</div>
	</Reveal>
</Section>

<ArticlePreviewModal bind:open={showPreview} article={previewService} />

<style>
	.services-hero {
		text-align: center;
		padding: 4rem 0 3rem;
		background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
	}

	.services-intro {
		font-size: 1.4rem;
		line-height: 1.8;
		color: var(--text-secondary);
		margin: 2rem auto 0;
		max-width: 900px;
	}

	.services-featured-section {
		background: var(--bg-secondary);
		padding: 5rem 0;
	}

	.section-intro {
		font-size: 1.15rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2.5rem;
		max-width: 700px;
		text-align: center;
		margin-left: auto;
		margin-right: auto;
	}

	.services-grid-section {
		padding: 5rem 0;
	}

	.services-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		margin-top: 3rem;
	}

	@media (min-width: 768px) {
		.services-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.services-grid {
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
	}

	.services-cta-section {
		background: var(--bg-secondary);
		padding: 5rem 0;
		text-align: center;
	}

	.cta-content {
		max-width: 700px;
		margin: 0 auto;
	}

	.cta-content h2 {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 600;
		margin-bottom: 1.5rem;
		letter-spacing: -0.02em;
	}

	.cta-content p {
		font-size: 1.2rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2.5rem;
	}

	.cta-button {
		display: inline-block;
		padding: 1rem 2.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 10px;
		font-size: 1.1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}
</style>

