<script lang="ts">
	let { title = '', subtitle = '', tagline = '', image = '', ctaText = '', ctaLink = '' } = $props<{
		title?: string;
		subtitle?: string;
		tagline?: string;
		image?: string;
		ctaText?: string;
		ctaLink?: string;
	}>();
	const img = image || '/assets/images/shared/hero-engg.svg';
</script>

<section class="block-hero">
	<div class="block-hero-bg">
		<img src={img} alt="" />
	</div>
	<div class="block-hero-inner">
		<h1 class="block-hero-title">{title || 'Headline'}</h1>
		{#if subtitle}<p class="block-hero-subtitle">{subtitle}</p>{/if}
		{#if tagline}<p class="block-hero-tagline">{tagline}</p>{/if}
		{#if ctaText && ctaLink}
			<a class="block-hero-cta" href={ctaLink}>{ctaText}</a>
		{/if}
	</div>
</section>

<style>
	.block-hero {
		position: relative;
		min-height: 50vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		overflow: hidden;
	}
	.block-hero-bg {
		position: absolute;
		inset: 0;
		opacity: 0.15;
	}
	.block-hero-bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.block-hero-inner {
		position: relative;
		text-align: center;
		max-width: 800px;
	}
	.block-hero-title {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 600;
		margin: 0 0 1rem;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}
	.block-hero-subtitle {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin: 0 0 0.5rem;
	}
	.block-hero-tagline {
		font-size: 1rem;
		color: var(--text-muted);
		margin: 0 0 2rem;
	}
	.block-hero-cta {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		text-decoration: none;
		font-weight: 600;
		border-radius: 8px;
		transition: opacity 0.2s;
	}
	.block-hero-cta:hover {
		opacity: 0.9;
	}
</style>
