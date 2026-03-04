<script lang="ts">
	import { onMount, tick } from 'svelte';

	/** Antigravity-style blobs that drift subtly with mouse. Always rendered; animation only when !prefers-reduced-motion. */
	let containerRef: HTMLElement;
	let mouseX = 0.5;
	let mouseY = 0.5;
	let prefersReducedMotion = $state(false);

	const blobCount = 5;
	const blobs = Array.from({ length: blobCount }, (_, i) => ({
		baseX: 0.2 + (i * 0.15) + Math.sin(i) * 0.1,
		baseY: 0.3 + (i * 0.12) + Math.cos(i * 1.3) * 0.1,
		x: 0.5,
		y: 0.5,
		radius: 42 + i * 16,
		opacity: 0.12 + (i % 3) * 0.05,
		influence: 0.12 + (i % 3) * 0.05,
		lerp: 0.92 - i * 0.02
	}));

	let rafId = 0;

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const el = containerRef;
		if (!el) return;

		function onMove(e: MouseEvent) {
			const rect = el.getBoundingClientRect();
			const w = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 1);
			const h = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 1);
			mouseX = (e.clientX - rect.left) / w;
			mouseY = (e.clientY - rect.top) / h;
		}

		function runLoop() {
			const blobEls = el.querySelectorAll<HTMLElement>('.blob');
			for (let i = 0; i < blobs.length; i++) {
				const b = blobs[i];
				const targetX = prefersReducedMotion ? b.baseX : b.baseX + (mouseX - 0.5) * b.influence;
				const targetY = prefersReducedMotion ? b.baseY : b.baseY + (mouseY - 0.5) * b.influence;
				b.x = b.x * b.lerp + targetX * (1 - b.lerp);
				b.y = b.y * b.lerp + targetY * (1 - b.lerp);
				const node = blobEls[i];
				if (node) {
					node.style.left = b.x * 100 + '%';
					node.style.top = b.y * 100 + '%';
				}
			}
			rafId = requestAnimationFrame(runLoop);
		}

		el.addEventListener('mousemove', onMove, { passive: true });
		tick().then(() => {
			rafId = requestAnimationFrame(runLoop);
		});
		return () => {
			el.removeEventListener('mousemove', onMove);
			cancelAnimationFrame(rafId);
		};
	});
</script>

<div class="studio-antigravity" aria-hidden="true" bind:this={containerRef}>
	{#each blobs as b}
		<div
			class="blob"
			style:left={b.x * 100 + '%'}
			style:top={b.y * 100 + '%'}
			style:width={b.radius * 2 + 'vmax'}
			style:height={b.radius * 2 + 'vmax'}
			style:marginLeft={-b.radius + 'vmax'}
			style:marginTop={-b.radius + 'vmax'}
			style:opacity={b.opacity}
		></div>
	{/each}
</div>

<style>
	.studio-antigravity {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
		overflow: hidden;
		contain: layout style paint;
	}

	.blob {
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 50%;
		background: radial-gradient(
			circle at center,
			rgba(244, 196, 48, 0.4) 0%,
			rgba(255, 230, 150, 0.22) 45%,
			rgba(255, 246, 219, 0.1) 75%,
			transparent 100%
		);
		filter: blur(52px);
		will-change: left, top;
		transition: none;
	}
</style>
