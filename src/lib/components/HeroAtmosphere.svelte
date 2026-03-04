<script lang="ts">
	import { onMount } from 'svelte';

	let containerRef: HTMLElement;
	let mouseX = $state(0.5);
	let mouseY = $state(0.5);
	let prefersReducedMotion = $state(false);

	// Particle positions as 0–1 within hero (seeded for consistency)
	const particles = Array.from({ length: 12 }, (_, i) => ({
		left: 8 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 84,
		top: 10 + (Math.cos(i * 2.3) * 0.5 + 0.5) * 80,
		size: 2 + (i % 3),
		duration: 35 + (i % 5) * 8,
		delay: i * -2.5,
		opacity: 0.06 + (i % 4) * 0.03
	}));

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		function onMove(e: MouseEvent) {
			if (!containerRef) return;
			const rect = containerRef.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;
			mouseX = Math.max(0, Math.min(1, x));
			mouseY = Math.max(0, Math.min(1, y));
		}

		window.addEventListener('mousemove', onMove, { passive: true });
		return () => window.removeEventListener('mousemove', onMove);
	});
</script>

<div class="hero-atmosphere" aria-hidden="true" bind:this={containerRef}>
	<!-- Faint blueprint-style grid (subliminal structure) -->
	<div class="atmosphere-grid" class:no-motion={prefersReducedMotion}></div>

	<!-- Cursor-following soft spotlight (hero-scoped, warm and subtle) -->
	{#if !prefersReducedMotion}
		<div
			class="atmosphere-spotlight"
			style:--mx={mouseX * 100 + '%'}
			style:--my={mouseY * 100 + '%'}
		></div>
	{/if}

	<!-- Slow-drifting particles (depth, no trail) -->
	{#each particles as p, i}
		<div
			class="atmosphere-particle"
			class:no-motion={prefersReducedMotion}
			style:left={p.left + '%'}
			style:top={p.top + '%'}
			style:width={p.size + 'px'}
			style:height={p.size + 'px'}
			style:opacity={p.opacity}
			style:animation-duration={p.duration + 's'}
			style:animation-delay={p.delay + 's'}
		></div>
	{/each}
</div>

<style>
	.hero-atmosphere {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
		border-radius: inherit;
	}

	/* Very faint grid – blueprint / construction feel */
	.atmosphere-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(to right, var(--text-primary) 1px, transparent 1px),
			linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px);
		background-size: 40px 40px;
		opacity: 0.035;
	}

	.atmosphere-grid.no-motion {
		opacity: 0.025;
	}

	/* Single soft glow that follows cursor – reading-light effect */
	.atmosphere-spotlight {
		position: absolute;
		left: var(--mx);
		top: var(--my);
		width: min(90vw, 420px);
		height: min(90vw, 420px);
		transform: translate(-50%, -50%);
		background: radial-gradient(
			circle,
			rgba(255, 232, 163, 0.12) 0%,
			rgba(255, 246, 219, 0.04) 45%,
			transparent 70%
		);
		transition: left 0.4s ease-out, top 0.4s ease-out;
		pointer-events: none;
	}

	/* Floating particles – slow drift, no trail */
	.atmosphere-particle {
		position: absolute;
		border-radius: 50%;
		background: var(--text-primary);
		animation: atmosphere-float linear infinite;
	}

	.atmosphere-particle.no-motion {
		animation: none;
		opacity: 0.04 !important;
	}

	@keyframes atmosphere-float {
		0%, 100% {
			transform: translate(0, 0) scale(1);
		}
		25% {
			transform: translate(4px, -8px) scale(1.1);
		}
		50% {
			transform: translate(-3px, 2px) scale(0.95);
		}
		75% {
			transform: translate(6px, 4px) scale(1.05);
		}
	}
</style>
