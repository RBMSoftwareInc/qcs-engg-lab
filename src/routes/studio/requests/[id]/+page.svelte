<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ContentPreview from '$lib/components/studio/ContentPreview.svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	type ChangeRequest = {
		id: string;
		authorEmail: string;
		status: string;
		createdAt: string;
		updatedAt?: string;
		title: string;
		description?: string;
		files: { path: string; content: string }[];
		mergedBy?: string;
		rejectedBy?: string;
	};

	let cr = $state<ChangeRequest | null>(null);
	let loading = $state(true);
	let error = $state('');
	let isAdmin = $state(false);
	let merging = $state(false);
	let rejecting = $state(false);
	let activeFileIndex = $state(0);
	let viewMode = $state<'preview' | 'source'>('preview');

	const id = $derived($page.params.id);

	onMount(async () => {
		const authRes = await fetch('/studio/api/auth/check');
		const { data: authData } = await safeJsonParse<{ role?: string }>(authRes);
		isAdmin = authData?.role === 'admin';

		const res = await fetch(`/studio/api/change-requests/${id}`);
		const { data, isHtml } = await safeJsonParse<{ changeRequest?: ChangeRequest }>(res);
		if (isHtml || !data?.changeRequest) {
			error = 'Content review not found';
			loading = false;
			return;
		}
		cr = data.changeRequest;
		loading = false;
	});

	async function merge() {
		if (!cr || cr.status !== 'open' || !isAdmin) return;
		merging = true;
		error = '';
		try {
			const res = await fetch(`/studio/api/change-requests/${id}/merge`, { method: 'POST' });
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				cr = cr ? { ...cr, status: 'merged' } : null;
				setTimeout(() => goto('/studio/requests'), 1500);
			} else {
				error = data?.message ?? 'Merge failed';
			}
		} catch (e: any) {
			error = e.message ?? 'Merge failed';
		} finally {
			merging = false;
		}
	}

	async function reject() {
		if (!cr || cr.status !== 'open' || !isAdmin) return;
		if (!confirm('Decline this review? The author can submit a new one.')) return;
		rejecting = true;
		error = '';
		try {
			const res = await fetch(`/studio/api/change-requests/${id}/reject`, { method: 'POST' });
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; changeRequest?: ChangeRequest }>(res);
			if (!isHtml && data?.success && data.changeRequest) {
				cr = data.changeRequest;
				setTimeout(() => goto('/studio/requests'), 1500);
			} else {
				error = 'Reject failed';
			}
		} catch (e: any) {
			error = e.message ?? 'Reject failed';
		} finally {
			rejecting = false;
		}
	}

	function formatDate(iso: string) {
		try {
			return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
		} catch {
			return iso;
		}
	}

	function statusLabel(s: string): string {
		if (s === 'open') return 'Pending';
		if (s === 'merged') return 'Approved';
		if (s === 'rejected') return 'Declined';
		return s;
	}

	const activeFile = $derived(cr?.files?.[activeFileIndex] ?? null);
</script>

<svelte:head>
	<title>{cr?.title ?? 'Content review'} | QCS Studio</title>
</svelte:head>

<div class="request-detail-page">
	<a href="/studio/requests" class="back-link">← Back to Reviews</a>

	{#if loading}
		<p class="muted">Loading…</p>
	{:else if error && !cr}
		<div class="alert alert-error">{error}</div>
	{:else if cr}
		<header class="detail-header">
			<h1>{cr.title}</h1>
			<p class="meta">
				<span>{cr.authorEmail}</span>
				<span>{formatDate(cr.createdAt)}</span>
				<span class="status-badge" class:open={cr.status === 'open'} class:merged={cr.status === 'merged'} class:rejected={cr.status === 'rejected'}>{statusLabel(cr.status)}</span>
			</p>
			{#if cr.description}
				<p class="description">{cr.description}</p>
			{/if}
		</header>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		{#if cr.status === 'open' && isAdmin}
			<div class="action-bar">
				<button type="button" class="btn-approve" onclick={merge} disabled={merging}>
					{merging ? 'Publishing…' : 'Approve & publish'}
				</button>
				<button type="button" class="btn-reject" onclick={reject} disabled={rejecting}>
					{rejecting ? 'Declining…' : 'Decline'}
				</button>
			</div>
		{/if}

		{#if cr.status === 'merged' && cr.mergedBy}
			<p class="resolved-by">Approved by {cr.mergedBy}{#if cr.updatedAt} on {formatDate(cr.updatedAt)}{/if}</p>
		{/if}
		{#if cr.status === 'rejected' && cr.rejectedBy}
			<p class="resolved-by">Declined by {cr.rejectedBy}{#if cr.updatedAt} on {formatDate(cr.updatedAt)}{/if}</p>
		{/if}

		<div class="files-section">
			<h2>Files</h2>
			{#if cr.files.length > 1}
				<div class="file-tabs">
					{#each cr.files as file, i}
						<button type="button" class="file-tab" class:active={i === activeFileIndex} onclick={() => activeFileIndex = i}>
							{file.path}
						</button>
					{/each}
				</div>
			{/if}
			{#if activeFile}
				<div class="file-view">
					<div class="file-view-toolbar">
						<span class="file-path">{activeFile.path}</span>
						<div class="view-toggle">
							<button type="button" class:active={viewMode === 'preview'} onclick={() => viewMode = 'preview'}>Preview</button>
							<button type="button" class:active={viewMode === 'source'} onclick={() => viewMode = 'source'}>Source</button>
						</div>
					</div>
					{#if viewMode === 'preview'}
						<div class="preview-wrap">
							<ContentPreview markdown={activeFile.content} />
						</div>
					{:else}
						<pre class="source-wrap"><code>{activeFile.content}</code></pre>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.request-detail-page { max-width: 960px; padding: 0 1rem 2rem; }
	.back-link { display: inline-block; margin-bottom: 1rem; color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; }
	.back-link:hover { text-decoration: underline; }
	.detail-header { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); }
	.detail-header h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; }
	.meta { font-size: 0.9rem; color: var(--text-muted); margin: 0; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
	.description { font-size: 0.95rem; color: var(--text-secondary); margin: 0.5rem 0 0 0; }
	.status-badge { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: capitalize; }
	.status-badge.open { background: #dbeafe; color: #1e40af; }
	.status-badge.merged { background: #d1fae5; color: #065f46; }
	.status-badge.rejected { background: #fee2e2; color: #b91c1c; }
	.action-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
	.btn-approve { padding: 0.5rem 1rem; background: #059669; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
	.btn-reject { padding: 0.5rem 1rem; background: transparent; border: 1px solid #dc2626; color: #dc2626; border-radius: 6px; cursor: pointer; }
	.btn-approve:disabled, .btn-reject:disabled { opacity: 0.6; cursor: not-allowed; }
	.resolved-by { font-size: 0.9rem; color: var(--text-muted); margin: 0 0 1rem 0; }
	.files-section h2 { font-size: 1.1rem; margin: 0 0 0.75rem 0; }
	.file-tabs { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.75rem; }
	.file-tab { padding: 0.35rem 0.75rem; border: 1px solid var(--border-subtle); background: var(--bg-primary); border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
	.file-tab.active { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
	.file-view { border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; }
	.file-view-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-subtle); }
	.file-path { font-size: 0.85rem; color: var(--text-muted); }
	.view-toggle { display: flex; gap: 0.25rem; }
	.view-toggle button { padding: 0.25rem 0.5rem; font-size: 0.8rem; border: 1px solid var(--border-subtle); background: var(--bg-primary); border-radius: 4px; cursor: pointer; }
	.view-toggle button.active { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
	.preview-wrap { padding: 1rem; min-height: 200px; max-height: 70vh; overflow: auto; }
	.preview-wrap :global(.content-preview) { padding: 0; }
	.source-wrap { margin: 0; padding: 1rem; font-size: 0.85rem; overflow: auto; max-height: 70vh; background: var(--bg-secondary); white-space: pre-wrap; word-break: break-word; }
	.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
	.alert-error { background: #fef2f2; color: #b91c1c; }
	.muted { color: var(--text-muted); }
</style>
