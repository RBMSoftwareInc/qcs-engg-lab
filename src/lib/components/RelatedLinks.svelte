<script lang="ts">
	let { prev, next, backHref, backLabel = 'Back' } = $props<{
		prev?: { title: string; href: string } | null;
		next?: { title: string; href: string } | null;
		backHref?: string;
		backLabel?: string;
	}>();
</script>

<div class="related-links">
	{#if prev}
		<a href={prev.href} class="related-prev">
			<span class="related-label">Previous</span>
			<span class="related-title">{prev.title}</span>
		</a>
	{:else}
		<span class="related-spacer"></span>
	{/if}

	{#if backHref}
		<a href={backHref} class="related-back">{backLabel}</a>
	{/if}

	{#if next}
		<a href={next.href} class="related-next">
			<span class="related-label">Next</span>
			<span class="related-title">{next.title}</span>
		</a>
	{:else}
		<span class="related-spacer"></span>
	{/if}
</div>

<style>
	.related-links {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1rem;
		align-items: center;
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border-subtle);
	}

	.related-prev,
	.related-next {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		text-decoration: none;
		color: var(--text-primary);
		border: none;
		padding: 0.75rem 0;
		transition: color 0.2s ease;
		max-width: 280px;
	}

	.related-prev {
		text-align: left;
	}

	.related-next {
		text-align: right;
		justify-self: end;
	}

	.related-prev:hover,
	.related-next:hover {
		color: var(--highlight);
	}

	.related-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.related-title {
		font-weight: 500;
		font-size: 1rem;
		line-height: 1.3;
	}

	.related-back {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		color: var(--text-primary);
		text-decoration: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s ease;
	}

	.related-back:hover {
		background: var(--bg-accent);
	}

	.related-spacer {
		display: block;
	}

	@media (max-width: 768px) {
		.related-links {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.related-next {
			justify-self: center;
			text-align: center;
		}

		.related-prev {
			text-align: center;
			max-width: none;
		}

		.related-back {
			order: -1;
		}
	}
</style>
