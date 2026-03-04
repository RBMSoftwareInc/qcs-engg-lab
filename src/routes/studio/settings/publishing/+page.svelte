<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	type StudioConfig = {
		publishWebhookUrl?: string;
		defaultNewContentStatus?: 'draft' | 'live';
	};

	let config = $state<StudioConfig>({
		publishWebhookUrl: '',
		defaultNewContentStatus: 'draft'
	});
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');
	let runScheduleLoading = $state(false);
	let runScheduleResult = $state<{ message: string; published?: string[]; errors?: { path: string; message: string }[] } | null>(null);

	onMount(loadConfig);

	async function loadConfig() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/studio-config');
			const { data, isHtml } = await safeJsonParse<{ config?: StudioConfig }>(res);
			if (!isHtml && data?.config) {
				config = {
					publishWebhookUrl: data.config.publishWebhookUrl ?? '',
					defaultNewContentStatus: data.config.defaultNewContentStatus ?? 'draft'
				};
			}
		} catch {
			error = 'Failed to load config';
		} finally {
			loading = false;
		}
	}

	async function save() {
		saving = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/studio-config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(config)
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Publishing settings saved.';
				if (typeof window !== 'undefined' && window.self !== window.top) {
					window.parent.postMessage({ type: 'studio-form-result', success: true, message: success }, '*');
				}
			} else {
				error = data?.message || 'Failed to save';
				if (typeof window !== 'undefined' && window.self !== window.top) {
					window.parent.postMessage({ type: 'studio-form-result', success: false, message: error }, '*');
				}
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to save';
			if (typeof window !== 'undefined' && window.self !== window.top) {
				window.parent.postMessage({ type: 'studio-form-result', success: false, message: error }, '*');
			}
		} finally {
			saving = false;
		}
	}

	async function runScheduledPublishNow() {
		runScheduleLoading = true;
		runScheduleResult = null;
		error = '';
		try {
			const res = await fetch('/studio/api/publish/run-schedule', { method: 'POST' });
			const { data, isHtml } = await safeJsonParse<{
				success?: boolean;
				message?: string;
				published?: string[];
				errors?: { path: string; message: string }[];
			}>(res);
			if (!isHtml && data) {
				runScheduleResult = {
					message: data.message ?? (data.success ? 'Done.' : 'Failed'),
					published: data.published,
					errors: data.errors
				};
			} else {
				runScheduleResult = { message: 'Request failed' };
			}
		} catch (e: unknown) {
			runScheduleResult = { message: e instanceof Error ? e.message : 'Failed to run' };
		} finally {
			runScheduleLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Publishing | Studio Settings</title>
</svelte:head>

<div class="publishing-page">
	<div class="page-header">
		<h1>Publishing</h1>
		<p class="page-description">
			Notify a build or deploy when content is saved. Optional: add a webhook URL (e.g. Netlify or Vercel build hook) to trigger a rebuild after each save—no heavy backend required.
		</p>
	</div>

	{#if loading}
		<p class="loading">Loading…</p>
	{:else}
		<form class="publishing-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
			<div class="field">
				<label for="webhook">Build / deploy webhook URL</label>
				<input id="webhook" type="url" bind:value={config.publishWebhookUrl} placeholder="https://api.netlify.com/build_hooks/..." />
				<small>POST is sent after each content save. Leave empty to skip.</small>
			</div>
			<div class="field">
				<label for="defaultStatus">Default status for new content</label>
				<select id="defaultStatus" bind:value={config.defaultNewContentStatus}>
					<option value="draft">Draft</option>
					<option value="live">Live</option>
				</select>
			</div>
			{#if error}<div class="alert alert-error">{error}</div>{/if}
			{#if success}<div class="alert alert-success">{success}</div>{/if}
			<button type="submit" class="save-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
		</form>

		<section class="schedule-section" aria-labelledby="schedule-heading">
			<h2 id="schedule-heading" class="schedule-heading">Scheduled publish</h2>
			<p class="schedule-desc">
				Content with a <strong>Schedule publish</strong> date (set in the editor) goes live when the job runs. Run it now from here, or rely on the GitHub Action (every 15 min).
			</p>
			<button
				type="button"
				class="run-schedule-btn"
				onclick={runScheduledPublishNow}
				disabled={runScheduleLoading}
				title="Run scheduled publish now"
			>
				{runScheduleLoading ? 'Running…' : 'Run scheduled publish now'}
			</button>
			{#if runScheduleResult}
				<div class="schedule-result" class:schedule-result-error={runScheduleResult.errors?.length}>
					<p class="schedule-result-msg">{runScheduleResult.message}</p>
					{#if runScheduleResult.published?.length}
						<ul class="schedule-result-list">
							{#each runScheduleResult.published as path}
								<li><code>{path}</code></li>
							{/each}
						</ul>
					{/if}
					{#if runScheduleResult.errors?.length}
						<ul class="schedule-result-errors">
							{#each runScheduleResult.errors as err}
								<li>{err.path || 'Config'}: {err.message}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.publishing-page { max-width: 100%; width: 100%; padding: 2rem; box-sizing: border-box; }
	.page-header { margin-bottom: 1.5rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.25rem 0; color: var(--text-primary); }
	.page-description { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
	.loading { color: var(--text-muted); }
	.publishing-form { display: flex; flex-direction: column; gap: 1.25rem; }
	.field label { display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.35rem; color: var(--text-primary); }
	.field input, .field select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--border-subtle); border-radius: 6px; font-size: 0.95rem; background: var(--bg-secondary); color: var(--text-primary); }
	.field input:focus, .field select:focus { outline: none; border-color: var(--highlight); }
	.field small { display: block; margin-top: 0.35rem; font-size: 0.8rem; color: var(--text-muted); }
	.alert { padding: 0.6rem 0.9rem; border-radius: 6px; font-size: 0.9rem; }
	.alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #dc2626; }
	.alert-success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #16a34a; }
	.save-btn { padding: 0.6rem 1.25rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; align-self: flex-start; }
	.save-btn:hover:not(:disabled) { opacity: 0.9; }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

	.schedule-section { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-subtle); }
	.schedule-heading { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem 0; color: var(--text-primary); }
	.schedule-desc { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 1rem 0; }
	.run-schedule-btn { padding: 0.6rem 1rem; background: var(--highlight); color: #fff; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
	.run-schedule-btn:hover:not(:disabled) { opacity: 0.9; }
	.run-schedule-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.schedule-result { margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 8px; font-size: 0.9rem; }
	.schedule-result-error { background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.25); }
	.schedule-result-msg { margin: 0 0 0.5rem 0; font-weight: 500; }
	.schedule-result-list, .schedule-result-errors { margin: 0.35rem 0 0 1rem; padding-left: 1rem; }
	.schedule-result-list li, .schedule-result-errors li { margin: 0.2rem 0; }
	.schedule-result-errors { color: #dc2626; }
	.schedule-result code { font-size: 0.85em; background: var(--bg-secondary); padding: 0.1rem 0.35rem; border-radius: 4px; }
</style>
