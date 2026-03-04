<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	type Config = { webhookUrlOnPublish?: string; slackWebhookUrl?: string };
	let config = $state<Config>({ webhookUrlOnPublish: '', slackWebhookUrl: '' });
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(loadConfig);
	async function loadConfig() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/integrations-config');
			const { data, isHtml } = await safeJsonParse<{ config?: Config }>(res);
			if (!isHtml && data?.config) config = { ...config, ...data.config };
		} catch {
			error = 'Failed to load integrations config';
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
			const res = await fetch('/studio/api/integrations-config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(config)
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Integrations config saved to config/integrations.json. Wire these URLs in your build or backend to trigger on publish.';
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

<svelte:head><title>Integrations | Studio Settings</title></svelte:head>

<div class="settings-page">
	<div class="page-header">
		<h1>Integrations</h1>
		<p class="page-description">
			Outbound webhooks and notification URLs. Saved to <code>config/integrations.json</code>. Use with your CI, Zapier, or custom backend to run logic when content is published or when you need to notify a channel.
		</p>
	</div>
	{#if loading}
		<p class="loading">Loading…</p>
	{:else}
		<form onsubmit={save} class="settings-form">
			<div class="form-group">
				<label for="webhookUrlOnPublish">Webhook URL (on publish)</label>
				<input id="webhookUrlOnPublish" type="url" bind:value={config.webhookUrlOnPublish} placeholder="https://your-server.com/webhook/publish" />
				<small>Optional. Called when content is published (implement in your build pipeline or a small service).</small>
			</div>
			<div class="form-group">
				<label for="slackWebhookUrl">Slack webhook URL</label>
				<input id="slackWebhookUrl" type="url" bind:value={config.slackWebhookUrl} placeholder="https://hooks.slack.com/services/..." />
				<small>Optional. Incoming webhook for posting publish or review notifications to a channel.</small>
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
	.form-group input { padding: 0.6rem 0.75rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font: inherit; }
	.form-group small { font-size: 0.8rem; color: var(--text-muted); }
	.alert { padding: 0.6rem 0.9rem; border-radius: 6px; font-size: 0.9rem; }
	.alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #dc2626; }
	.alert-success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #16a34a; }
	.save-btn { padding: 0.6rem 1.25rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; align-self: flex-start; }
	.save-btn:hover:not(:disabled) { opacity: 0.9; }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
