<script lang="ts">
	import { onMount } from 'svelte';
	import ServiceIcon from './ServiceIcon.svelte';

	let { service, onViewMore } = $props<{
		service: {
			slug: string;
			metadata: any;
		};
		onViewMore?: (slug: string) => void;
	}>();

	let cardRef: HTMLElement;
	let isVisible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					isVisible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (cardRef) {
			observer.observe(cardRef);
		}

		return () => observer.disconnect();
	});

	function getIconType(icon?: string): 'architecture' | 'development' | 'team' | 'optimization' | 'consulting' {
		if (!icon) return 'architecture';
		const iconMap: Record<string, 'architecture' | 'development' | 'team' | 'optimization' | 'consulting'> = {
			architecture: 'architecture',
			development: 'development',
			team: 'team',
			optimization: 'optimization',
			consulting: 'consulting'
		};
		return iconMap[icon] || 'architecture';
	}
</script>

<article
	class="service-card"
	class:visible={isVisible}
	bind:this={cardRef}
>
	<div class="service-header">
		<div class="service-icon-wrapper">
			<ServiceIcon type={getIconType(service.metadata.icon)} />
		</div>
		<h3 class="service-title">{service.metadata.title}</h3>
	</div>

	<p class="service-description">{service.metadata.description}</p>

	{#if service.metadata.features && service.metadata.features.length > 0}
		<ul class="service-features">
			{#each service.metadata.features.slice(0, 3) as feature}
				<li>{feature}</li>
			{/each}
		</ul>
	{/if}

	<button class="service-view-more" onclick={() => onViewMore?.(service.slug)}>
		View More →
	</button>
</article>

<style>
	.service-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 16px;
		padding: 2.5rem;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
		transform: translateY(20px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		position: relative;
		overflow: hidden;
	}

	.service-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--highlight);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.4s ease;
	}

	.service-card.visible {
		opacity: 1;
		transform: translateY(0);
		transition: opacity 0.6s ease, transform 0.6s ease, all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.service-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
		border-color: var(--highlight);
	}

	.service-card:hover::before {
		transform: scaleX(1);
	}

	.service-header {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.service-icon-wrapper {
		width: 64px;
		height: 64px;
		background: var(--bg-secondary);
		border: 2px solid var(--highlight);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s ease;
	}

	.service-card:hover .service-icon-wrapper {
		transform: scale(1.1) rotate(5deg);
		box-shadow: 0 4px 16px rgba(244, 196, 48, 0.3);
	}

	.service-title {
		font-size: 1.75rem;
		font-weight: 600;
		line-height: 1.3;
		margin: 0;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.service-description {
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.service-features {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.service-features li {
		font-size: 0.95rem;
		color: var(--text-secondary);
		position: relative;
		padding-left: 1.5rem;
	}

	.service-features li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: var(--highlight);
		font-weight: 600;
	}

	.service-view-more {
		width: 100%;
		padding: 0.875rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.service-view-more:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(31, 41, 55, 0.2);
		background: var(--text-primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.service-card {
			opacity: 1;
			transform: none;
		}

		.service-card:hover {
			transform: none;
		}
	}
</style>

