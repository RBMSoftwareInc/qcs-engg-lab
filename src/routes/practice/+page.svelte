<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import PracticeCard from '$lib/components/PracticeCard.svelte';
	import PracticeModal from '$lib/components/PracticeModal.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { loadContentByDirectory } from '$lib/content/loader';

	// Merge domains and services into practice items
	const domains = loadContentByDirectory('domains');
	const services = loadContentByDirectory('services');
	
	// Combine and sort by order if present
	const practiceItems = [...domains, ...services].sort((a, b) => {
		const orderA = a.metadata.order ?? 999;
		const orderB = b.metadata.order ?? 999;
		return orderA - orderB;
	});

	let selectedPractice = $state<any>(null);
	let showModal = $state(false);
</script>

<svelte:head>
	<title>Practice | QuantumCore Solutions</title>
	<meta name="description" content="How we think and work. Core areas of engineering practice at QuantumCore Solutions." />
</svelte:head>

<Section>
	<Reveal>
		<h1>Practice</h1>
		<p class="practice-intro">
			This is how we think and work. Each area represents a foundational domain of architectural thinking and system capability.
		</p>
	</Reveal>
	<div class="practice-grid">
		{#each practiceItems as item, index}
			<Reveal delay={index * 0.1}>
				<PracticeCard
					title={item.metadata.title}
					description={item.metadata.description || ''}
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
</Section>

<style>
	.practice-intro {
		font-size: 1.25rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 4rem;
		max-width: 700px;
	}

	.practice-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-top: 3rem;
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
</style>

