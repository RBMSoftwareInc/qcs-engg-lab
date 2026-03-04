<script lang="ts">
	import { onMount } from 'svelte';
	import HeroAtmosphere from '$lib/components/HeroAtmosphere.svelte';

	let { statement, subline, tagline, image, offerings } = $props<{
		statement: string;
		subline?: string;
		tagline?: string;
		image?: string;
		offerings?: string;
	}>();

	// Always show a subliminal conceptual image (motto/offering: systems, architecture)
	const defaultConceptualImage = '/assets/images/shared/hero-engg.svg';
	const conceptualImage = image || defaultConceptualImage;

	// "before" on its own line between Architecture and infrastructure.
	const parts = $derived(
		statement.includes(' before ')
			? statement.split(' before ').map((s: string) => s.trim())
			: null
	);
	const threeLines = $derived(
		parts && parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
	);

	let heroRef: HTMLElement;
	let prefersReducedMotion = $state(false);
	let mouseX = $state(0);
	let mouseY = $state(0);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (!prefersReducedMotion) {
			function handleMouseMove(e: MouseEvent) {
				mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
				mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
			}

			window.addEventListener('mousemove', handleMouseMove);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
			};
		}
	});
</script>

<section class="hero" bind:this={heroRef}>
	<!-- Subliminal conceptual layer (left accent only; right circles removed) -->
	<div class="hero-concept" aria-hidden="true">
		<div class="hero-concept-accent">
			<img src={conceptualImage} alt="" loading="eager" decoding="async" />
		</div>
	</div>

	<HeroAtmosphere />

	<div class="container">
		<div class="hero-content">
			<div
				class="hero-text"
				style:transform={prefersReducedMotion ? 'none' : `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px)`}
			>
				<h1 class="hero-statement" class:hero-statement-three={threeLines}>
					{#if threeLines}
						<span class="hero-three-lines">
							<span class="hero-line hero-line-1">{parts[0]}</span>
							<span class="hero-line hero-line-before">before</span>
							<span class="hero-line hero-line-3">{parts[1]}</span>
						</span>
					{:else}
						{statement}
					{/if}
				</h1>
				{#if subline}
					<p
						class="hero-subline"
						style:animation={prefersReducedMotion ? 'none' : undefined}
					>
						{subline}
					</p>
				{/if}
				{#if tagline}
					<p
						class="hero-tagline"
						style:animation={prefersReducedMotion ? 'none' : undefined}
					>
						{tagline}
					</p>
				{/if}
				{#if offerings}
					<p
						class="hero-offerings"
						style:animation={prefersReducedMotion ? 'none' : undefined}
					>
						{offerings}
					</p>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		min-height: 72vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6rem 0 5rem;
		position: relative;
		overflow: hidden;
		background: linear-gradient(160deg, rgba(255, 253, 247, 0.6) 0%, rgba(255, 246, 219, 0.25) 50%, rgba(255, 253, 247, 0.4) 100%);
	}

	.hero-concept {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	.hero-concept-accent {
		position: absolute;
		bottom: 15%;
		left: -2%;
		width: min(28vw, 200px);
		opacity: 0.045;
	}

	.hero-concept-accent img {
		width: 100%;
		height: auto;
		display: block;
	}

	@media (min-width: 768px) {
		.hero-concept-accent {
			opacity: 0.055;
		}
	}

	.hero .container {
		position: relative;
		z-index: 1;
	}

	.hero-content {
		text-align: center;
		max-width: 720px;
		margin: 0 auto;
	}

	.hero-text {
		text-align: center;
		transition: transform 0.12s ease-out;
		position: relative;
	}

	.hero-statement {
		font-size: clamp(2.35rem, 6.5vw, 4rem);
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.035em;
		margin-bottom: 0;
		color: var(--text-primary);
	}

	/* Tighter block for "Architecture / before / infrastructure" */
	.hero-statement-three .hero-three-lines {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.02em;
		line-height: 1.05;
	}

	.hero-line {
		display: block;
		opacity: 0;
		transform: translateY(10px);
	}

	.hero-line-1 {
		animation: heroLineIn 0.5s ease-out 0s forwards;
	}

	.hero-line-before {
		animation: heroLineIn 0.5s ease-out 0.1s forwards;
	}

	.hero-line-3 {
		animation: heroLineIn 0.5s ease-out 0.2s forwards;
	}

	/* Subtle highlight on "before" just before subline appears */
	.hero-line-before {
		color: var(--text-primary);
		position: relative;
	}

	.hero-line-before::after {
		content: '';
		position: absolute;
		left: -0.15em;
		right: -0.15em;
		top: 0.05em;
		bottom: 0.05em;
		background: color-mix(in srgb, var(--highlight) 18%, transparent);
		border-radius: 0.12em;
		z-index: -1;
		opacity: 0;
		animation: heroBeforeHighlight 1.2s ease-out 0.45s forwards;
	}

	@keyframes heroLineIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes heroBeforeHighlight {
		0% { opacity: 0; }
		25% { opacity: 1; }
		70% { opacity: 0.75; }
		100% { opacity: 0; }
	}

	.hero-subline {
		font-size: clamp(1.05rem, 2.2vw, 1.35rem);
		color: var(--text-secondary);
		line-height: 1.65;
		opacity: 0;
		transform: translateY(18px);
		animation: fadeInUp 0.75s ease-out 0.95s forwards;
		max-width: 560px;
		margin: 1.75rem auto 0.75rem;
	}

	.hero-tagline {
		font-size: clamp(0.95rem, 1.8vw, 1.1rem);
		color: var(--text-secondary);
		line-height: 1.6;
		opacity: 0;
		transform: translateY(12px);
		animation: fadeInUp 0.6s ease-out 1.05s forwards;
		max-width: 520px;
		margin: 0 auto 1rem;
		font-weight: 400;
	}

	.hero-offerings {
		font-size: 0.8125rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		opacity: 0;
		transform: translateY(18px);
		animation: fadeInUp 0.75s ease-out 1.2s forwards;
		margin: 0;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-line,
		.hero-line-1,
		.hero-line-before,
		.hero-line-3 {
			opacity: 1;
			transform: none;
			animation: none;
		}
		.hero-line-before::after {
			animation: none;
			opacity: 0;
		}
		.hero-subline,
		.hero-tagline,
		.hero-offerings {
			opacity: 1;
			transform: none;
			animation: none;
		}
	}
</style>
