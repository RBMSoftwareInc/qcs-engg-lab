<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';
	import type { DataFormsConfig, DataFormId } from '$lib/studio/data-forms-config';
	import { FORM_IDS, getDefaultDataFormsConfig } from '$lib/studio/data-forms-config';

	const DESCRIPTIONS: Record<DataFormId, string> = {
		inquiries: 'Name, email, and project intent (hero CTA)',
		newsletter: 'Email signup for updates',
		contact: 'Name, email, and message',
		waitlist: 'Email and optional source (early access / beta)',
		feedback: 'Page, optional rating, and comment',
		demoRequest: 'Name, email, optional company'
	};

	let config = $state<DataFormsConfig>(getDefaultDataFormsConfig());
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(loadConfig);

	async function loadConfig() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/data-forms-config');
			const { data, isHtml } = await safeJsonParse<{ config?: DataFormsConfig }>(res);
			if (!isHtml && data?.config) {
				config = data.config;
			}
		} catch {
			error = 'Failed to load Data Forms config';
		} finally {
			loading = false;
		}
	}

	async function save() {
		saving = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/data-forms-config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(config)
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Data Forms settings saved. Enabled forms will accept submissions; disabled forms will return an error.';
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

	function setEnabled(id: DataFormId, enabled: boolean) {
		config = {
			...config,
			[id]: { ...config[id], enabled }
		};
	}

	function setFormValue<K extends keyof typeof config[DataFormId]>(
		id: DataFormId,
		key: K,
		value: (typeof config)[DataFormId][K]
	) {
		config = {
			...config,
			[id]: { ...config[id], [key]: value }
		};
	}
</script>

<svelte:head>
	<title>Data Forms | Studio Settings</title>
</svelte:head>

<div class="data-forms-page">
	<div class="page-header">
		<h1>Data Forms</h1>
		<p class="page-description">
			Enable or disable public forms (Get Started, Newsletter, Contact, etc.). Submissions are stored as files in the repo under <code>data/</code>—no database. When a form is disabled, its API rejects submissions and the form can be hidden on the site.
		</p>
	</div>

	{#if loading}
		<p class="loading">Loading…</p>
	{:else}
		<form class="data-forms-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
			<ul class="form-list" role="list">
				{#each FORM_IDS as id}
					<li class="form-item">
						<div class="form-item-header">
							<label class="toggle-label" for="toggle-{id}">
								<span class="form-name">{config[id].label}</span>
								<span class="form-desc">{DESCRIPTIONS[id]}</span>
							</label>
							<button
								type="button"
								id="toggle-{id}"
								class="toggle-btn"
								class:enabled={config[id].enabled}
								role="switch"
								aria-checked={config[id].enabled}
								aria-label="Enable or disable {config[id].label}"
								onclick={() => setEnabled(id, !config[id].enabled)}
							>
								<span class="toggle-knob"></span>
							</button>
						</div>
						<div class="form-fields">
							<div class="field-row">
								<label for="label-{id}">Label</label>
								<input id="label-{id}" type="text" value={config[id].label} oninput={(e) => setFormValue(id, 'label', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="field-row">
								<label for="path-{id}">Storage path</label>
								<input id="path-{id}" type="text" value={config[id].path} oninput={(e) => setFormValue(id, 'path', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="field-row">
								<label for="submitText-{id}">Submit button text</label>
								<input id="submitText-{id}" type="text" placeholder="e.g. Send, Subscribe" value={config[id].submitText ?? ''} oninput={(e) => setFormValue(id, 'submitText', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="field-row">
								<label for="successMessage-{id}">Success message</label>
								<textarea id="successMessage-{id}" rows="2" placeholder="Shown after submit" value={config[id].successMessage ?? ''} oninput={(e) => setFormValue(id, 'successMessage', (e.target as HTMLTextAreaElement).value)}></textarea>
							</div>
						</div>
					</li>
				{/each}
			</ul>
			{#if error}<div class="alert alert-error">{error}</div>{/if}
			{#if success}<div class="alert alert-success">{success}</div>{/if}
			<button type="submit" class="save-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
		</form>
	{/if}
</div>

<style>
	.data-forms-page {
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
	.page-description code {
		background: var(--bg-secondary);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
	}
	.loading {
		color: var(--text-muted);
	}
	.data-forms-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.form-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.form-item {
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 1rem 1.25rem;
		background: var(--bg-secondary);
	}
	.form-item-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}
	.toggle-label {
		display: block;
		flex: 1;
		cursor: pointer;
		min-width: 0;
	}
	.form-name {
		display: block;
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--text-primary);
		margin-bottom: 0.2rem;
	}
	.form-desc {
		display: block;
		font-size: 0.82rem;
		color: var(--text-muted);
		line-height: 1.4;
	}
	.toggle-btn {
		flex-shrink: 0;
		width: 44px;
		height: 24px;
		border-radius: 12px;
		border: 2px solid var(--border-subtle);
		background: var(--bg-primary);
		cursor: pointer;
		position: relative;
		transition: border-color 0.2s ease, background 0.2s ease;
		padding: 0;
	}
	.toggle-btn.enabled {
		border-color: var(--highlight, #22c55e);
		background: var(--highlight, #22c55e);
	}
	.toggle-knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--text-primary);
		transition: transform 0.2s ease;
	}
	.toggle-btn.enabled .toggle-knob {
		transform: translateX(20px);
		background: var(--bg-primary);
	}
	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-subtle);
	}
	.field-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.field-row label {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text-muted);
	}
	.field-row input,
	.field-row textarea {
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 0.9rem;
	}
	.field-row textarea {
		resize: vertical;
		min-height: 2.5rem;
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
	.alert-success {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		color: #16a34a;
	}
	.save-btn {
		padding: 0.6rem 1.25rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		align-self: flex-start;
	}
	.save-btn:hover:not(:disabled) {
		opacity: 0.9;
	}
	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
