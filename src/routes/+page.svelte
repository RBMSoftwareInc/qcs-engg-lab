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

	// Same distinct images as /practice – no placeholders on home
	const PRACTICE_IMAGES = [
		'/assets/images/shared/practice-1-layers.svg',
		'/assets/images/shared/practice-2-nodes.svg',
		'/assets/images/shared/practice-3-pipeline.svg',
		'/assets/images/shared/practice-4-grid.svg',
		'/assets/images/shared/practice-5-modules.svg',
		'/assets/images/shared/practice-6-radial.svg'
	];
	function getPracticeImage(item: { metadata: { diagram?: string; image?: string } }, index: number) {
		return item.metadata.diagram || item.metadata.image || PRACTICE_IMAGES[index % PRACTICE_IMAGES.length];
	}

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
		tagline={heroContent.metadata.tagline}
		image={heroContent.metadata.heroImage}
		offerings={heroContent.metadata.offerings}
	/>
{:else}
	<Hero
		statement="Architecture before infrastructure."
		subline="Systems designed to evolve. We engineer clarity into complexity."
		tagline="We architect and evolve enterprise systems for organisations that build to last."
		offerings="Practice · Philosophy · Insights · Neural · Forge"
	/>
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
						image={getPracticeImage(item, index)}
						fullContent={item.content}
						html={item.html}
						onView={() => {
							selectedPractice = {
								title: item.metadata.title,
								description: item.metadata.description,
								slug: item.slug,
								image: getPracticeImage(item, index),
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

<Section id="proof" className="proof-section">
	<Reveal>
		<h2>Outcomes & trust</h2>
		<p class="proof-intro">
			Organisations we've worked with and the results that matter.
		</p>
	</Reveal>
	<div class="proof-logos">
		{#each ['Enterprise', 'Healthcare', 'Fintech', 'Government', 'Research'] as name}
			<Reveal delay={0.05}>
				<div class="proof-logo">{name}</div>
			</Reveal>
		{/each}
	</div>
	<div class="proof-quotes">
		<Reveal delay={0.1}>
			<blockquote class="proof-quote">
				<p>“QCS gave us a clear architecture that scaled with our growth. We shipped faster and with fewer surprises.”</p>
				<cite>— Engineering lead, enterprise platform</cite>
			</blockquote>
		</Reveal>
		<Reveal delay={0.15}>
			<blockquote class="proof-quote">
				<p>“They think in systems, not just features. The documentation and boundaries they put in place are still our reference years later.”</p>
				<cite>— CTO, regulated industry</cite>
			</blockquote>
		</Reveal>
	</div>
</Section>

<style>
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

	/* Proof: logos + outcome quotes */
	.proof-intro {
		font-size: 1.15rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 800px;
	}

	.proof-logos {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.25rem 2rem;
		margin-bottom: 3rem;
	}

	.proof-logo {
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.5);
	}

	.proof-quotes {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		max-width: 900px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.proof-quotes {
			grid-template-columns: 1fr 1fr;
		}
	}

	.proof-quote {
		margin: 0;
		padding: 1.5rem 1.25rem;
		background: rgba(255, 253, 247, 0.8);
		border-left: 3px solid var(--highlight);
		border-radius: 0 8px 8px 0;
		text-align: left;
	}

	.proof-quote p {
		font-size: 1rem;
		line-height: 1.65;
		color: var(--text-primary);
		margin-bottom: 0.75rem;
	}

	.proof-quote cite {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-style: normal;
	}
</style>
