<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let prefersReducedMotion = $state(false);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const threshold = 400;

		function update() {
			visible = window.scrollY > threshold;
		}

		window.addEventListener('scroll', update, { passive: true });
		update();
		return () => window.removeEventListener('scroll', update);
	});

	function goToTop() {
		window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
	}
</script>

{#if visible}
	<button
		type="button"
		class="back-to-top"
		onclick={goToTop}
		aria-label="Back to top"
		title="Back to top"
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<path d="M18 15l-6-6-6 6" />
		</svg>
	</button>
{/if}

<style>
	.back-to-top {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 1000;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 20px rgba(31, 41, 55, 0.25);
		opacity: 0;
		transform: translateY(8px);
		transition: opacity 0.25s ease, transform 0.25s ease, box-shadow 0.2s ease;
	}

	.back-to-top:hover {
		box-shadow: 0 6px 24px rgba(31, 41, 55, 0.35);
	}

	.back-to-top:focus-visible {
		outline: 2px solid var(--highlight);
		outline-offset: 2px;
	}

	.back-to-top {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.back-to-top {
			transition: none;
		}
	}

	@media (max-width: 768px) {
		.back-to-top {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 44px;
			height: 44px;
		}
	}
</style>
