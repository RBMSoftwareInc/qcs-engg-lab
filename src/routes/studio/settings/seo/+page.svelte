<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	type SeoConfig = {
		siteUrl?: string;
		defaultTitle?: string;
		defaultDescription?: string;
		gtmId?: string;
		gaMeasurementId?: string;
		ogImage?: string;
		twitterHandle?: string;
	};

	let config = $state<SeoConfig>({
		siteUrl: '',
		defaultTitle: 'QuantumCore Solutions',
		defaultDescription:
			'Architecture before infrastructure. Systems designed to evolve. Engineering lab focused on systems architecture and research-driven development.',
		gtmId: '',
		gaMeasurementId: '',
		ogImage: '',
		twitterHandle: ''
	});
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(loadConfig);

	async function loadConfig() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/seo-config');
			const { data, isHtml } = await safeJsonParse<{ config?: SeoConfig }>(res);
			if (!isHtml && data?.config) {
				config = {
					siteUrl: data.config.siteUrl ?? '',
					defaultTitle: data.config.defaultTitle ?? config.defaultTitle,
					defaultDescription: data.config.defaultDescription ?? config.defaultDescription,
					gtmId: data.config.gtmId ?? '',
					gaMeasurementId: data.config.gaMeasurementId ?? '',
					ogImage: data.config.ogImage ?? '',
					twitterHandle: data.config.twitterHandle ?? ''
				};
			}
		} catch {
			error = 'Failed to load SEO config';
		} finally {
			loading = false;
		}
	}

	async function save() {
		saving = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/seo-config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(config)
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'SEO config saved. Re-deploy or rebuild the site for changes to apply.';
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
</script>

<svelte:head>
	<title>SEO &amp; Analytics | Studio Settings</title>
</svelte:head>

<div class="seo-settings-page">
	<div class="page-header">
		<h1>SEO &amp; Analytics</h1>
		<p class="page-description">
			Configure site URL, default meta, and tracking IDs. Saved to <code>config/seo.json</code> in the repo. Re-deploy after saving for changes to apply.
		</p>
	</div>

	{#if loading}
		<p class="loading">Loading…</p>
	{:else}
		<form class="seo-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
			<div class="form-section">
				<h2>Site &amp; defaults</h2>
				<div class="field">
					<label for="siteUrl">Site URL (canonical base, no trailing slash)</label>
					<input id="siteUrl" type="url" bind:value={config.siteUrl} placeholder="https://yourdomain.com" />
				</div>
				<div class="field">
					<label for="defaultTitle">Default title</label>
					<input id="defaultTitle" type="text" bind:value={config.defaultTitle} placeholder="QuantumCore Solutions" />
				</div>
				<div class="field">
					<label for="defaultDescription">Default meta description</label>
					<textarea id="defaultDescription" bind:value={config.defaultDescription} rows="3" placeholder="Short description for search and social."></textarea>
				</div>
			</div>

			<div class="form-section">
				<h2>Tracking (optional)</h2>
				<div class="field">
					<label for="gtmId">Google Tag Manager ID</label>
					<input id="gtmId" type="text" bind:value={config.gtmId} placeholder="GTM-XXXXXXX" />
				</div>
				<div class="field">
					<label for="gaMeasurementId">Google Analytics 4 Measurement ID</label>
					<input id="gaMeasurementId" type="text" bind:value={config.gaMeasurementId} placeholder="G-XXXXXXXXXX" />
				</div>
			</div>

			<div class="form-section">
				<h2>Social (optional)</h2>
				<div class="field">
					<label for="ogImage">Default OG image URL</label>
					<input id="ogImage" type="url" bind:value={config.ogImage} placeholder="https://yourdomain.com/og-image.jpg" />
				</div>
				<div class="field">
					<label for="twitterHandle">Twitter handle</label>
					<input id="twitterHandle" type="text" bind:value={config.twitterHandle} placeholder="@yourhandle" />
				</div>
			</div>

			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}
			{#if success}
				<div class="alert alert-success">{success}</div>
			{/if}

			<button type="submit" class="save-btn" disabled={saving}>
				{saving ? 'Saving…' : 'Save SEO config'}
			</button>
		</form>
	{/if}
</div>

<style>
	.seo-settings-page {
		max-width: 100%;
		width: 100%;
		padding: 2rem;
		box-sizing: border-box;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.page-description {
		font-size: 0.95rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
	}

	.page-description code {
		background: var(--bg-secondary);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.loading {
		color: var(--text-secondary);
	}

	.seo-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.form-section {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.form-section h2 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
	}

	.field {
		margin-bottom: 1rem;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	.field label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 0.35rem;
	}

	.field input,
	.field textarea {
		width: 100%;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.95rem;
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--highlight);
	}

	.alert {
		padding: 0.75rem 1rem;
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
		padding: 0.75rem 1.5rem;
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
