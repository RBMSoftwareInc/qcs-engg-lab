<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let {
		strokeColor = 'rgba(31, 41, 55, 0.24)',
		starColor = 'rgba(31, 41, 55, 0.12)',
		highlightColor = 'rgba(244, 196, 48, 0.75)',
		highlightGlow = 'rgba(244, 196, 48, 0.2)',
		showStars = true
	} = $props<{
		strokeColor?: string;
		starColor?: string;
		highlightColor?: string;
		highlightGlow?: string;
		showStars?: boolean;
	}>();

	let canvasEl: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationId = 0;
	let hoveredIndex = -1;
	let highlightedIndex = -1; // stays yellow after click
	let stars: { x: number; y: number; r: number }[] = [];
	let objects: SceneObject[] = [];
	let prefersReducedMotion = false;

	interface SceneObject {
		type: string;
		x: number;
		y: number;
		s: number; // scale
		w: number; // hit width
		h: number; // hit height
	}

	// —— Background: full 5-point stars ——
	function drawStar(cx: number, cy: number, outerR: number, innerR: number, fill: string) {
		if (!ctx) return;
		ctx.beginPath();
		for (let i = 0; i < 10; i++) {
			const r = i % 2 === 0 ? outerR : innerR;
			const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
			const x = cx + Math.cos(a) * r;
			const y = cy + Math.sin(a) * r;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.strokeStyle = fill;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.fillStyle = fill;
		ctx.globalAlpha = 0.4;
		ctx.fill();
		ctx.globalAlpha = 1;
	}

	// —— Foreground objects (structures, animals, flowers) with architectural line detail ——
	function drawColumn(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (highlighted) {
			ctx.shadowColor = highlightGlow;
			ctx.shadowBlur = 12;
		}
		// Base
		ctx.strokeRect(-8, 20, 16, 4);
		// Shaft with fluting lines (architectural detail)
		ctx.strokeRect(-6, -18, 12, 38);
		ctx.beginPath();
		ctx.moveTo(-2, -18);
		ctx.lineTo(-2, 20);
		ctx.moveTo(2, -18);
		ctx.lineTo(2, 20);
		ctx.stroke();
		// Capital
		ctx.strokeRect(-10, -22, 20, 5);
		ctx.strokeRect(-8, -26, 16, 5);
		ctx.restore();
	}

	function drawBird(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		if (highlighted) { ctx.shadowColor = highlightGlow; ctx.shadowBlur = 12; }
		// Body curve
		ctx.beginPath();
		ctx.arc(0, 0, 12, 0, Math.PI * 2);
		ctx.stroke();
		// Wing (architectural curved lines)
		ctx.beginPath();
		ctx.moveTo(-8, -4);
		ctx.quadraticCurveTo(-18, -12, -14, 2);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(8, -4);
		ctx.quadraticCurveTo(18, -12, 14, 2);
		ctx.stroke();
		// Beak & eye detail
		ctx.beginPath();
		ctx.moveTo(10, 0);
		ctx.lineTo(16, -2);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(4, -2, 1.5, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
	}

	function drawFlower(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		if (highlighted) { ctx.shadowColor = highlightGlow; ctx.shadowBlur = 12; }
		// Stem
		ctx.beginPath();
		ctx.moveTo(0, 24);
		ctx.lineTo(0, 8);
		ctx.stroke();
		// Leaves
		ctx.beginPath();
		ctx.moveTo(0, 16);
		ctx.quadraticCurveTo(-6, 14, -2, 20);
		ctx.moveTo(0, 10);
		ctx.quadraticCurveTo(8, 8, 4, 16);
		ctx.stroke();
		// Petals (architectural radial)
		for (let i = 0; i < 6; i++) {
			const a = (i / 6) * Math.PI * 2;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.arc(0, 0, 4, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
	}

	function drawVase(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		if (highlighted) { ctx.shadowColor = highlightGlow; ctx.shadowBlur = 12; }
		// Symmetric vase profile
		ctx.beginPath();
		ctx.moveTo(-6, 14);
		ctx.lineTo(-8, 4);
		ctx.lineTo(-6, -8);
		ctx.lineTo(0, -14);
		ctx.lineTo(6, -8);
		ctx.lineTo(8, 4);
		ctx.lineTo(6, 14);
		ctx.stroke();
		// Neck
		ctx.strokeRect(-3, -18, 6, 5);
		// Decorative band (architectural detail)
		ctx.beginPath();
		ctx.moveTo(-5, 2);
		ctx.lineTo(5, 2);
		ctx.moveTo(-4, -4);
		ctx.lineTo(4, -4);
		ctx.stroke();
		ctx.restore();
	}

	function drawArch(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		if (highlighted) { ctx.shadowColor = highlightGlow; ctx.shadowBlur = 12; }
		// Arch
		ctx.beginPath();
		ctx.arc(0, 0, 18, Math.PI * 0.5, Math.PI * 0.5 + Math.PI);
		ctx.stroke();
		// Piers
		ctx.strokeRect(-18, 0, 6, 20);
		ctx.strokeRect(12, 0, 6, 20);
		// Keystone
		ctx.beginPath();
		ctx.moveTo(0, -16);
		ctx.lineTo(0, -8);
		ctx.stroke();
		ctx.restore();
	}

	function drawTree(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		if (highlighted) { ctx.shadowColor = highlightGlow; ctx.shadowBlur = 12; }
		// Trunk
		ctx.strokeRect(-4, 8, 8, 20);
		ctx.beginPath();
		ctx.moveTo(0, 8);
		ctx.lineTo(-12, -8);
		ctx.lineTo(0, -4);
		ctx.lineTo(12, -8);
		ctx.closePath();
		ctx.stroke();
		// Foliage tiers
		ctx.beginPath();
		ctx.moveTo(-8, -2);
		ctx.lineTo(8, -2);
		ctx.stroke();
		ctx.restore();
	}

	function drawLamp(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		if (highlighted) { ctx.shadowColor = highlightGlow; ctx.shadowBlur = 12; }
		// Post
		ctx.strokeRect(-2, -20, 4, 36);
		ctx.beginPath();
		ctx.moveTo(0, -20);
		ctx.lineTo(-8, -24);
		ctx.lineTo(0, -22);
		ctx.lineTo(8, -24);
		ctx.closePath();
		ctx.stroke();
		// Base
		ctx.strokeRect(-6, 14, 12, 4);
		ctx.restore();
	}

	function drawStructure(obj: SceneObject, highlighted: boolean) {
		if (!ctx) return;
		const { x, y, s } = obj;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.strokeStyle = highlighted ? highlightColor : strokeColor;
		ctx.lineWidth = highlighted ? 2 : 1.2;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (highlighted) { ctx.shadowColor = highlightGlow; ctx.shadowBlur = 12; }
		// Roof (gable)
		ctx.beginPath();
		ctx.moveTo(-14, 4);
		ctx.lineTo(0, -10);
		ctx.lineTo(14, 4);
		ctx.stroke();
		// Facade
		ctx.strokeRect(-12, 4, 24, 20);
		// Door
		ctx.strokeRect(-4, 10, 8, 14);
		ctx.beginPath();
		ctx.moveTo(0, 10);
		ctx.lineTo(0, 24);
		ctx.stroke();
		// Window
		ctx.strokeRect(4, 6, 6, 5);
		ctx.restore();
	}

	const drawers: Record<string, (o: SceneObject, h: boolean) => void> = {
		column: drawColumn,
		bird: drawBird,
		flower: drawFlower,
		vase: drawVase,
		arch: drawArch,
		tree: drawTree,
		lamp: drawLamp,
		structure: drawStructure
	};

	function initScene(w: number, h: number) {
		// Background stars (full 5-point) – optional
		stars = [];
		if (showStars) {
			const rng = (seed: number) => {
				const x = Math.sin(seed * 12.9898) * 43758.5453;
				return x - Math.floor(x);
			};
			for (let i = 0; i < 28; i++) {
				stars.push({
					x: rng(i) * w,
					y: rng(i + 100) * h,
					r: 4 + rng(i + 200) * 8
				});
			}
		}
		// Foreground objects: structures, animals, flowers, general with architectural detail
		objects = [
			{ type: 'column', x: w * 0.12, y: h * 0.28, s: 1.1, w: 36, h: 55 },
			{ type: 'bird', x: w * 0.82, y: h * 0.22, s: 1, w: 40, h: 28 },
			{ type: 'flower', x: w * 0.18, y: h * 0.72, s: 1.2, w: 32, h: 50 },
			{ type: 'vase', x: w * 0.88, y: h * 0.65, s: 1, w: 28, h: 45 },
			{ type: 'arch', x: w * 0.5, y: h * 0.38, s: 1, w: 50, h: 45 },
			{ type: 'tree', x: w * 0.75, y: h * 0.78, s: 1, w: 35, h: 45 },
			{ type: 'lamp', x: w * 0.28, y: h * 0.5, s: 0.9, w: 24, h: 50 },
			{ type: 'structure', x: w * 0.92, y: h * 0.48, s: 0.85, w: 42, h: 40 }
		];
	}

	function hitTest(x: number, y: number): number {
		for (let i = 0; i < objects.length; i++) {
			const o = objects[i];
			const hw = o.w / 2;
			const hh = o.h / 2;
			if (x >= o.x - hw && x <= o.x + hw && y >= o.y - hh && y <= o.y + hh) return i;
		}
		return -1;
	}

	function tick() {
		if (!ctx || !canvasEl) return;
		const w = window.innerWidth;
		const h = window.innerHeight;
		ctx.clearRect(0, 0, w, h);

		// 1) Background: full stars (if enabled)
		if (showStars) {
			for (const star of stars) {
				drawStar(star.x, star.y, star.r, star.r * 0.4, starColor);
			}
		}

		// 2) Foreground: objects (highlight on click)
		for (let i = 0; i < objects.length; i++) {
			const obj = objects[i];
			const highlighted = i === highlightedIndex || i === hoveredIndex;
			const draw = drawers[obj.type];
			if (draw) draw(obj, highlighted);
		}
		ctx.shadowBlur = 0;

		animationId = requestAnimationFrame(tick);
	}

	function onMouseMove(e: MouseEvent) {
		if (prefersReducedMotion || !canvasEl) return;
		hoveredIndex = hitTest(e.clientX, e.clientY);
	}

	function onMouseLeave() {
		hoveredIndex = -1;
	}

	function onClick(e: MouseEvent) {
		if (prefersReducedMotion) return;
		const i = hitTest(e.clientX, e.clientY);
		if (i >= 0) {
			highlightedIndex = i; // keep highlighted (yellow) until another is clicked
		}
	}

	function resize() {
		if (!canvasEl || !ctx) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = window.innerWidth;
		const h = window.innerHeight;
		canvasEl.width = w * dpr;
		canvasEl.height = h * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		canvasEl.style.width = w + 'px';
		canvasEl.style.height = h + 'px';
		initScene(w, h);
	}

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;
		ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		resize();
		animationId = requestAnimationFrame(tick);
		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('mouseleave', onMouseLeave);
		window.addEventListener('resize', resize);
		canvasEl.addEventListener('click', onClick);
	});

	onDestroy(() => {
		cancelAnimationFrame(animationId);
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseleave', onMouseLeave);
		window.removeEventListener('resize', resize);
		canvasEl?.removeEventListener('click', onClick);
	});
</script>

<canvas
	bind:this={canvasEl}
	class="neural-trail"
	aria-hidden="true"
></canvas>

<style>
	.neural-trail {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: auto;
		z-index: 0;
		cursor: default;
	}
</style>
