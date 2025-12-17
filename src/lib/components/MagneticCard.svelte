<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { children } = $props();
	let cardRef: HTMLElement;
	let isHovering = $state(false);
	let translateX = $state(0);
	let translateY = $state(0);
	let rotateX = $state(0);
	let rotateY = $state(0);

	onMount(() => {
		function handleMouseMove(e: MouseEvent) {
			if (!cardRef || !isHovering) return;

			const rect = cardRef.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const deltaX = e.clientX - centerX;
			const deltaY = e.clientY - centerY;

			// Calculate movement (magnetic effect)
			translateX = deltaX * 0.1;
			translateY = deltaY * 0.1;

			// Calculate rotation
			rotateX = (deltaY / rect.height) * -10;
			rotateY = (deltaX / rect.width) * 10;
		}

		function handleMouseEnter() {
			isHovering = true;
		}

		function handleMouseLeave() {
			isHovering = false;
			translateX = 0;
			translateY = 0;
			rotateX = 0;
			rotateY = 0;
		}

		if (cardRef) {
			cardRef.addEventListener('mouseenter', handleMouseEnter);
			cardRef.addEventListener('mouseleave', handleMouseLeave);
			window.addEventListener('mousemove', handleMouseMove);
		}

		return () => {
			if (cardRef) {
				cardRef.removeEventListener('mouseenter', handleMouseEnter);
				cardRef.removeEventListener('mouseleave', handleMouseLeave);
			}
			window.removeEventListener('mousemove', handleMouseMove);
		};
	});
</script>

<div
	class="magnetic-card"
	bind:this={cardRef}
	style:transform={`translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`}
>
	{@render children()}
</div>

<style>
	.magnetic-card {
		transition: transform 0.1s ease-out;
		transform-style: preserve-3d;
		perspective: 1000px;
	}

	@media (prefers-reduced-motion: reduce) {
		.magnetic-card {
			transform: none !important;
		}
	}

	@media (pointer: coarse) {
		.magnetic-card {
			transform: none !important;
		}
	}
</style>

