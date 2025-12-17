<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SignalCard from '$lib/components/SignalCard.svelte';
	import SignalSlider from '$lib/components/SignalSlider.svelte';
	import ArticlePreviewModal from '$lib/components/ArticlePreviewModal.svelte';
	import { loadContentByDirectory } from '$lib/content/loader';

	const allSignals = loadContentByDirectory('signals');
	let previewSignal = $state<typeof allSignals[0] | null>(null);
	let showPreview = $state(false);

	// Convert signals to slider format
	const sliderItems = allSignals.map((signal) => ({
		id: signal.slug,
		icon: (signal.metadata.icon || 'scale') as 'scale' | 'analytics' | 'cloud' | 'intelligence',
		title: signal.metadata.title,
		description: signal.metadata.description || '',
		details: signal.content.substring(0, 200) + '...',
		image: signal.metadata.image
	}));

	function handlePreview(slug: string) {
		const signal = allSignals.find((s) => s.slug === slug);
		if (signal) {
			previewSignal = signal;
			showPreview = true;
		}
	}
</script>

<svelte:head>
	<title>Signals | QuantumCore Solutions</title>
	<meta name="description" content="Architecture thinking, case studies, and strategic insights from real-world implementations." />
</svelte:head>

<Section class="signals-hero">
	<Reveal>
		<h1>Signals</h1>
		<p class="signals-intro">
			Architecture thinking. Abstract case studies. Real-world implementations. Signals from the field that shape how we engineer systems.
		</p>
	</Reveal>
</Section>

{#if sliderItems.length > 0}
	<Section class="signals-slider-section">
		<Reveal>
			<h2>Featured Signals</h2>
			<p class="section-intro">
				Explore our latest architectural thinking and case studies through an interactive experience.
			</p>
		</Reveal>
		<SignalSlider items={sliderItems} />
	</Section>
{/if}

<Section class="signals-grid-section">
	<Reveal>
		<h2>All Signals</h2>
		<p class="section-intro">
			Case studies, architectural patterns, and strategic insights. Each signal represents real-world thinking applied to complex problems.
		</p>
	</Reveal>

	<div class="signals-grid">
		{#each allSignals as signal, index}
			<Reveal delay={index * 0.1}>
				<SignalCard signal={signal} onPreview={handlePreview} />
			</Reveal>
		{/each}
	</div>

	{#if allSignals.length === 0}
		<Reveal>
			<div class="empty-state">
				<p>No signals available yet. Check back soon for new case studies and insights.</p>
			</div>
		</Reveal>
	{/if}
</Section>

<ArticlePreviewModal bind:open={showPreview} article={previewSignal} />

<style>
	.signals-hero {
		text-align: center;
		padding: 3rem 0 2rem;
	}

	.signals-intro {
		font-size: 1.3rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 1.5rem auto 2rem;
		max-width: 800px;
	}

	.signals-slider-section {
		background: var(--bg-secondary);
		padding: 4rem 0;
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

	.signals-grid-section {
		padding: 4rem 0;
	}

	.signals-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		margin-top: 3rem;
	}

	@media (min-width: 768px) {
		.signals-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.signals-grid {
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
</style>
