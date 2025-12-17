<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let overlayRef: HTMLElement;
	let mouseX = $state(0);
	let mouseY = $state(0);

	onMount(() => {
		function handleMouseMove(e: MouseEvent) {
			mouseX = e.clientX;
			mouseY = e.clientY;
		}

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	});
</script>

<div
	class="grid-overlay"
	bind:this={overlayRef}
	style:--mouse-x={mouseX + 'px'}
	style:--mouse-y={mouseY + 'px'}
>
	<div class="grid-lines"></div>
	<div class="grid-glow"></div>
</div>

<style>
	.grid-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		opacity: 0.02;
	}

	.grid-lines {
		width: 100%;
		height: 100%;
		background-image: 
			linear-gradient(to right, var(--text-primary) 1px, transparent 1px),
			linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px);
		background-size: 50px 50px;
		background-position: 0 0;
		animation: gridMove 20s linear infinite;
	}

	.grid-glow {
		position: absolute;
		width: 300px;
		height: 300px;
		border-radius: 50%;
		background: radial-gradient(circle, var(--highlight) 0%, transparent 70%);
		left: var(--mouse-x);
		top: var(--mouse-y);
		transform: translate(-50%, -50%);
		opacity: 0.1;
		transition: left 0.1s ease-out, top 0.1s ease-out;
		pointer-events: none;
	}

	@keyframes gridMove {
		0% {
			background-position: 0 0;
		}
		100% {
			background-position: 50px 50px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.grid-lines {
			animation: none;
		}
	}
</style>

