<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';
	import { loadContentBySlug } from '$lib/content/loader';
	import { page } from '$app/stores';

	let slug = $derived($page.params.slug || '');
	let content = $derived(loadContentBySlug(slug));

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

<svelte:head>
	<title>{content?.metadata.title || 'Service'} | QuantumCore Solutions</title>
	<meta name="description" content={content?.metadata.description || ''} />
</svelte:head>

<Section>
	{#if content}
		<Reveal>
			<a href="/services" class="back-link">← Services</a>
		</Reveal>

		<div class="service-header">
			<div class="service-header-content">
				<div class="service-icon-large">
					<ServiceIcon type={getIconType(content.metadata.icon)} />
				</div>

				<Reveal delay={0.1}>
					<h1 class="service-title">{content.metadata.title}</h1>
				</Reveal>

				{#if content.metadata.description}
					<Reveal delay={0.15}>
						<p class="service-description">{content.metadata.description}</p>
					</Reveal>
				{/if}
			</div>
		</div>

		{#if content.metadata.benefits && content.metadata.benefits.length > 0}
			<Reveal delay={0.2}>
				<div class="benefits-section">
					<h2>Key Benefits</h2>
					<div class="benefits-grid">
						{#each content.metadata.benefits as benefit}
							<div class="benefit-card">
								<h3 class="benefit-title">{benefit.title}</h3>
								<p class="benefit-description">{benefit.description}</p>
							</div>
						{/each}
					</div>
				</div>
			</Reveal>
		{/if}

		<Reveal delay={0.3}>
			<div class="service-body">
				<MarkdownBlock html={content.html} />
			</div>
		</Reveal>

		<Reveal delay={0.4}>
			<div class="service-cta">
				<h2>Interested in This Service?</h2>
				<p>Let's discuss how we can help transform your systems.</p>
				<a href="/" class="cta-button" onclick={(e) => { e.preventDefault(); document.querySelector('.nav-initiate')?.click(); }}>
					Initiate Conversation
				</a>
			</div>
		</Reveal>
	{:else}
		<Reveal>
			<h1>Service Not Found</h1>
			<p>The requested service could not be found.</p>
			<a href="/services">Return to Services</a>
		</Reveal>
	{/if}
</Section>

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

	.service-header {
		margin-bottom: 4rem;
	}

	.service-header-content {
		position: relative;
	}

	.service-icon-large {
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

	.service-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 600;
		line-height: 1.2;
		margin-bottom: 1.5rem;
		letter-spacing: -0.03em;
		max-width: 90%;
	}

	.service-description {
		font-size: 1.4rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 800px;
	}

	.benefits-section {
		margin: 4rem 0;
		padding: 3rem;
		background: var(--bg-secondary);
		border-radius: 16px;
	}

	.benefits-section h2 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 2rem;
		text-align: center;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.benefits-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.benefits-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.benefit-card {
		background: var(--bg-primary);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border-subtle);
		transition: all 0.3s ease;
	}

	.benefit-card:hover {
		border-color: var(--highlight);
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.benefit-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
	}

	.benefit-description {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin: 0;
	}

	.service-body {
		max-width: 800px;
		margin: 0 auto 4rem;
	}

	.service-cta {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bg-secondary);
		border-radius: 16px;
		margin-top: 4rem;
	}

	.service-cta h2 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.service-cta p {
		font-size: 1.2rem;
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.cta-button {
		display: inline-block;
		padding: 1rem 2.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 10px;
		font-size: 1.1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	@media (max-width: 640px) {
		.service-icon-large {
			position: relative;
			top: 0;
			right: 0;
			margin-bottom: 2rem;
		}

		.service-title {
			max-width: 100%;
		}

		.benefits-section {
			padding: 2rem 1.5rem;
		}
	}
</style>

