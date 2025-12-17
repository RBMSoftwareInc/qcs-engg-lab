<script lang="ts">
	import { onMount } from 'svelte';

	let { title, description, slug, order, image } = $props<{
		title: string;
		description?: string;
		slug: string;
		order?: number;
		image?: string;
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
</script>

<a
	href="/practice/{slug}"
	class="domain-card"
	class:visible={isVisible}
	bind:this={cardRef}
	style:--delay={order ? `${order * 0.1}s` : '0s'}
>
	{#if image}
		<div class="card-image">
			<img src={image} alt={title} loading="lazy" decoding="async" />
		</div>
	{/if}
	<div class="card-content">
		<h3 class="card-title">{title}</h3>
		{#if description}
			<p class="card-description">{description}</p>
		{/if}
	</div>
	<div class="card-hover-effect"></div>
</a>

<style>
	.domain-card {
		display: block;
		position: relative;
		padding: 3rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		text-decoration: none;
		color: var(--text-primary);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
		transform: translateY(20px);
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.domain-card.visible {
		opacity: 1;
		transform: translateY(0);
		transition: opacity 0.6s ease var(--delay, 0s), transform 0.6s ease var(--delay, 0s),
			transform 0.3s ease, box-shadow 0.3s ease;
	}

	.domain-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
		border-color: var(--highlight);
		background: var(--bg-primary);
	}

	.card-image {
		position: relative;
		width: 100%;
		height: 140px;
		margin-bottom: 2rem;
		opacity: 0.7;
		transition: all 0.4s ease;
		overflow: hidden;
		border-radius: 4px;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: center;
	}

	.domain-card:hover .card-image {
		opacity: 1;
		transform: scale(1.02);
	}

	.card-content {
		position: relative;
		z-index: 1;
	}

	.card-title {
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: 1rem;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	.card-description {
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
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

	.domain-card:hover .card-hover-effect {
		opacity: 0.1;
	}

	@media (prefers-reduced-motion: reduce) {
		.domain-card {
			opacity: 1;
			transform: none;
		}

		.domain-card:hover {
			transform: none;
		}
	}
</style>

