<script lang="ts">
	import { onMount } from 'svelte';

	let { readTimeMinutes = 0, contentSelector = '.content-wrapper, .article-body' } = $props<{
		readTimeMinutes?: number;
		contentSelector?: string;
	}>();

	let progress = $state(0);
	let minutesLeft = $state(readTimeMinutes);
	let prefersReducedMotion = $state(false);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const el = document.querySelector(contentSelector);
		if (!el || readTimeMinutes <= 0) return;

		function update() {
			const rect = el.getBoundingClientRect();
			const windowHeight = window.innerHeight;
			const scrollable = rect.height - windowHeight;
			if (scrollable <= 0) {
				progress = 1;
				minutesLeft = 0;
				return;
			}
			const scrolled = -rect.top;
			progress = Math.min(1, Math.max(0, scrolled / scrollable));
			minutesLeft = Math.max(0, Math.ceil((1 - progress) * readTimeMinutes));
		}

		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		update();
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

{#if readTimeMinutes > 0}
	<div class="reading-progress" role="status" aria-live="polite">
		<div class="reading-progress-bar" style:width={`${progress * 100}%`}></div>
		<span class="reading-progress-label">{minutesLeft} min left</span>
	</div>
{/if}

<style>
	.reading-progress {
		position: sticky;
		top: 80px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		margin-bottom: 1.5rem;
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border-subtle);
	}

	.reading-progress-bar {
		height: 3px;
		background: var(--highlight);
		border-radius: 2px;
		transition: width 0.15s ease;
		flex: 1;
		max-width: 120px;
	}

	.reading-progress-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.reading-progress-bar {
			transition: none;
		}
	}
</style>
