<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import DomainCard from '$lib/components/DomainCard.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { loadContentByDirectory } from '$lib/content/loader';

	const domains = loadContentByDirectory('domains');
</script>

<svelte:head>
	<title>Domains of Work | QuantumCore Solutions</title>
	<meta name="description" content="Core domains of engineering work at QuantumCore Solutions." />
</svelte:head>

<Section>
	<Reveal>
		<h1>Domains of Work</h1>
		<p class="domains-intro">
			We engineer systems across these core domains. Each represents a foundational area of architectural thinking.
		</p>
	</Reveal>
	<div class="domains-grid">
		{#each domains as domain, index}
			<Reveal delay={index * 0.1}>
				<DomainCard
					title={domain.metadata.title}
					description={domain.metadata.description}
					slug={domain.slug}
					order={index}
					image={domain.metadata.diagram}
				/>
			</Reveal>
		{/each}
	</div>
</Section>

<style>
	.domains-intro {
		font-size: 1.25rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 4rem;
		max-width: 700px;
	}

	.domains-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-top: 3rem;
	}

	@media (min-width: 768px) {
		.domains-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.domains-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>

