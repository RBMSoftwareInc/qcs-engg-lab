<script lang="ts">
	import { onMount } from 'svelte';

	let { delay = 0 } = $props<{
		delay?: number;
	}>();

	let elementRef: HTMLElement;
	let isVisible = $state(false);
	let prefersReducedMotion = $state(false);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			isVisible = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isVisible = true;
						observer.disconnect();
					}
				});
			},
			{ threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
		);

		if (elementRef) {
			observer.observe(elementRef);
		}

		return () => observer.disconnect();
	});
</script>

<div
	class="reveal"
	class:visible={isVisible}
	bind:this={elementRef}
	style:--delay={delay + 's'}
>
	<slot />
</div>

<style>
	.reveal {
		opacity: 0;
		transform: translateY(30px);
		transition: opacity 0.8s ease var(--delay, 0s), transform 0.8s ease var(--delay, 0s);
	}

	.reveal.visible {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			opacity: 1;
			transform: none;
		}
	}
</style>

