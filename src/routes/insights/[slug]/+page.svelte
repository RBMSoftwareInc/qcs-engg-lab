<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SocialShare from '$lib/components/SocialShare.svelte';
	import TTSReader from '$lib/components/TTSReader.svelte';
	import TermTooltip from '$lib/components/TermTooltip.svelte';
	import NewsletterModal from '$lib/components/NewsletterModal.svelte';
	import { loadContentBySlug } from '$lib/content/loader';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let slug = $derived($page.params.slug || '');
	let content = $derived(loadContentBySlug(slug));
	let highlightedWord = $state('');
	let highlightedIndex = $state(-1);
	let showNewsletter = $state(false);

	onMount(() => {
		// Add term tooltips after content is rendered
		setTimeout(() => {
			const terms = [
				'architecture',
				'infrastructure',
				'scalability',
				'observability',
				'distributed',
				'data analytics',
				'automation',
				'cloud architecture',
				'intelligence',
				'platform engineering',
				'systems',
				'analytics',
				'visualization'
			];

			const contentEl = document.querySelector('.article-body');
			if (!contentEl) return;

			terms.forEach((term) => {
				const regex = new RegExp(`\\b(${term})\\b`, 'gi');
				const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT);
				const textNodes: Text[] = [];

				let node: Node | null;
				while ((node = walker.nextNode())) {
					if (node.nodeType === Node.TEXT_NODE && node.textContent) {
						textNodes.push(node as Text);
					}
				}

				textNodes.forEach((textNode) => {
					const text = textNode.textContent || '';
					if (regex.test(text)) {
						const parent = textNode.parentElement;
						if (parent && !parent.classList.contains('term-highlight')) {
							const newHTML = text.replace(
								regex,
								`<span class="term-highlight" data-term="${term}" title="Click for definition">$1</span>`
							);
							const wrapper = document.createElement('span');
							wrapper.innerHTML = newHTML;
							textNode.replaceWith(...Array.from(wrapper.childNodes));
						}
					}
				});
			});

			// Add click handlers for term highlights
			document.querySelectorAll('.term-highlight').forEach((el) => {
				el.addEventListener('click', (e) => {
					e.preventDefault();
					const term = el.getAttribute('data-term');
					if (term) {
						// Show tooltip - could integrate TermTooltip component here
						alert(`Term: ${term}\n\nDefinition would appear here.`);
					}
				});
			});
		}, 300);
	});

	let highlightedElements: HTMLElement[] = [];

	function handleWordHighlight(word: string, index: number) {
		highlightedWord = word;
		highlightedIndex = index;

		// Remove previous highlights
		highlightedElements.forEach((el) => el.classList.remove('word-highlighted'));
		highlightedElements = [];

		// Find and highlight current word
		const textNodes = document.querySelectorAll('.reading-content p, .reading-content li');
		let wordCount = 0;

		textNodes.forEach((node) => {
			const text = node.textContent || '';
			const words = text.split(/\s+/);
			if (wordCount <= index && index < wordCount + words.length) {
				const wordIndex = index - wordCount;
				if (words[wordIndex]?.toLowerCase() === word.toLowerCase()) {
					// Create highlight
					const range = document.createRange();
					const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
					let currentWordIndex = 0;
					let textNode: Node | null = null;

					while ((textNode = walker.nextNode())) {
						const nodeText = textNode.textContent || '';
						const nodeWords = nodeText.split(/\s+/);
						if (currentWordIndex <= wordIndex && wordIndex < currentWordIndex + nodeWords.length) {
							const localIndex = wordIndex - currentWordIndex;
							let charIndex = 0;
							for (let i = 0; i < localIndex; i++) {
								charIndex += nodeWords[i].length + 1; // +1 for space
							}
							range.setStart(textNode, charIndex);
							range.setEnd(textNode, charIndex + nodeWords[localIndex].length);
							const span = document.createElement('span');
							span.className = 'word-highlighted';
							span.textContent = word;
							try {
								range.surroundContents(span);
								highlightedElements.push(span);
								span.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
							} catch (e) {
								// Fallback if range manipulation fails
							}
							break;
						}
						currentWordIndex += nodeWords.length;
					}
				}
			}
			wordCount += words.length;
		});
	}
</script>

<svelte:head>
	<title>{content?.metadata.title || 'Insight'} | QuantumCore Solutions</title>
	<meta name="description" content={content?.metadata.description || ''} />
</svelte:head>

<Section>
	{#if content}
		<Reveal>
			<a href="/insights" class="back-link">← Insights</a>
		</Reveal>

		<div class="article-header">
			<div class="article-meta">
				{#if content.metadata.category}
					<span class="article-category">{content.metadata.category}</span>
				{/if}
				{#if content.metadata.type}
					<span class="article-type">{content.metadata.type === 'technical' ? 'Technical' : 'Business'}</span>
				{/if}
				{#if content.metadata.date}
					<time class="article-date" datetime={content.metadata.date}>
						{new Date(content.metadata.date).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</time>
				{/if}
				{#if content.metadata.readTime}
					<span class="article-read-time">{content.metadata.readTime} min read</span>
				{/if}
			</div>

			<Reveal delay={0.1}>
				<h1 class="article-title">{content.metadata.title}</h1>
			</Reveal>

			{#if content.metadata.description}
				<Reveal delay={0.15}>
					<p class="article-description">{content.metadata.description}</p>
				</Reveal>
			{/if}

			<Reveal delay={0.2}>
				<div class="article-actions">
					<TTSReader text={content.content} onWordHighlight={handleWordHighlight} />
					<SocialShare
						url={typeof window !== 'undefined' ? window.location.href : ''}
						title={content.metadata.title}
						description={content.metadata.description}
					/>
					<button class="newsletter-btn-small" onclick={() => (showNewsletter = true)}>
						Subscribe
					</button>
				</div>
			</Reveal>
		</div>

		<Reveal delay={0.3}>
			<div class="reading-content" class:highlighting={highlightedWord !== ''}>
				<MarkdownBlock html={content.html} class="article-body" />
			</div>
		</Reveal>
	{:else}
		<Reveal>
			<h1>Article Not Found</h1>
			<p>The requested article could not be found.</p>
			<a href="/insights">Return to Insights</a>
		</Reveal>
	{/if}
</Section>

<NewsletterModal bind:open={showNewsletter} />

<style>
	.back-link {
		display: inline-block;
		margin-bottom: 2rem;
		color: var(--text-secondary);
		text-decoration: none;
		border: none;
		font-size: 0.95rem;
		transition: color 0.2s ease;
		font-weight: 500;
	}

	.back-link:hover {
		color: var(--text-primary);
		border: none;
	}

	.article-header {
		margin-bottom: 4rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.article-meta {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		align-items: center;
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

	.article-type {
		padding: 0.4rem 0.9rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--bg-accent);
		color: var(--text-primary);
	}

	.article-date {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.article-read-time {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.article-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 600;
		line-height: 1.2;
		margin-bottom: 1.5rem;
		letter-spacing: -0.03em;
	}

	.article-description {
		font-size: 1.4rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 800px;
	}

	.article-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.newsletter-btn-small {
		padding: 0.65rem 1.25rem;
		background: var(--bg-secondary);
		border: 2px solid var(--border-subtle);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.newsletter-btn-small:hover {
		background: var(--bg-accent);
		border-color: var(--highlight);
		transform: translateY(-2px);
	}

	.reading-content {
		position: relative;
	}

	.reading-content :global(.term-highlight) {
		color: var(--highlight);
		cursor: help;
		border-bottom: 2px dotted var(--highlight);
		position: relative;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.reading-content :global(.term-highlight:hover) {
		background: rgba(244, 196, 48, 0.15);
		border-bottom-color: var(--text-primary);
	}

	.reading-content :global(.word-highlighted) {
		background: rgba(244, 196, 48, 0.4);
		border-radius: 3px;
		padding: 0 2px;
		transition: background 0.2s ease;
		box-shadow: 0 0 0 2px rgba(244, 196, 48, 0.2);
	}

	.reading-content.highlighting {
		position: relative;
	}
</style>

