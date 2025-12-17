<script lang="ts">
	import { onMount } from 'svelte';
	import SignalIcon from './SignalIcon.svelte';

	let { signal, onPreview } = $props<{
		signal: {
			slug: string;
			metadata: any;
		};
		onPreview?: (slug: string) => void;
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

	function getIconType(icon?: string): 'scale' | 'analytics' | 'cloud' | 'intelligence' {
		if (!icon) return 'scale';
		const iconMap: Record<string, 'scale' | 'analytics' | 'cloud' | 'intelligence'> = {
			scale: 'scale',
			analytics: 'analytics',
			cloud: 'cloud',
			intelligence: 'intelligence'
		};
		return iconMap[icon] || 'scale';
	}
</script>

<article
	class="signal-card"
	class:visible={isVisible}
	bind:this={cardRef}
	onclick={() => onPreview?.(signal.slug)}
>
	{#if signal.metadata.image}
		<div class="signal-image">
			<img src={signal.metadata.image} alt={signal.metadata.title} loading="lazy" />
			<div class="signal-overlay">
				<button class="preview-btn" aria-label="Preview signal">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<div class="signal-content">
		<div class="signal-icon-wrapper">
			<SignalIcon type={getIconType(signal.metadata.icon)} />
		</div>

		<div class="signal-header">
			{#if signal.metadata.category}
				<span class="signal-category">{signal.metadata.category}</span>
			{/if}
			<h3 class="signal-title">
				<a href="/signals/{signal.slug}" onclick={(e) => e.stopPropagation()}>
					{signal.metadata.title}
				</a>
			</h3>
		</div>

		{#if signal.metadata.description}
			<p class="signal-description">{signal.metadata.description}</p>
		{/if}

		<button class="signal-read-more" onclick={(e) => { e.stopPropagation(); onPreview?.(signal.slug); }}>
			Explore Signal →
		</button>
	</div>
</article>

<style>
	.signal-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 20px;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		opacity: 0;
		transform: translateY(20px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		position: relative;
	}

	.signal-card.visible {
		opacity: 1;
		transform: translateY(0);
		transition: opacity 0.6s ease, transform 0.6s ease, all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.signal-card:hover {
		transform: translateY(-12px);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
		border-color: var(--highlight);
	}

	.signal-image {
		position: relative;
		width: 100%;
		height: 240px;
		overflow: hidden;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-accent) 100%);
	}

	.signal-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.signal-card:hover .signal-image img {
		transform: scale(1.1);
	}

	.signal-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.signal-card:hover .signal-overlay {
		opacity: 1;
	}

	.preview-btn {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s ease;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.preview-btn:hover {
		transform: scale(1.15);
	}

	.signal-content {
		padding: 2.5rem;
		position: relative;
	}

	.signal-icon-wrapper {
		position: absolute;
		top: -32px;
		right: 2.5rem;
		width: 64px;
		height: 64px;
		background: var(--bg-primary);
		border: 3px solid var(--highlight);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px rgba(244, 196, 48, 0.3);
		transition: transform 0.3s ease;
	}

	.signal-card:hover .signal-icon-wrapper {
		transform: scale(1.1) rotate(5deg);
	}

	.signal-header {
		margin-bottom: 1rem;
	}

	.signal-category {
		display: inline-block;
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		margin-bottom: 1rem;
	}

	.signal-title {
		font-size: 1.75rem;
		font-weight: 600;
		line-height: 1.3;
		margin: 0 0 1rem 0;
		letter-spacing: -0.02em;
	}

	.signal-title a {
		color: var(--text-primary);
		text-decoration: none;
		border: none;
		transition: color 0.2s ease;
	}

	.signal-title a:hover {
		color: var(--highlight);
		border: none;
	}

	.signal-description {
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.signal-read-more {
		padding: 0.75rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		width: 100%;
	}

	.signal-read-more:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(31, 41, 55, 0.2);
		background: var(--text-primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.signal-card {
			opacity: 1;
			transform: none;
		}

		.signal-card:hover {
			transform: none;
		}
	}
</style>

