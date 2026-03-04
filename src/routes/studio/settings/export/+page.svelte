<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	let cloneUrl = $state('');
	let owner = $state('');
	let repo = $state('');
	let branch = $state('main');
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/repo-info');
			const { data, isHtml } = await safeJsonParse<{ cloneUrl?: string; owner?: string; repo?: string; branch?: string }>(res);
			if (!isHtml && data) {
				owner = data.owner ?? '';
				repo = data.repo ?? '';
				branch = data.branch ?? 'main';
				cloneUrl = data.cloneUrl ?? (owner && repo ? `https://github.com/${owner}/${repo}.git` : '');
			}
		} catch {
			error = 'Could not load repo info';
		} finally {
			loading = false;
		}
	});
	function copyCloneUrl() {
		if (cloneUrl) {
			navigator.clipboard.writeText(cloneUrl);
		}
	}
</script>

<svelte:head><title>Export &amp; backup | Studio Settings</title></svelte:head>

<div class="settings-page">
	<div class="page-header">
		<h1>Export &amp; backup</h1>
		<p class="page-description">
			Your content and config live in Git. Clone the repo for a full backup or to work offline. No lock-in—everything is files.
		</p>
	</div>
	{#if loading}
		<p class="loading">Loading…</p>
	{:else if error}
		<div class="alert alert-error">{error}</div>
	{:else}
		<div class="export-card">
			<h2 class="card-heading">Repository</h2>
			{#if owner && repo}
				<p class="repo-label">Clone URL</p>
				<div class="clone-row">
					<code class="clone-url">{cloneUrl}</code>
					<button type="button" class="copy-btn" onclick={copyCloneUrl} title="Copy">Copy</button>
				</div>
				<p class="repo-meta">Branch: <strong>{branch}</strong> · <a href={cloneUrl ? `https://github.com/${owner}/${repo}` : '#'} target="_blank" rel="noopener noreferrer">Open on GitHub →</a></p>
			{:else}
				<p class="repo-muted">Repo not configured or not available. Set GITHUB_OWNER and GITHUB_REPO in your environment.</p>
			{/if}
		</div>
		<div class="export-card">
			<h2 class="card-heading">What’s in the repo</h2>
			<ul class="backup-list">
				<li><code>content/</code> — All markdown and page content</li>
				<li><code>config/</code> — Menus, SEO, data forms, branding, accessibility, etc.</li>
				<li><code>design/skins/</code> — Design token and generated CSS</li>
				<li><code>data/</code> — Form submissions (inquiries, newsletter, contact, etc.)</li>
			</ul>
			<p class="backup-note">Clone or pull to get a full backup. Push from Studio or from your own Git client—everything stays in sync.</p>
		</div>
	{/if}
</div>

<style>
	.settings-page { max-width: 100%; width: 100%; padding: 2rem; box-sizing: border-box; }
	.page-header { margin-bottom: 1.5rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.25rem 0; color: var(--text-primary); }
	.page-description { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
	.loading { color: var(--text-muted); }
	.alert { padding: 0.6rem 0.9rem; border-radius: 6px; font-size: 0.9rem; }
	.alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #dc2626; }
	.export-card { border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1.25rem; background: var(--bg-secondary); margin-bottom: 1.25rem; }
	.card-heading { font-size: 1rem; font-weight: 600; margin: 0 0 0.75rem 0; color: var(--text-primary); }
	.repo-label { font-size: 0.85rem; font-weight: 500; color: var(--text-muted); margin: 0 0 0.35rem 0; }
	.clone-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
	.clone-url { flex: 1; min-width: 200px; padding: 0.5rem 0.75rem; background: var(--bg-primary); border-radius: 6px; font-size: 0.85rem; word-break: break-all; }
	.copy-btn { padding: 0.5rem 0.75rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; }
	.copy-btn:hover { opacity: 0.9; }
	.repo-meta { font-size: 0.9rem; color: var(--text-secondary); margin: 0.5rem 0 0 0; }
	.repo-meta a { color: var(--highlight, #2563eb); }
	.repo-muted { font-size: 0.9rem; color: var(--text-muted); margin: 0; }
	.backup-list { margin: 0 0 0.75rem 0; padding-left: 1.25rem; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
	.backup-list code { background: var(--bg-primary); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85em; }
	.backup-note { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
</style>
