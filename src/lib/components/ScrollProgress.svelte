<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state(0);
	let prefersReducedMotion = $state(false);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function updateProgress() {
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			const scrollableHeight = documentHeight - windowHeight;
			progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
		}

		window.addEventListener('scroll', updateProgress, { passive: true });
		updateProgress();

		return () => {
			window.removeEventListener('scroll', updateProgress);
		};
	});
</script>

<div
	class="scroll-progress"
	style:width={progress + '%'}
	style:opacity={progress > 5 ? '1' : '0'}
	aria-hidden="true"
></div>

<style>
	.scroll-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 2px;
		background: var(--highlight);
		z-index: 9999;
		transition: width 0.1s ease, opacity 0.3s ease;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-progress {
			transition: none;
		}
	}
</style>

