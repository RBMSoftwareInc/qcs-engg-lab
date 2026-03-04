<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	let loading = $state(true);
	let available = $state(false);
	let provider = $state<string | null>(null);
	let error = $state('');

	onMount(async () => {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/ai/status');
			const { data, isHtml } = await safeJsonParse<{ available?: boolean; provider?: string }>(res);
			if (!isHtml && data) {
				available = !!data.available;
				provider = data.provider ?? null;
			}
		} catch {
			error = 'Could not load AI status';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>AI | Studio Settings</title>
</svelte:head>

<div class="ai-settings-page">
	<div class="page-header">
		<h1>AI</h1>
		<p class="page-description">
			Editor AI (suggest next paragraph, meta description, shorten/expand/tone) uses a provider configured via environment variables. Keys are never stored in the app.
		</p>
	</div>

	{#if loading}
		<p class="loading">Loading…</p>
	{:else if error}
		<div class="alert alert-error">{error}</div>
	{:else}
		<div class="status-card" class:configured={available}>
			<div class="status-badge">{available ? 'Configured' : 'Not configured'}</div>
			{#if available && provider}
				<p class="status-provider">Provider: <strong>{provider}</strong></p>
			{/if}
		</div>

		<div class="env-help">
			<h2 class="env-heading">Environment variables</h2>
			<p>Set these in <code>.env</code> or your deployment environment (e.g. Netlify, Vercel).</p>
			<pre class="env-block"><code># Option A: OpenAI (default if key is set)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Option B: Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Optional: override model
# AI_MODEL=gpt-4o-mini
# AI_MODEL=claude-3-5-haiku-20241022</code></pre>
			<p class="env-note">After changing env vars, restart the dev server or redeploy.</p>
		</div>
	{/if}
</div>

<style>
	.ai-settings-page {
		max-width: 100%;
		width: 100%;
		padding: 2rem;
		box-sizing: border-box;
	}
	.page-header {
		margin-bottom: 1.5rem;
	}
	.page-header h1 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
	}
	.page-description {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
	}
	.loading {
		color: var(--text-muted);
	}
	.alert {
		padding: 0.6rem 0.9rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}
	.alert-error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #dc2626;
	}
	.status-card {
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 1.25rem;
		background: var(--bg-secondary);
		margin-bottom: 1.5rem;
	}
	.status-card.configured {
		border-color: rgba(34, 197, 94, 0.4);
		background: rgba(34, 197, 94, 0.05);
	}
	.status-badge {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
	}
	.status-card.configured .status-badge {
		color: #16a34a;
	}
	.status-provider {
		margin: 0.5rem 0 0 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	.env-help {
		margin-top: 1.5rem;
	}
	.env-heading {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}
	.env-help p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0 0 0.75rem 0;
	}
	.env-block {
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.8rem;
		line-height: 1.5;
		margin: 0 0 0.75rem 0;
	}
	.env-block code {
		color: var(--text-secondary);
	}
	.env-note {
		font-size: 0.85rem;
		color: var(--text-muted);
	}
</style>
