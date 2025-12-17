<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let cursorRef: HTMLElement;
	let followerRef: HTMLElement;
	let mouseX = $state(0);
	let mouseY = $state(0);
	let followerX = $state(0);
	let followerY = $state(0);
	let isHovering = $state(false);
	let isVisible = $state(false);

	onMount(() => {
		// Only show on desktop
		if (window.matchMedia('(pointer: fine)').matches) {
			isVisible = true;
			followerX = mouseX;
			followerY = mouseY;

			let animationId: number;

			function handleMouseMove(e: MouseEvent) {
				mouseX = e.clientX;
				mouseY = e.clientY;
			}

			// Smooth follower animation
			function animate() {
				followerX += (mouseX - followerX) * 0.1;
				followerY += (mouseY - followerY) * 0.1;
				animationId = requestAnimationFrame(animate);
			}
			animate();

			// Check for interactive elements
			function handleMouseOver(e: MouseEvent) {
				const target = e.target as HTMLElement;
				if (target.closest('a, button, .domain-card, .practice-grid > *')) {
					isHovering = true;
				} else {
					isHovering = false;
				}
			}

			window.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseover', handleMouseOver);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseover', handleMouseOver);
				cancelAnimationFrame(animationId);
			};
		}
	});
</script>

{#if isVisible}
	<div
		class="tech-cursor"
		class:hovering={isHovering}
		style:left={mouseX + 'px'}
		style:top={mouseY + 'px'}
		bind:this={cursorRef}
	>
		<div class="cursor-dot"></div>
		<div class="cursor-ring"></div>
	</div>
	<div
		class="cursor-follower"
		style:left={followerX + 'px'}
		style:top={followerY + 'px'}
		bind:this={followerRef}
	></div>
{/if}

<style>
	.tech-cursor {
		position: fixed;
		width: 20px;
		height: 20px;
		pointer-events: none;
		z-index: 9999;
		transform: translate(-50%, -50%);
		transition: transform 0.2s ease;
		mix-blend-mode: difference;
	}

	.cursor-dot {
		width: 6px;
		height: 6px;
		background: var(--highlight);
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transition: transform 0.2s ease;
	}

	.cursor-ring {
		width: 20px;
		height: 20px;
		border: 2px solid var(--highlight);
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transition: all 0.3s ease;
		opacity: 0.6;
	}

	.tech-cursor.hovering .cursor-dot {
		transform: translate(-50%, -50%) scale(1.5);
		background: var(--text-primary);
	}

	.tech-cursor.hovering .cursor-ring {
		transform: translate(-50%, -50%) scale(1.8);
		border-color: var(--text-primary);
		opacity: 0.8;
	}

	.cursor-follower {
		position: fixed;
		width: 40px;
		height: 40px;
		border: 1px solid var(--highlight);
		border-radius: 50%;
		pointer-events: none;
		z-index: 9998;
		transform: translate(-50%, -50%);
		opacity: 0.3;
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.tech-cursor,
		.cursor-follower {
			display: none;
		}
	}

	@media (pointer: coarse) {
		.tech-cursor,
		.cursor-follower {
			display: none;
		}
	}
</style>

