<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	type ChangeRequest = {
		id: string;
		authorEmail: string;
		status: string;
		createdAt: string;
		title: string;
		description?: string;
		files: { path: string; content: string }[];
	};

	let list = $state<ChangeRequest[]>([]);
	let loading = $state(true);
	let error = $state('');
	let filter = $state<'all' | 'open' | 'merged' | 'rejected'>('open');

	function statusLabel(s: string): string {
		if (s === 'open') return 'Pending';
		if (s === 'merged') return 'Approved';
		if (s === 'rejected') return 'Declined';
		return s;
	}

	onMount(() => load());

	async function load() {
		loading = true;
		error = '';
		try {
			const q = filter === 'all' ? '' : `?status=${filter}`;
			const res = await fetch(`/studio/api/change-requests${q}`);
			const { data, isHtml } = await safeJsonParse<{ changeRequests?: ChangeRequest[] }>(res);
			if (isHtml || !data) {
				list = [];
				return;
			}
			list = data.changeRequests ?? [];
		} catch (e) {
			error = 'Failed to load content reviews';
			list = [];
		} finally {
			loading = false;
		}
	}

	function setFilter(f: typeof filter) {
		filter = f;
		load();
	}

	function formatDate(iso: string) {
		try {
			return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
		} catch {
			return iso;
		}
	}
</script>

<svelte:head>
	<title>Content reviews | QCS Studio</title>
</svelte:head>

<div class="requests-page">
	<header class="page-header">
		<h1>Content reviews</h1>
		<p class="page-description">Submit edits for review. Admins can preview and approve or decline.</p>
	</header>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	<div class="requests-toolbar">
		<div class="filter-tabs" role="tablist" aria-label="Filter by status">
			<button type="button" role="tab" class:active={filter === 'open'} onclick={() => setFilter('open')}>Pending</button>
			<button type="button" role="tab" class:active={filter === 'merged'} onclick={() => setFilter('merged')}>Approved</button>
			<button type="button" role="tab" class:active={filter === 'rejected'} onclick={() => setFilter('rejected')}>Declined</button>
			<button type="button" role="tab" class:active={filter === 'all'} onclick={() => setFilter('all')}>All</button>
		</div>
	</div>

	{#if loading}
		<p class="muted">Loading…</p>
	{:else if list.length === 0}
		<p class="muted">No content reviews in this category.</p>
		<p class="hint">From any content edit page, use <strong>Submit for review</strong> to create one.</p>
	{:else}
		<ul class="requests-list">
			{#each list as cr}
				<li class="request-card">
					<div class="request-card-main">
						<a href="/studio/requests/{cr.id}" class="request-title">{cr.title}</a>
						<p class="request-meta">
							<span class="request-author">{cr.authorEmail}</span>
							<span class="request-date">{formatDate(cr.createdAt)}</span>
							<span class="request-files">{cr.files.length} file(s)</span>
						</p>
						{#if cr.description}
							<p class="request-desc">{cr.description}</p>
						{/if}
					</div>
					<div class="request-status">
						<span class="status-badge" class:open={cr.status === 'open'} class:merged={cr.status === 'merged'} class:rejected={cr.status === 'rejected'}>
							{statusLabel(cr.status)}
						</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.requests-page { max-width: 900px; padding: 0 1rem; }
	.page-header { padding: 2rem 0; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); }
	.page-header h1 { font-size: 1.75rem; margin: 0 0 0.5rem 0; }
	.page-description { font-size: 0.95rem; color: var(--text-secondary); margin: 0; }
	.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
	.alert-error { background: #fef2f2; color: #b91c1c; }
	.requests-toolbar { margin-bottom: 1.5rem; }
	.filter-tabs { display: flex; gap: 0.25rem; }
	.filter-tabs button { padding: 0.5rem 1rem; border: 1px solid var(--border-subtle); background: var(--bg-primary); border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
	.filter-tabs button.active { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
	.requests-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
	.request-card { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); }
	.request-card-main { flex: 1; min-width: 0; }
	.request-title { font-weight: 600; color: var(--text-primary); text-decoration: none; }
	.request-title:hover { text-decoration: underline; }
	.request-meta { font-size: 0.85rem; color: var(--text-muted); margin: 0.35rem 0 0 0; display: flex; flex-wrap: wrap; gap: 0.75rem; }
	.request-desc { font-size: 0.9rem; color: var(--text-secondary); margin: 0.5rem 0 0 0; }
	.request-status { flex-shrink: 0; }
	.status-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; text-transform: capitalize; }
	.status-badge.open { background: #dbeafe; color: #1e40af; }
	.status-badge.merged { background: #d1fae5; color: #065f46; }
	.status-badge.rejected { background: #fee2e2; color: #b91c1c; }
	.muted { color: var(--text-muted); }
	.hint { font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem; }
</style>
