<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';

	interface TemplateEntry {
		id: string;
		name: string;
		description: string;
		previewPath: string | null;
		isCurrent: boolean;
	}

	let templates = $state<TemplateEntry[]>([]);
	let currentTemplateId = $state<string>('');
	let loading = $state(true);
	let isStaticBuild = $state(false);

	onMount(async () => {
		loading = true;
		try {
			const apiAvailable = await checkApiAvailable();
			if (!apiAvailable) {
				isStaticBuild = true;
				loading = false;
				return;
			}
			const res = await fetch('/studio/api/templates');
			const { data, isHtml } = await safeJsonParse<{ templates?: TemplateEntry[]; currentTemplateId?: string }>(res);
			if (!isHtml && data?.templates) {
				templates = data.templates;
				currentTemplateId = data.currentTemplateId ?? '';
			}
		} catch {
			isStaticBuild = true;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Templates | QCS Studio</title>
</svelte:head>

<div class="templates-page">
	<div class="page-header">
		<h1>Templates</h1>
		<p class="page-description">
			Current site template and other possible templates based on this platform. Choose a template when starting a new site.
		</p>
	</div>

	{#if isStaticBuild}
		<div class="static-notice">Studio is not available on static hosting.</div>
	{:else if loading}
		<p class="loading">Loading templates…</p>
	{:else}
		<div class="templates-grid">
			{#each templates as template}
				<article class="template-card" class:current={template.isCurrent}>
					<div class="template-header">
						<h2 class="template-name">{template.name}</h2>
						{#if template.isCurrent}
							<span class="template-badge">Current</span>
						{/if}
					</div>
					<p class="template-desc">{template.description}</p>
					{#if template.previewPath}
						<a href={template.previewPath} target="_blank" rel="noopener noreferrer" class="template-preview-link">View site →</a>
					{/if}
				</article>
			{/each}
		</div>
		<p class="templates-note">
			To add or edit templates, add <code>config/templates.json</code> (see <code>config/templates.example.json</code>).
		</p>
	{/if}
</div>

<style>
	.templates-page {
		padding: 2rem 0;
		max-width: 960px;
	}
	.page-header { margin-bottom: 1.5rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.35rem 0; color: var(--text-primary); }
	.page-description { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }
	.static-notice, .loading { color: var(--text-muted); }
	.templates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}
	.template-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 10px;
		padding: 1.25rem;
		transition: border-color 0.2s;
	}
	.template-card.current { border-color: var(--highlight); box-shadow: 0 0 0 1px var(--highlight); }
	.template-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.75rem; }
	.template-name { font-size: 1.1rem; font-weight: 600; margin: 0; color: var(--text-primary); }
	.template-badge {
		font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
		background: var(--highlight); color: #fff; padding: 0.25rem 0.5rem; border-radius: 4px;
	}
	.template-desc { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 0.75rem 0; }
	.template-preview-link { font-size: 0.9rem; font-weight: 500; color: var(--highlight); text-decoration: none; }
	.template-preview-link:hover { text-decoration: underline; }
	.templates-note { margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); }
	.templates-note code { background: var(--bg-secondary); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
</style>
