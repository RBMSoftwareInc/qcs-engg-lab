<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import NeuralTrail from '$lib/components/NeuralTrail.svelte';

	const features = [
		{
			title: 'Experiment',
			description: 'Prompt, tune, and compare models in a single workspace—no setup, no pipelines.'
		},
		{
			title: 'Iterate',
			description: 'Chain steps, tweak parameters, and see results in real time. Fast feedback loops.'
		},
		{
			title: 'Build',
			description: 'Turn experiments into reusable flows. From prototype to production-ready logic.'
		}
	];
</script>

<svelte:head>
	<title>Neural — Coming Soon | QuantumCore Solutions</title>
	<meta name="description" content="QCS Neural: an AI playground for experimentation and iteration. Where ideas meet inference. Coming soon." />
</svelte:head>

<div class="playground-page">
	<NeuralTrail
			strokeColor="rgba(31, 41, 55, 0.26)"
			starColor="rgba(31, 41, 55, 0.14)"
			highlightColor="rgba(244, 196, 48, 0.8)"
			highlightGlow="rgba(244, 196, 48, 0.22)"
			showStars={false}
		/>
	<div class="neural-bg" aria-hidden="true">
		<div class="neural-grid"></div>
		<div class="neural-glow"></div>
	</div>

	<Section class="playground-hero">
		<div class="playground-hero-inner">
			<Reveal>
				<p class="playground-label">QCS AI</p>
				<h1 class="playground-title">Neural</h1>
				<p class="playground-tagline">
					Where ideas meet inference.
				</p>
				<p class="playground-intro">
					An AI playground for experimentation and iteration. Prompt, compare, and refine—without the friction. Built for engineers who think in systems and ship in cycles.
				</p>
			</Reveal>
			<Reveal delay={0.2}>
				<div class="coming-soon-badge">
					<span class="badge-dot"></span>
					<span>Coming soon</span>
				</div>
			</Reveal>
		</div>
	</Section>

	<Section class="playground-features">
		<Reveal>
			<h2 class="features-heading">What to expect</h2>
			<p class="features-intro">
				Neural will give you a clean, focused space to explore AI—aligned with how we work: clarity over complexity, iteration over big-bang releases.
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

	<Section class="playground-cta">
		<Reveal>
			<p class="cta-text">
				We’re building Neural in a dedicated environment—new skin, new context, fully QCS. When it’s ready, you’ll find it linked here.
			</p>
			<p class="cta-sub">
				In the meantime, explore our <a href="/practice">practice</a>, <a href="/philosophy">philosophy</a>, and <a href="/signals">signals</a>.
			</p>
		</Reveal>
	</Section>
</div>

<style>
	.playground-page {
		position: relative;
		min-height: 40vh;
	}

	.neural-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.neural-grid {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(circle at 1px 1px, var(--border-subtle) 1px, transparent 0);
		background-size: 32px 32px;
		opacity: 0.6;
	}

	.neural-glow {
		position: absolute;
		top: -20%;
		left: 50%;
		transform: translateX(-50%);
		width: 80%;
		max-width: 600px;
		height: 400px;
		background: radial-gradient(
			ellipse at center,
			rgba(244, 196, 48, 0.08) 0%,
			rgba(244, 196, 48, 0.02) 50%,
			transparent 70%
		);
		pointer-events: none;
	}

	.playground-hero {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 4rem 0 3rem;
	}

	.playground-hero-inner {
		max-width: 720px;
		margin: 0 auto;
	}

	.playground-label {
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 0.5rem 0;
	}

	.playground-title {
		font-size: clamp(2.5rem, 8vw, 4rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.05;
		margin: 0 0 1rem 0;
		background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.playground-tagline {
		font-size: 1.25rem;
		color: var(--highlight);
		font-weight: 500;
		letter-spacing: -0.01em;
		margin: 0 0 1.25rem 0;
	}

	.playground-intro {
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0 0 2rem 0;
	}

	.coming-soon-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--bg-accent);
		border: 1px solid var(--border-subtle);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		letter-spacing: 0.02em;
	}

	.badge-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--highlight);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.6; transform: scale(1.1); }
	}

	@media (prefers-reduced-motion: reduce) {
		.badge-dot {
			animation: none;
		}
	}

	.playground-features {
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
		border-radius: 12px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.feature-card:hover {
		border-color: rgba(244, 196, 48, 0.3);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
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

	.playground-cta {
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
		color: var(--highlight);
		text-decoration: none;
		font-weight: 500;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s ease;
	}

	.cta-sub a:hover {
		border-bottom-color: var(--highlight);
	}
</style>
