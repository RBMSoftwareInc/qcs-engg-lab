<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Accordion from '$lib/components/Accordion.svelte';

	const principles = [
		{
			title: 'Architecture Before Infrastructure',
			content: `
				<p>We design systems that endure. Infrastructure choices are means to architectural ends, not ends in themselves. Every technical decision serves a larger structural purpose.</p>
				<p>This means we think in layers, patterns, and relationships before we think in tools, platforms, or vendors.</p>
			`,
			icon: '🏗️'
		},
		{
			title: 'Research-Driven Engineering',
			content: `
				<p>Every project advances our understanding of systems architecture. We maintain a research-driven approach, documenting learnings and sharing insights through our work.</p>
				<p>We are an engineering lab, not a consultancy. Our work centers on research-driven engineering and architectural thinking.</p>
			`,
			icon: '🔬'
		},
		{
			title: 'Systems Thinking',
			content: `
				<p>We approach every problem with systems thinking. Components exist within systems, and we design with system-level understanding.</p>
				<p>This means understanding boundaries, interfaces, and emergent properties. We design for the system, not just the component.</p>
			`,
			icon: '⚙️'
		},
		{
			title: 'Long-Term Perspective',
			content: `
				<p>Systems outlive their initial requirements. We design for evolution, enabling future changes rather than constraining them.</p>
				<p>This means favoring extensibility over optimization, clarity over cleverness, and structure over speed.</p>
			`,
			icon: '⏳'
		},
		{
			title: 'Clarity Over Complexity',
			content: `
				<p>We engineer clarity into complexity. The goal is not to eliminate complexity, but to make it manageable, understandable, and navigable.</p>
				<p>This means explicit interfaces, clear boundaries, and thoughtful abstractions that reveal rather than obscure.</p>
			`,
			icon: '💡'
		}
	];

	const stats = [
		{
			label: 'Years of Practice',
			value: '15+',
			description: 'Engineering systems at scale'
		},
		{
			label: 'Systems Architected',
			value: '50+',
			description: 'Across industries and domains'
		},
		{
			label: 'Research Areas',
			value: '8',
			description: 'Active domains of practice'
		},
		{
			label: 'Insights Published',
			value: '30+',
			description: 'Engineering observations shared'
		}
	];

	const values = [
		{
			title: 'Depth Over Breadth',
			description: 'We go deep. Surface-level understanding is not enough for systems that must endure.'
		},
		{
			title: 'Evidence Over Opinion',
			description: 'We make decisions based on evidence, patterns, and principles, not trends or preferences.'
		},
		{
			title: 'Structure Over Speed',
			description: 'We favor architectural decisions that create lasting value over quick wins that create technical debt.'
		},
		{
			title: 'Clarity Over Cleverness',
			description: 'We write code and design systems that are easy to understand, maintain, and evolve.'
		}
	];
</script>

<svelte:head>
	<title>About | QuantumCore Solutions</title>
	<meta name="description" content="An engineering lab focused on systems architecture, research-driven engineering, and architectural thinking." />
</svelte:head>

<Section class="about-hero">
	<Reveal>
		<h1>About</h1>
		<p class="hero-intro">
			We are an engineering lab focused on systems architecture, not a consultancy or agency. Our work centers on research-driven engineering and architectural thinking.
		</p>
	</Reveal>
</Section>

<Section class="stats-section">
	<Reveal>
		<div class="stats-grid">
			{#each stats as stat, index}
				<Reveal delay={index * 0.1}>
					<div class="stat-tile">
						<div class="stat-value">{stat.value}</div>
						<div class="stat-label">{stat.label}</div>
						<div class="stat-description">{stat.description}</div>
					</div>
				</Reveal>
			{/each}
		</div>
	</Reveal>
</Section>

<Section class="principles-section">
	<Reveal>
		<h2>Principles</h2>
		<p class="section-intro">
			These principles guide how we think, design, and build. They are not rules, but frameworks for decision-making.
		</p>
	</Reveal>
	<Reveal delay={0.2}>
		<Accordion items={principles} allowMultiple={false} />
	</Reveal>
</Section>

<Section class="values-section">
	<Reveal>
		<h2>Values</h2>
		<p class="section-intro">
			What we prioritize in our work and how we approach problems.
		</p>
	</Reveal>
	<div class="values-grid">
		{#each values as value, index}
			<Reveal delay={index * 0.1}>
				<div class="value-tile">
					<h3 class="value-title">{value.title}</h3>
					<p class="value-description">{value.description}</p>
				</div>
			</Reveal>
		{/each}
	</div>
</Section>

<Section class="approach-section">
	<Reveal>
		<h2>How We Work</h2>
		<div class="approach-content">
			<div class="approach-item">
				<div class="approach-number">01</div>
				<div class="approach-text">
					<h3>Understand the System</h3>
					<p>We start by understanding the system as a whole—its boundaries, interfaces, and relationships. Context matters more than components.</p>
				</div>
			</div>
			<div class="approach-item">
				<div class="approach-number">02</div>
				<div class="approach-text">
					<h3>Design for Evolution</h3>
					<p>We design systems that can evolve. This means extensible architectures, clear boundaries, and thoughtful abstractions.</p>
				</div>
			</div>
			<div class="approach-item">
				<div class="approach-number">03</div>
				<div class="approach-text">
					<h3>Document and Share</h3>
					<p>We document our thinking, decisions, and learnings. Knowledge shared is knowledge multiplied.</p>
				</div>
			</div>
		</div>
	</Reveal>
</Section>

<style>
	.about-hero {
		text-align: center;
		padding: 4rem 0 3rem;
	}

	.hero-intro {
		font-size: 1.4rem;
		line-height: 1.8;
		color: var(--text-secondary);
		max-width: 800px;
		margin: 2rem auto 0;
	}

	.stats-section {
		background: var(--bg-secondary);
		padding: 4rem 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.stat-tile {
		background: var(--bg-primary);
		padding: 2.5rem 2rem;
		border-radius: 12px;
		text-align: center;
		border: 1px solid var(--border-subtle);
		transition: all 0.3s ease;
	}

	.stat-tile:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		border-color: var(--highlight);
	}

	.stat-value {
		font-size: 3rem;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1;
		margin-bottom: 0.5rem;
		letter-spacing: -0.02em;
	}

	.stat-label {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-description {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.principles-section {
		padding: 5rem 0;
	}

	.section-intro {
		font-size: 1.15rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 3rem;
		max-width: 700px;
	}

	.values-section {
		background: var(--bg-secondary);
		padding: 5rem 0;
	}

	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.value-tile {
		background: var(--bg-primary);
		padding: 2.5rem;
		border-radius: 12px;
		border: 1px solid var(--border-subtle);
		transition: all 0.3s ease;
	}

	.value-tile:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		border-color: var(--highlight);
	}

	.value-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	.value-description {
		color: var(--text-secondary);
		line-height: 1.7;
		margin: 0;
	}

	.approach-section {
		padding: 5rem 0;
	}

	.approach-content {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		margin-top: 3rem;
	}

	.approach-item {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}

	.approach-number {
		font-size: 4rem;
		font-weight: 600;
		color: var(--highlight);
		line-height: 1;
		opacity: 0.3;
		flex-shrink: 0;
		width: 80px;
	}

	.approach-text {
		flex: 1;
	}

	.approach-text h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
	}

	.approach-text p {
		font-size: 1.1rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0;
	}

	@media (max-width: 768px) {
		.hero-intro {
			font-size: 1.2rem;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}

		.stat-tile {
			padding: 2rem 1.5rem;
		}

		.stat-value {
			font-size: 2.5rem;
		}

		.values-grid {
			grid-template-columns: 1fr;
		}

		.approach-item {
			flex-direction: column;
			gap: 1rem;
		}

		.approach-number {
			font-size: 3rem;
			width: auto;
		}
	}
</style>
