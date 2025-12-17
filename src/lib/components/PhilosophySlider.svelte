<script lang="ts">
	import { onMount } from 'svelte';
	import PhilosophyIcon from './PhilosophyIcon.svelte';

	interface PhilosophyItem {
		id: string;
		icon: 'architecture' | 'systems' | 'research' | 'complexity' | 'longterm' | 'production';
		title: string;
		description: string;
		details: string;
		image?: string;
	}

	let { items } = $props<{
		items: PhilosophyItem[];
	}>();

	let currentIndex = $state(0);
	let isAutoPlaying = $state(true);
	let prefersReducedMotion = $state(false);
	let touchStartX = $state(0);
	let touchEndX = $state(0);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			isAutoPlaying = false;
		}

		let interval: ReturnType<typeof setInterval>;
		if (isAutoPlaying && !prefersReducedMotion) {
			interval = setInterval(() => {
				currentIndex = (currentIndex + 1) % items.length;
			}, 5000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});

	function goToSlide(index: number) {
		currentIndex = index;
		isAutoPlaying = false;
	}

	function nextSlide() {
		currentIndex = (currentIndex + 1) % items.length;
		isAutoPlaying = false;
	}

	function prevSlide() {
		currentIndex = (currentIndex - 1 + items.length) % items.length;
		isAutoPlaying = false;
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].clientX;
		handleSwipe();
	}

	function handleSwipe() {
		const swipeThreshold = 50;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {
				nextSlide();
			} else {
				prevSlide();
			}
		}
	}
</script>

<div
	class="philosophy-slider"
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	<div class="slider-container">
		{#each items as item, index}
			<div
				class="slide"
				class:active={index === currentIndex}
				style:--index={index}
				style:--current={currentIndex}
			>
				<div class="slide-content">
					<div class="slide-icon">
						<PhilosophyIcon type={item.icon} />
					</div>
					<h3 class="slide-title">{item.title}</h3>
					<p class="slide-description">{item.description}</p>
					<div class="slide-details">
						<p>{item.details}</p>
					</div>
					{#if item.image}
						<div class="slide-image">
							<img src={item.image} alt={item.title} loading="lazy" />
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="slider-controls">
		<button class="control-btn prev" onclick={prevSlide} aria-label="Previous">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>
		<div class="slider-dots">
			{#each items as _, index}
				<button
					class="dot"
					class:active={index === currentIndex}
					onclick={() => goToSlide(index)}
					aria-label="Go to slide {index + 1}"
				></button>
			{/each}
		</div>
		<button class="control-btn next" onclick={nextSlide} aria-label="Next">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 18l6-6-6-6" />
			</svg>
		</button>
	</div>
</div>

<style>
	.philosophy-slider {
		position: relative;
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
		overflow: hidden;
	}

	.slider-container {
		position: relative;
		width: 100%;
		height: 500px;
	}

	.slide {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transform: translateX(100%);
		transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}

	.slide.active {
		opacity: 1;
		transform: translateX(0);
		pointer-events: auto;
	}

	.slide-content {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		height: 100%;
		align-items: center;
		padding: 2rem;
		background: var(--bg-primary);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	@media (min-width: 768px) {
		.slide-content {
			grid-template-columns: 1fr 1fr;
			padding: 3rem;
		}
	}

	.slide-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: var(--bg-secondary);
		border-radius: 12px;
		margin-bottom: 1rem;
		transition: transform 0.3s ease;
	}

	.slide.active .slide-icon {
		animation: iconPulse 0.6s ease-out;
	}

	@keyframes iconPulse {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.slide-title {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.slide-description {
		font-size: 1.25rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.slide-details {
		font-size: 1rem;
		color: var(--text-primary);
		line-height: 1.7;
	}

	.slide-image {
		width: 100%;
		height: 100%;
		border-radius: 12px;
		overflow: hidden;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.slide-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.8;
	}

	.slider-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		margin-top: 2rem;
	}

	.control-btn {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 2px solid var(--border-subtle);
		background: var(--bg-primary);
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.control-btn:hover {
		border-color: var(--highlight);
		background: var(--bg-secondary);
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.control-btn:active {
		transform: scale(0.95);
	}

	.slider-dots {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: none;
		background: var(--border-subtle);
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0;
	}

	.dot.active {
		background: var(--highlight);
		width: 32px;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(244, 196, 48, 0.4);
	}

	.dot:hover {
		background: var(--text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.slide {
			transition: opacity 0.3s ease;
		}

		.slide.active {
			transform: none;
		}

		.slide-icon {
			animation: none;
		}
	}

	@media (max-width: 640px) {
		.slider-container {
			height: 600px;
		}

		.slide-content {
			padding: 1.5rem;
		}

		.slide-title {
			font-size: 1.5rem;
		}

		.slide-description {
			font-size: 1.1rem;
		}
	}
</style>

