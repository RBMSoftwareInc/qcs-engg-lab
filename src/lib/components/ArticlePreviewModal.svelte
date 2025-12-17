<script lang="ts">
	import { onMount } from 'svelte';
	import MarkdownBlock from './MarkdownBlock.svelte';
	import SocialShare from './SocialShare.svelte';
	import TTSReader from './TTSReader.svelte';

	let { open = $bindable(false), article } = $props<{
		open?: boolean;
		article: {
			slug: string;
			metadata: any;
			html: string;
			content: string;
		} | null;
	}>();

	let prefersReducedMotion = $state(false);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && article}
	<div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true">
		<div class="modal-content">
			<button class="modal-close" onclick={() => (open = false)} aria-label="Close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>

			<div class="article-header">
				<div class="article-meta-top">
					{#if article.metadata.category}
						<span class="article-category">{article.metadata.category}</span>
					{/if}
					{#if article.metadata.date}
						<time class="article-date" datetime={article.metadata.date}>
							{new Date(article.metadata.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</time>
					{/if}
				</div>
				<h1 class="article-title">{article.metadata.title}</h1>
				{#if article.metadata.description}
					<p class="article-description">{article.metadata.description}</p>
				{/if}
				<div class="article-actions">
					<TTSReader text={article.content} />
					<SocialShare
						url={typeof window !== 'undefined' ? window.location.href : ''}
						title={article.metadata.title}
						description={article.metadata.description}
					/>
				</div>
			</div>

			<div class="article-body">
				<MarkdownBlock html={article.html} />
			</div>

			<div class="article-footer">
				<a href="/insights/{article.slug}" class="read-full-btn">Read Full Article →</a>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(31, 41, 55, 0.7);
		backdrop-filter: blur(12px) saturate(180%);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		overflow-y: auto;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: var(--bg-primary);
		border-radius: 16px;
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
		margin: auto;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-close {
		position: sticky;
		top: 1rem;
		float: right;
		background: var(--bg-primary);
		border: 2px solid var(--border-subtle);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		cursor: pointer;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		margin: 1rem;
		z-index: 10;
	}

	.modal-close:hover {
		background: var(--bg-secondary);
		border-color: var(--highlight);
		transform: rotate(90deg);
	}

	.article-header {
		padding: 3rem 3rem 2rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.article-meta-top {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.article-category {
		padding: 0.4rem 0.9rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.article-date {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.article-title {
		font-size: 2.5rem;
		font-weight: 600;
		line-height: 1.2;
		margin-bottom: 1rem;
		letter-spacing: -0.03em;
	}

	.article-description {
		font-size: 1.25rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.article-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.article-body {
		padding: 3rem;
	}

	.article-footer {
		padding: 2rem 3rem;
		border-top: 1px solid var(--border-subtle);
		text-align: center;
	}

	.read-full-btn {
		display: inline-block;
		padding: 1rem 2.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.3s ease;
		border: none;
	}

	.read-full-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(31, 41, 55, 0.2);
	}

	@media (max-width: 640px) {
		.modal-content {
			max-height: 95vh;
			border-radius: 0;
		}

		.article-header,
		.article-body,
		.article-footer {
			padding: 2rem 1.5rem;
		}

		.article-title {
			font-size: 1.75rem;
		}
	}
</style>

