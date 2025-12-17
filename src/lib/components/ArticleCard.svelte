<script lang="ts">
	import { onMount } from 'svelte';

	interface ArticleMetadata {
		title: string;
		description?: string;
		date?: string;
		category?: 'article' | 'blog' | 'whitepaper';
		type?: 'technical' | 'business';
		image?: string;
		readTime?: number;
	}

	let { article, onPreview } = $props<{
		article: {
			slug: string;
			metadata: ArticleMetadata;
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

	function getCategoryColor(category?: string) {
		switch (category) {
			case 'article':
				return '#3B82F6';
			case 'blog':
				return '#10B981';
			case 'whitepaper':
				return '#8B5CF6';
			default:
				return 'var(--text-secondary)';
		}
	}

	function getTypeLabel(type?: string) {
		return type === 'technical' ? 'Technical' : type === 'business' ? 'Business' : '';
	}
</script>

<article
	class="article-card"
	class:visible={isVisible}
	bind:this={cardRef}
	onclick={() => onPreview?.(article.slug)}
>
	{#if article.metadata.image}
		<div class="article-image">
			<img src={article.metadata.image} alt={article.metadata.title} loading="lazy" />
			<div class="article-overlay">
				<button class="preview-btn" aria-label="Preview article">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<div class="article-content">
		<div class="article-meta">
			{#if article.metadata.category}
				<span
					class="article-category"
					style:background={getCategoryColor(article.metadata.category) + '15'}
					style:color={getCategoryColor(article.metadata.category)}
				>
					{article.metadata.category}
				</span>
			{/if}
			{#if article.metadata.type}
				<span class="article-type">{getTypeLabel(article.metadata.type)}</span>
			{/if}
		</div>

		<h2 class="article-title">
			<a href="/insights/{article.slug}" onclick={(e) => e.stopPropagation()}>
				{article.metadata.title}
			</a>
		</h2>

		{#if article.metadata.description}
			<p class="article-description">{article.metadata.description}</p>
		{/if}

		<div class="article-footer">
			{#if article.metadata.date}
				<time class="article-date" datetime={article.metadata.date}>
					{new Date(article.metadata.date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					})}
				</time>
			{/if}
			{#if article.metadata.readTime}
				<span class="article-read-time">{article.metadata.readTime} min read</span>
			{/if}
		</div>
	</div>
</article>

<style>
	.article-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		opacity: 0;
		transform: translateY(20px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.article-card.visible {
		opacity: 1;
		transform: translateY(0);
		transition: opacity 0.6s ease, transform 0.6s ease, all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.article-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
		border-color: var(--highlight);
	}

	.article-image {
		position: relative;
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: var(--bg-secondary);
	}

	.article-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.article-card:hover .article-image img {
		transform: scale(1.05);
	}

	.article-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.article-card:hover .article-overlay {
		opacity: 1;
	}

	.preview-btn {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s ease;
	}

	.preview-btn:hover {
		transform: scale(1.1);
	}

	.article-content {
		padding: 2rem;
	}

	.article-meta {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.article-category {
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.article-type {
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.article-title {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
		margin-bottom: 0.75rem;
		letter-spacing: -0.02em;
	}

	.article-title a {
		color: var(--text-primary);
		text-decoration: none;
		border: none;
		transition: color 0.2s ease;
	}

	.article-title a:hover {
		color: var(--highlight);
		border: none;
	}

	.article-description {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.article-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid var(--border-subtle);
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.article-date {
		font-family: 'JetBrains Mono', monospace;
	}

	.article-read-time {
		font-weight: 500;
	}

	@media (prefers-reduced-motion: reduce) {
		.article-card {
			opacity: 1;
			transform: none;
		}

		.article-card:hover {
			transform: none;
		}
	}
</style>

