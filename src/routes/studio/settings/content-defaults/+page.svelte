<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	type Config = { defaultStatus?: string; defaultTemplate?: string };
	let config = $state<Config>({ defaultStatus: 'draft', defaultTemplate: '' });
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(loadConfig);
	async function loadConfig() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/content-defaults');
			const { data, isHtml } = await safeJsonParse<{ config?: Config }>(res);
			if (!isHtml && data?.config) config = { ...config, ...data.config };
		} catch {
			error = 'Failed to load content defaults';
		} finally {
			loading = false;
		}
	}
	async function save(e: Event) {
		e.preventDefault();
		saving = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/content-defaults', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(config)
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Content defaults saved to config/content-defaults.json.';
			} else {
				error = data?.message || 'Failed to save';
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head><title>Content defaults | Studio Settings</title></svelte:head>

<div class="settings-page">
	<div class="page-header">
		<h1>Content defaults</h1>
		<p class="page-description">
			Default status and template for new pages. Saved to <code>config/content-defaults.json</code>. The editor and “New page” flow can use these so new content starts with your preferred state.
		</p>
	</div>
	{#if loading}
		<p class="loading">Loading…</p>
	{:else}
		<form onsubmit={save} class="settings-form">
			<div class="form-group">
				<label for="defaultStatus">Default status for new pages</label>
				<select id="defaultStatus" bind:value={config.defaultStatus}>
					<option value="draft">Draft</option>
					<option value="review">Review</option>
					<option value="live">Live</option>
				</select>
			</div>
			<div class="form-group">
				<label for="defaultTemplate">Default template ID</label>
				<input id="defaultTemplate" type="text" bind:value={config.defaultTemplate} placeholder="e.g. article, page" />
				<small>Optional. Template key from config/templates.json used when creating a new page.</small>
			</div>
			{#if error}<div class="alert alert-error">{error}</div>{/if}
			{#if success}<div class="alert alert-success">{success}</div>{/if}
			<button type="submit" class="save-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
		</form>
	{/if}
</div>

<style>
	.settings-page { max-width: 100%; width: 100%; padding: 2rem; box-sizing: border-box; }
	.page-header { margin-bottom: 1.5rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.25rem 0; color: var(--text-primary); }
	.page-description { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
	.page-description code { background: var(--bg-secondary); padding: 0.15rem 0.4rem; border-radius: 4px; }
	.loading { color: var(--text-muted); }
	.settings-form { display: flex; flex-direction: column; gap: 1.25rem; }
	.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
	.form-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); }
	.form-group input, .form-group select { padding: 0.6rem 0.75rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font: inherit; }
	.form-group small { font-size: 0.8rem; color: var(--text-muted); }
	.alert { padding: 0.6rem 0.9rem; border-radius: 6px; font-size: 0.9rem; }
	.alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #dc2626; }
	.alert-success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #16a34a; }
	.save-btn { padding: 0.6rem 1.25rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; align-self: flex-start; }
	.save-btn:hover:not(:disabled) { opacity: 0.9; }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
