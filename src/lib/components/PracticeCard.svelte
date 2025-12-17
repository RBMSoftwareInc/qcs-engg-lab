<script lang="ts">
	import { onMount } from 'svelte';

	let {
		title,
		description,
		slug,
		order,
		image,
		fullContent,
		html,
		onView
	} = $props<{
		title: string;
		description?: string;
		slug: string;
		order?: number;
		image?: string;
		fullContent?: string;
		html?: string;
		onView?: () => void;
	}>();

	let cardRef: HTMLElement;
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
			{ threshold: 0.1 }
		);

		if (cardRef) {
			observer.observe(cardRef);
		}

		return () => observer.disconnect();
	});

	function handleClick(e: MouseEvent) {
		e.preventDefault();
		onView?.();
	}
</script>

<article
	class="practice-card"
	class:visible={isVisible}
	bind:this={cardRef}
	style:--delay={order ? `${order * 0.1}s` : '0s'}
	onclick={handleClick}
>
	<div class="card-image-wrapper">
		{#if image}
			<img src={image} alt={title} loading="lazy" decoding="async" />
		{:else}
			<div class="image-placeholder">
				<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="10" y="10" width="60" height="60" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" fill="none" opacity="0.3" />
					<circle cx="40" cy="40" r="15" fill="currentColor" opacity="0.2" />
					<path d="M25 25L55 55M55 25L25 55" stroke="currentColor" stroke-width="1.5" opacity="0.3" />
				</svg>
				<span class="placeholder-text">Image Placeholder</span>
			</div>
		{/if}
		<div class="image-overlay">
			<span class="view-hint">View Details</span>
		</div>
	</div>
	<div class="card-content">
		<h3 class="card-title">{title}</h3>
		{#if description}
			<p class="card-description">{description}</p>
		{/if}
		<div class="card-footer">
			<span class="view-link">Learn More →</span>
		</div>
	</div>
	<div class="card-hover-effect"></div>
</article>

<style>
	.practice-card {
		display: flex;
		flex-direction: column;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
		transform: translateY(20px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		cursor: pointer;
		position: relative;
		height: 100%;
	}

	.practice-card.visible {
		opacity: 1;
		transform: translateY(0);
		transition: opacity 0.6s ease var(--delay, 0s), transform 0.6s ease var(--delay, 0s),
			all 0.3s ease;
	}

	.practice-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
		border-color: var(--highlight);
	}

	.card-image-wrapper {
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.card-image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform 0.5s ease;
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		backdrop-filter: blur(2px);
	}

	.practice-card:hover .image-overlay {
		opacity: 1;
	}

	.practice-card:hover .card-image-wrapper img {
		transform: scale(1.1);
	}

	.view-hint {
		color: white;
		font-weight: 600;
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transform: translateY(10px);
		transition: transform 0.3s ease;
	}

	.practice-card:hover .view-hint {
		transform: translateY(0);
	}

	.image-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		height: 100%;
		color: var(--text-muted);
	}

	.image-placeholder svg {
		opacity: 0.4;
	}

	.placeholder-text {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.5;
	}

	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		gap: 1rem;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.card-description {
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
		font-size: 0.95rem;
		flex: 1;
	}

	.card-footer {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	.view-link {
		color: var(--text-primary);
		font-weight: 500;
		font-size: 0.95rem;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.practice-card:hover .view-link {
		color: var(--highlight);
		gap: 0.75rem;
	}

	.card-hover-effect {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--bg-accent);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		z-index: 0;
	}

	.practice-card:hover .card-hover-effect {
		opacity: 0.05;
	}

	@media (prefers-reduced-motion: reduce) {
		.practice-card {
			opacity: 1;
			transform: none;
		}

		.practice-card:hover {
			transform: none;
		}

		.card-details {
			transition: none;
		}
	}
</style>

