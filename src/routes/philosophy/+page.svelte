<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import PhilosophySlider from '$lib/components/PhilosophySlider.svelte';
	import PhilosophyIcon from '$lib/components/PhilosophyIcon.svelte';

	const philosophyItems = [
		{
			id: 'architecture',
			icon: 'architecture' as const,
			title: 'Architecture Over Infrastructure',
			description: 'Infrastructure is a means, not an end.',
			details:
				'We focus on architectural decisions that create lasting value, not infrastructure choices that become technical debt. Every system we design begins with architectural thinking—understanding how components interact, how data flows, and how the system will evolve. Infrastructure follows architecture, not the other way around.',
			image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80'
		},
		{
			id: 'systems',
			icon: 'systems' as const,
			title: 'Systems Thinking',
			description: 'Every component exists within a system.',
			details:
				'We design with system-level understanding, considering interactions, dependencies, and emergent behaviors. A component optimized in isolation often degrades system performance. We model systems holistically, understanding that the whole is greater than the sum of its parts.',
			image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80'
		},
		{
			id: 'research',
			icon: 'research' as const,
			title: 'Research-Driven Development',
			description: 'Engineering decisions informed by evidence, not assumptions.',
			details:
				'We maintain a research-driven approach to all architectural decisions. Before we build, we study. Before we commit, we validate. Our solutions are grounded in proven patterns, tested methodologies, and real-world evidence. This isn\'t academic—it\'s practical engineering at scale.',
			image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80'
		},
		{
			id: 'complexity',
			icon: 'complexity' as const,
			title: 'Minimal Complexity',
			description: 'Complexity is the enemy of maintainability.',
			details:
				'We design systems with minimal necessary complexity, removing abstractions that don\'t serve clear purposes. Every layer, every abstraction, every pattern must justify its existence. Simplicity is not the absence of sophistication—it\'s the presence of clarity.',
			image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80'
		},
		{
			id: 'longterm',
			icon: 'longterm' as const,
			title: 'Long-Term Thinking',
			description: 'Systems outlive their initial requirements.',
			details:
				'We design for evolution, not just current needs. Architecture should enable future changes, not constrain them. The systems we build today must serve organizations for years, adapting to new requirements, scaling to new demands, and evolving with business needs.',
			image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'
		},
		{
			id: 'production',
			icon: 'production' as const,
			title: 'Production Reality',
			description: 'Theoretical elegance must meet production reality.',
			details:
				'We design systems that are elegant in theory and robust in practice, tested under real-world conditions. Production is the ultimate test. Our architectures are battle-tested, performance-validated, and operationally proven. Theory without practice is incomplete engineering.',
			image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80'
		}
	];
</script>

<svelte:head>
	<title>Engineering Philosophy | QuantumCore Solutions</title>
	<meta name="description" content="Our approach to systems architecture and engineering—architecture over infrastructure, systems thinking, and research-driven development." />
</svelte:head>

<Section class="philosophy-hero">
	<Reveal>
		<h1>Engineering Philosophy</h1>
		<p class="philosophy-intro">
			Our approach to systems architecture and engineering. Six principles that guide every decision, every design, every implementation.
		</p>
	</Reveal>
</Section>

<Section class="philosophy-slider-section">
	<PhilosophySlider items={philosophyItems} />
</Section>

<Section class="philosophy-principles">
	<Reveal>
		<h2>Core Principles</h2>
		<p class="section-intro">
			These principles aren't abstract ideals—they're practical guidelines that shape how we engineer systems.
		</p>
	</Reveal>
	<div class="principles-grid">
		{#each philosophyItems as item, index}
			<Reveal delay={index * 0.1}>
				<div class="principle-card">
					<div class="principle-icon">
						<PhilosophyIcon type={item.icon} />
					</div>
					<h3 class="principle-title">{item.title}</h3>
					<p class="principle-description">{item.description}</p>
					<p class="principle-details">{item.details}</p>
				</div>
			</Reveal>
		{/each}
	</div>
</Section>

<Section class="philosophy-cta">
	<Reveal>
		<div class="cta-content">
			<h2>Ready to Build Systems That Endure?</h2>
			<p>
				Our philosophy isn't just words—it's how we engineer. Let's discuss how these principles can transform your systems.
			</p>
			<a href="/domains" class="cta-button">Explore Our Domains</a>
		</div>
	</Reveal>
</Section>

<style>
	.philosophy-hero {
		text-align: center;
		padding: 3rem 0 2rem;
	}

	.philosophy-intro {
		font-size: 1.3rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-top: 1.5rem;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.philosophy-slider-section {
		background: var(--bg-secondary);
		padding: 4rem 0;
	}

	.philosophy-principles {
		padding: 4rem 0;
	}

	.section-intro {
		font-size: 1.15rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 3rem;
		max-width: 700px;
		text-align: center;
		margin-left: auto;
		margin-right: auto;
	}

	.principles-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-top: 2rem;
	}

	@media (min-width: 768px) {
		.principles-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.principles-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.principle-card {
		padding: 2.5rem;
		background: var(--bg-primary);
		border-radius: 16px;
		border: 1px solid var(--border-subtle);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.principle-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 4px;
		background: var(--highlight);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.4s ease;
	}

	.principle-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
		border-color: var(--highlight);
	}

	.principle-card:hover::before {
		transform: scaleX(1);
	}

	.principle-icon {
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-secondary);
		border-radius: 12px;
		margin-bottom: 1.5rem;
		transition: transform 0.3s ease;
	}

	.principle-card:hover .principle-icon {
		transform: scale(1.1) rotate(5deg);
	}

	.principle-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.principle-description {
		font-size: 1.1rem;
		color: var(--highlight);
		font-weight: 500;
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.principle-details {
		font-size: 0.95rem;
		color: var(--text-secondary);
		line-height: 1.7;
		margin: 0;
	}

	.philosophy-cta {
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-accent) 100%);
		padding: 5rem 0;
		text-align: center;
	}

	.cta-content {
		max-width: 700px;
		margin: 0 auto;
	}

	.cta-content h2 {
		font-size: 2.5rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: var(--text-primary);
	}

	.cta-content p {
		font-size: 1.2rem;
		color: var(--text-secondary);
		line-height: 1.7;
		margin-bottom: 2.5rem;
	}

	.cta-button {
		display: inline-block;
		padding: 1rem 2.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		text-decoration: none;
		border: none;
		font-size: 1.1rem;
		font-weight: 600;
		border-radius: 8px;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(31, 41, 55, 0.2);
	}

	.cta-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(31, 41, 55, 0.3);
		background: var(--text-primary);
	}

	@media (max-width: 640px) {
		.cta-content h2 {
			font-size: 2rem;
		}

		.cta-content p {
			font-size: 1.1rem;
		}
	}
</style>
