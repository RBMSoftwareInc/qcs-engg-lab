<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SignalIcon from '$lib/components/SignalIcon.svelte';
	import SocialShare from '$lib/components/SocialShare.svelte';
	import TTSReader from '$lib/components/TTSReader.svelte';
	import NewsletterModal from '$lib/components/NewsletterModal.svelte';
	import { loadContentBySlug } from '$lib/content/loader';
	import { page } from '$app/stores';

	let slug = $derived($page.params.slug || '');
	let content = $derived(loadContentBySlug(slug));
	let showNewsletter = $state(false);

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

<svelte:head>
	<title>{content?.metadata.title || 'Signal'} | QuantumCore Solutions</title>
	<meta name="description" content={content?.metadata.description || ''} />
</svelte:head>

<Section>
	{#if content}
		<Reveal>
			<a href="/signals" class="back-link">← Signals</a>
		</Reveal>

		<div class="signal-header">
			{#if content.metadata.image}
				<div class="signal-hero-image">
					<img src={content.metadata.image} alt={content.metadata.title} loading="eager" />
				</div>
			{/if}

			<div class="signal-header-content">
				<div class="signal-icon-large">
					<SignalIcon type={getIconType(content.metadata.icon)} />
				</div>

				<div class="signal-meta">
					{#if content.metadata.category}
						<span class="signal-category">{content.metadata.category}</span>
					{/if}
				</div>

				<Reveal delay={0.1}>
					<h1 class="signal-title">{content.metadata.title}</h1>
				</Reveal>

				{#if content.metadata.description}
					<Reveal delay={0.15}>
						<p class="signal-description">{content.metadata.description}</p>
					</Reveal>
				{/if}

				<Reveal delay={0.2}>
					<div class="signal-actions">
						<TTSReader text={content.content} />
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
		</div>

		<Reveal delay={0.3}>
			<div class="signal-body">
				<MarkdownBlock html={content.html} />
			</div>
		</Reveal>
	{:else}
		<Reveal>
			<h1>Signal Not Found</h1>
			<p>The requested signal could not be found.</p>
			<a href="/signals">Return to Signals</a>
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

	.signal-header {
		margin-bottom: 4rem;
	}

	.signal-hero-image {
		width: 100%;
		height: 400px;
		border-radius: 16px;
		overflow: hidden;
		margin-bottom: 3rem;
		background: var(--bg-secondary);
	}

	.signal-hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.signal-header-content {
		position: relative;
	}

	.signal-icon-large {
		position: absolute;
		top: -40px;
		right: 0;
		width: 80px;
		height: 80px;
		background: var(--bg-primary);
		border: 4px solid var(--highlight);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8px 24px rgba(244, 196, 48, 0.3);
		z-index: 10;
	}

	.signal-meta {
		margin-bottom: 1.5rem;
	}

	.signal-category {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.signal-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 600;
		line-height: 1.2;
		margin-bottom: 1.5rem;
		letter-spacing: -0.03em;
		max-width: 90%;
	}

	.signal-description {
		font-size: 1.4rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 800px;
	}

	.signal-actions {
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

	.signal-body {
		max-width: 800px;
		margin: 0 auto;
	}

	@media (max-width: 640px) {
		.signal-icon-large {
			position: relative;
			top: 0;
			right: 0;
			margin-bottom: 2rem;
		}

		.signal-title {
			max-width: 100%;
		}

		.signal-hero-image {
			height: 250px;
		}
	}
</style>

