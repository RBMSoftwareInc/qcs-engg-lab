<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { statement, subline, image } = $props<{
		statement: string;
		subline?: string;
		image?: string;
	}>();

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
	<div class="container">
		<div class="hero-content" class:with-image={!!image}>
			<div
				class="hero-text"
				style:transform={prefersReducedMotion ? 'none' : `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px)`}
			>
				<h1
					class="hero-statement"
					style:animation={prefersReducedMotion ? 'none' : undefined}
					style:text-shadow={prefersReducedMotion ? 'none' : `${mouseX * 0.5}px ${mouseY * 0.5}px 20px rgba(244, 196, 48, 0.1)`}
				>
					{statement}
				</h1>
				{#if subline}
					<p
						class="hero-subline"
						style:animation={prefersReducedMotion ? 'none' : undefined}
					>
						{subline}
					</p>
				{/if}
			</div>
			{#if image}
				<div class="hero-image">
					<img src={image} alt="" loading="lazy" decoding="async" aria-hidden="true" />
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.hero {
		min-height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5rem 0 4rem;
		position: relative;
		background: linear-gradient(135deg, rgba(255, 253, 247, 0.4) 0%, rgba(255, 246, 219, 0.2) 100%);
	}

	.hero-content {
		text-align: center;
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-content.with-image {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		align-items: center;
		text-align: left;
		max-width: 1200px;
	}

	@media (min-width: 768px) {
		.hero-content.with-image {
			grid-template-columns: 1fr 1fr;
		}
	}

	.hero-text {
		text-align: center;
		transition: transform 0.1s ease-out;
		position: relative;
	}

	.hero-content.with-image .hero-text {
		text-align: left;
	}

	.hero-image {
		opacity: 0.05;
		transition: opacity 0.3s ease;
	}

	.hero-image img {
		width: 100%;
		height: auto;
		max-width: 400px;
		margin: 0 auto;
		display: block;
	}

	@media (min-width: 768px) {
		.hero-image {
			opacity: 0.08;
		}
	}

	.hero-statement {
		font-size: clamp(2.5rem, 7vw, 4.5rem);
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.04em;
		margin-bottom: 1.5rem;
		color: var(--text-primary);
		opacity: 0;
		transform: translateY(20px);
		animation: fadeInUp 0.8s ease-out 0.2s forwards;
	}

	.hero-subline {
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
		color: var(--text-secondary);
		line-height: 1.7;
		opacity: 0;
		transform: translateY(20px);
		animation: fadeInUp 0.8s ease-out 0.4s forwards;
		max-width: 700px;
		margin: 0 auto;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-statement,
		.hero-subline {
			opacity: 1;
			transform: none;
			animation: none;
		}
	}
</style>

