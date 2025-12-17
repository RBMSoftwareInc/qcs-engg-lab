<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Section from '$lib/components/Section.svelte';
	import PracticeCard from '$lib/components/PracticeCard.svelte';
	import PracticeModal from '$lib/components/PracticeModal.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import TechCursor from '$lib/components/TechCursor.svelte';
	import MagneticCard from '$lib/components/MagneticCard.svelte';
	import GridOverlay from '$lib/components/GridOverlay.svelte';
	import { loadContentByDirectory, loadContentByPath } from '$lib/content/loader';

	// Load content - wrap in try/catch to prevent route crash
	let heroContent: any = null;
	let practiceItems: any[] = [];
	let selectedPractice = $state<any>(null);
	let showModal = $state(false);

	try {
		heroContent = loadContentByPath('/content/hero/intro.md');
		const domains = loadContentByDirectory('domains') || [];
		const services = loadContentByDirectory('services') || [];
		// Merge and show a selection on home page
		practiceItems = [...domains, ...services]
			.sort((a, b) => (a.metadata.order ?? 999) - (b.metadata.order ?? 999))
			.slice(0, 6); // Show first 6 on home
	} catch (e) {
		console.error('Content loading error:', e);
		// Don't crash - just use empty state
	}
</script>

<svelte:head>
	<title>QuantumCore Solutions</title>
	<meta name="description" content="Architecture before infrastructure. Systems designed to evolve." />
</svelte:head>

<TechCursor />
<GridOverlay />

{#if heroContent}
	<Hero
		statement={heroContent.metadata.title}
		subline={heroContent.metadata.description}
		image={heroContent.metadata.heroImage}
	/>
{:else}
	<Section>
		<h1>Architecture before infrastructure.</h1>
		<p class="hero-subline">Systems designed to evolve.</p>
	</Section>
{/if}

<Section id="practice">
	<Reveal>
		<h2>Practice</h2>
		<p class="section-intro">
			This is how we think and work. Each area represents a foundational domain of architectural thinking.
		</p>
	</Reveal>
	<div class="practice-grid">
		{#each practiceItems as item, index}
			<Reveal delay={index * 0.1}>
				<MagneticCard>
					<PracticeCard
						title={item.metadata.title}
						description={item.metadata.description}
						slug={item.slug}
						order={index}
						image={item.metadata.diagram || item.metadata.image}
						fullContent={item.content}
						html={item.html}
						onView={() => {
							selectedPractice = {
								title: item.metadata.title,
								description: item.metadata.description,
								slug: item.slug,
								image: item.metadata.diagram || item.metadata.image,
								html: item.html,
								content: item.content
							};
							showModal = true;
						}}
					/>
				</MagneticCard>
			</Reveal>
		{:else}
			<Reveal>
				<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
					No practice areas available.
				</p>
			</Reveal>
		{/each}
	</div>

	<PracticeModal bind:open={showModal} practice={selectedPractice} />
	{#if practiceItems.length > 0}
		<Reveal>
			<div class="practice-link">
				<a href="/practice">View all practice areas →</a>
			</div>
		</Reveal>
	{/if}
</Section>

<style>
	.hero-subline {
		font-size: 1.5rem;
		color: var(--text-secondary);
		font-weight: 400;
		margin-top: 1rem;
	}

	.practice-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-top: 2rem;
		position: relative;
		align-items: stretch;
	}

	@media (min-width: 768px) {
		.practice-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.practice-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Ensure all cards have equal height */
	:global(.practice-grid > *) {
		display: flex;
		height: 100%;
	}

	:global(.practice-grid article) {
		width: 100%;
	}

	.section-intro {
		font-size: 1.15rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2.5rem;
		max-width: 800px;
	}

	.practice-link {
		text-align: center;
		margin-top: 3rem;
	}

	.practice-link a {
		font-size: 1.1rem;
		color: var(--text-primary);
		text-decoration: none;
		border-bottom: 2px solid var(--highlight);
		padding-bottom: 2px;
		transition: all 0.2s ease;
	}

	.practice-link a:hover {
		border-bottom-color: var(--text-primary);
	}
</style>
