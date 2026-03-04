<script lang="ts">
	let {
		heading = '',
		text = '',
		primaryText = '',
		primaryLink = '',
		secondaryText = '',
		secondaryLink = ''
	} = $props<{
		heading?: string;
		text?: string;
		primaryText?: string;
		primaryLink?: string;
		secondaryText?: string;
		secondaryLink?: string;
	}>();
</script>

<section class="block-cta">
	<div class="block-cta-inner">
		{#if heading}<h2 class="block-cta-heading">{heading}</h2>{/if}
		{#if text}<p class="block-cta-text">{text}</p>{/if}
		<div class="block-cta-buttons">
			{#if primaryText && primaryLink}
				<a class="block-cta-btn block-cta-primary" href={primaryLink}>{primaryText}</a>
			{/if}
			{#if secondaryText && secondaryLink}
				<a class="block-cta-btn block-cta-secondary" href={secondaryLink}>{secondaryText}</a>
			{/if}
		</div>
	</div>
</section>

<style>
	.block-cta {
		padding: 4rem 2rem;
		text-align: center;
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-subtle);
		border-bottom: 1px solid var(--border-subtle);
	}
	.block-cta-inner { max-width: 600px; margin: 0 auto; }
	.block-cta-heading { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.75rem; color: var(--text-primary); }
	.block-cta-text { color: var(--text-secondary); margin: 0 0 1.5rem; line-height: 1.6; }
	.block-cta-buttons { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
	.block-cta-btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
	.block-cta-primary { background: var(--text-primary); color: var(--bg-primary); }
	.block-cta-secondary { border: 2px solid var(--text-primary); color: var(--text-primary); }
	.block-cta-btn:hover { opacity: 0.9; }
</style>
