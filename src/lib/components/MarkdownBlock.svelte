<script lang="ts">
	let { html, className = '' } = $props<{
		html: string;
		className?: string;
	}>();
</script>

<div class="markdown-block {className}">{@html html}</div>

<style>
	.markdown-block {
		max-width: 700px;
		margin: 0 auto;
	}

	.markdown-block :global(h1),
	.markdown-block :global(h2),
	.markdown-block :global(h3) {
		margin-top: 3rem;
		margin-bottom: 1.5rem;
	}

	.markdown-block :global(h1:first-child),
	.markdown-block :global(h2:first-child),
	.markdown-block :global(h3:first-child) {
		margin-top: 0;
	}

	.markdown-block :global(p) {
		margin-bottom: 1.5rem;
		line-height: 1.8;
		color: var(--text-primary);
	}

	.markdown-block :global(ul),
	.markdown-block :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 2rem;
	}

	.markdown-block :global(li) {
		margin-bottom: 0.75rem;
		line-height: 1.7;
	}

	.markdown-block :global(code) {
		background: var(--bg-secondary);
		padding: 0.2em 0.4em;
		border-radius: 2px;
		font-size: 0.9em;
	}

	.markdown-block :global(pre) {
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 0;
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.markdown-block :global(pre code) {
		background: none;
		padding: 0;
	}

	.markdown-block :global(blockquote) {
		border-left: 3px solid var(--highlight);
		padding-left: 1.5rem;
		margin: 2rem 0;
		color: var(--text-secondary);
		font-style: italic;
	}

	.markdown-block :global(a) {
		color: var(--text-primary);
		border-bottom: 1px solid var(--border-subtle);
		transition: border-color 0.2s ease;
	}

	.markdown-block :global(a:hover) {
		border-bottom-color: var(--highlight);
	}

	.markdown-block :global(hr) {
		border: none;
		border-top: 1px solid var(--border-subtle);
		margin: 3rem 0;
	}

	.markdown-block :global(img) {
		max-width: 100%;
		height: auto;
		margin: 2rem 0;
		display: block;
		loading: lazy;
		decoding: async;
	}

	.markdown-block :global(img[src$=".svg"]) {
		max-width: 100%;
		height: auto;
	}

	.markdown-block :global(figure) {
		margin: 2.5rem 0;
	}

	.markdown-block :global(figure img) {
		margin: 0;
	}

	.markdown-block :global(figcaption) {
		margin-top: 0.75rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
		text-align: center;
		font-style: italic;
	}
</style>

