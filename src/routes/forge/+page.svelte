<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Reveal from '$lib/components/Reveal.svelte';

	const features = [
		{
			title: 'AI-driven snippets',
			description: 'Generate and refine code snippets in context. Fast, relevant, and aligned with your stack.'
		},
		{
			title: 'Reverse engineering',
			description: 'Upload a project and get structure, dependencies, and flow—so you can onboard or refactor with clarity.'
		},
		{
			title: 'Code quality & community',
			description: 'Assess quality, share patterns, and grow your imprint. Community help and promotion in one place.'
		}
	];
</script>

<svelte:head>
	<title>Core Forge — Coming Soon | QuantumCore Solutions</title>
	<meta name="description" content="QCS Core Forge: a dev lab for AI snippets, reverse engineering, and code quality. Community-driven. Coming soon." />
</svelte:head>

<div class="forge-page">
	<div class="forge-bg" aria-hidden="true">
		<div class="forge-lines"></div>
		<div class="forge-accent"></div>
	</div>

	<div class="forge-hero">
		<Section>
		<div class="forge-hero-inner">
			<Reveal>
				<p class="forge-label">QCS Dev Lab</p>
				<h1 class="forge-title">Core Forge</h1>
				<p class="forge-tagline">
					Where code meets clarity.
				</p>
				<p class="forge-intro">
					A dev lab for AI-driven snippets, reverse engineering on your projects, and code quality—backed by community and built to grow your imprint.
				</p>
			</Reveal>
			<Reveal delay={0.2}>
				<div class="coming-soon-banner">Coming soon</div>
			</Reveal>
		</div>
		</Section>
	</div>

	<div class="forge-features">
		<Section>
		<Reveal>
			<h2 class="features-heading">What to expect</h2>
			<p class="features-intro">
				Core Forge will give you tools to understand, improve, and share code—aligned with how we work: clarity over complexity, iteration over big-bang releases.
			</p>
		</Reveal>
		<div class="features-grid">
			{#each features as item, i}
				<Reveal delay={i * 0.1}>
					<div class="feature-card">
						<h3 class="feature-title">{item.title}</h3>
						<p class="feature-desc">{item.description}</p>
					</div>
				</Reveal>
			{/each}
		</div>
		</Section>
	</div>

	<div class="forge-cta">
		<Section>
		<Reveal>
			<p class="cta-text">
				We’re building Core Forge as a dedicated dev lab—AI snippets, reverse engineering, code quality, and community. When it’s ready, you’ll find it linked here.
			</p>
			<p class="cta-sub">
				In the meantime, explore <a href="/playground">Neural</a>, our <a href="/practice">practice</a>, and <a href="/signals">signals</a>.
			</p>
		</Reveal>
		</Section>
	</div>
</div>

<style>
	.forge-page {
		--forge-accent: #065f70;
		position: relative;
		min-height: 40vh;
	}

	.forge-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.forge-lines {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 23px,
			rgba(6, 95, 112, 0.04) 23px,
			rgba(6, 95, 112, 0.04) 24px
		);
		opacity: 1;
	}

	.forge-accent {
		position: absolute;
		top: -10%;
		right: 10%;
		width: 50%;
		max-width: 400px;
		height: 300px;
		background: radial-gradient(
			ellipse at center,
			rgba(6, 95, 112, 0.06) 0%,
			rgba(6, 95, 112, 0.02) 45%,
			transparent 70%
		);
		pointer-events: none;
	}

	.forge-hero {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 4rem 0 3rem;
	}

	.forge-hero-inner {
		max-width: 720px;
		margin: 0 auto;
	}

	.forge-label {
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 0.5rem 0;
	}

	.forge-title {
		font-size: clamp(2.5rem, 8vw, 4rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.05;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.forge-tagline {
		font-size: 1.25rem;
		color: var(--forge-accent);
		font-weight: 500;
		letter-spacing: -0.01em;
		margin: 0 0 1.25rem 0;
	}

	.forge-intro {
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0 0 2rem 0;
	}

	.coming-soon-banner {
		display: inline-flex;
		align-items: center;
		gap: 0;
		padding: 0.5rem 1.25rem;
		background: transparent;
		border: 2px solid var(--forge-accent);
		clip-path: polygon(0.5rem 0, 100% 0, calc(100% - 0.5rem) 100%, 0 100%);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--forge-accent);
	}

	.forge-features {
		position: relative;
		z-index: 1;
	}

	.features-heading {
		text-align: center;
		margin-bottom: 0.75rem;
	}

	.features-intro {
		text-align: center;
		max-width: 560px;
		margin: 0 auto 2.5rem;
		color: var(--text-secondary);
		font-size: 1rem;
		line-height: 1.65;
	}

	.features-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		max-width: 800px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		.features-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.feature-card {
		padding: 1.5rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-left: 3px solid var(--forge-accent);
		border-radius: 0 8px 8px 0;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.feature-card:hover {
		border-left-color: var(--forge-accent);
		box-shadow: 0 4px 20px rgba(6, 95, 112, 0.06);
	}

	.feature-title {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.feature-desc {
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin: 0;
	}

	.forge-cta {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 3rem 0 4rem;
		border-top: 1px solid var(--border-subtle);
	}

	.cta-text {
		max-width: 540px;
		margin: 0 auto 1rem;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--text-secondary);
	}

	.cta-sub {
		font-size: 0.9375rem;
		color: var(--text-muted);
		margin: 0;
	}

	.cta-sub a {
		color: var(--forge-accent);
		text-decoration: none;
		font-weight: 500;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s ease;
	}

	.cta-sub a:hover {
		border-bottom-color: var(--forge-accent);
	}
</style>
