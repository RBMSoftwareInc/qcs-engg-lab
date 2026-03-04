<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';
	import type { MenuLink, CtaItem, MenusConfig } from '$lib/menus';

	let menus = $state<MenusConfig>({ header: [], footer: [], cta: [] });
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(loadMenus);

	async function loadMenus() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/menus');
			const { data, isHtml } = await safeJsonParse<{ menus?: MenusConfig }>(res);
			if (!isHtml && data?.menus) {
				menus = {
					header: data.menus.header ?? [],
					footer: data.menus.footer ?? [],
					cta: data.menus.cta ?? []
				};
			}
		} catch {
			error = 'Failed to load menus';
		} finally {
			loading = false;
		}
	}

	async function save() {
		saving = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/menus', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(menus)
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Menus saved. Re-deploy or refresh the site for changes to apply.';
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

	function move<T>(arr: T[], index: number, dir: -1 | 1): T[] | undefined {
		const i = index + dir;
		if (i < 0 || i >= arr.length) return undefined;
		const next = [...arr];
		[next[index], next[i]] = [next[i], next[index]];
		return next;
	}

	function removeHeader(i: number) {
		menus = { ...menus, header: menus.header.filter((_, j) => j !== i) };
	}
	function removeFooter(i: number) {
		menus = { ...menus, footer: menus.footer.filter((_, j) => j !== i) };
	}
	function removeCta(i: number) {
		menus = { ...menus, cta: menus.cta.filter((_, j) => j !== i) };
	}

	function addHeader() {
		menus = { ...menus, header: [...menus.header, { label: 'New link', href: '/', enabled: true }] };
	}
	function addFooter() {
		menus = { ...menus, footer: [...menus.footer, { label: 'New link', href: '/', enabled: true }] };
	}
	function addCta() {
		menus = { ...menus, cta: [...menus.cta, { label: 'New CTA', type: 'link', href: '#', enabled: true }] };
	}
</script>

<svelte:head>
	<title>Site menus | Studio Settings</title>
</svelte:head>

<div class="menus-settings-page">
	<div class="page-header">
		<h1>Site menus</h1>
		<p class="page-description">
			Manage header nav, footer links, and CTA buttons. Stored in <code>config/menus.json</code>. Disabled items are hidden on the site but kept in config (unlink without deleting).
		</p>
	</div>

	{#if loading}
		<p class="loading">Loading…</p>
	{:else}
		<form class="menus-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
			<div class="form-section">
				<h2>Header nav</h2>
				<p class="section-hint">Main navigation links. Order controls display order.</p>
				<div class="item-list">
					{#each menus.header as item, i}
						<div class="item-row">
							<span class="item-order">
								<button type="button" class="icon-btn" title="Move up" disabled={i === 0} onclick={() => { const n = move<MenuLink>(menus.header, i, -1); if (n) menus = { ...menus, header: n }; }}>↑</button>
								<button type="button" class="icon-btn" title="Move down" disabled={i === menus.header.length - 1} onclick={() => { const n = move<MenuLink>(menus.header, i, 1); if (n) menus = { ...menus, header: n }; }}>↓</button>
							</span>
							<input type="text" bind:value={item.label} placeholder="Label" class="item-label" />
							<input type="text" bind:value={item.href} placeholder="/path" class="item-href" />
							<label class="item-enabled"><input type="checkbox" bind:checked={item.enabled} /> On</label>
							<button type="button" class="icon-btn danger" title="Remove" onclick={() => removeHeader(i)}>×</button>
						</div>
					{/each}
				</div>
				<button type="button" class="add-btn" onclick={addHeader}>+ Add header link</button>
			</div>

			<div class="form-section">
				<h2>Footer nav</h2>
				<p class="section-hint">“Navigate” column in the footer. Often same as header.</p>
				<div class="item-list">
					{#each menus.footer as item, i}
						<div class="item-row">
							<span class="item-order">
								<button type="button" class="icon-btn" title="Move up" disabled={i === 0} onclick={() => { const n = move<MenuLink>(menus.footer, i, -1); if (n) menus = { ...menus, footer: n }; }}>↑</button>
								<button type="button" class="icon-btn" title="Move down" disabled={i === menus.footer.length - 1} onclick={() => { const n = move<MenuLink>(menus.footer, i, 1); if (n) menus = { ...menus, footer: n }; }}>↓</button>
							</span>
							<input type="text" bind:value={item.label} placeholder="Label" class="item-label" />
							<input type="text" bind:value={item.href} placeholder="/path" class="item-href" />
							<label class="item-enabled"><input type="checkbox" bind:checked={item.enabled} /> On</label>
							<button type="button" class="icon-btn danger" title="Remove" onclick={() => removeFooter(i)}>×</button>
						</div>
					{/each}
				</div>
				<button type="button" class="add-btn" onclick={addFooter}>+ Add footer link</button>
			</div>

			<div class="form-section">
				<h2>CTA (calls to action)</h2>
				<p class="section-hint">“Initiate” uses type <strong>modal</strong> (opens conversation). Use <strong>link</strong> for external or internal URLs.</p>
				<div class="item-list">
					{#each menus.cta as item, i}
						<div class="item-row cta-row">
							<span class="item-order">
								<button type="button" class="icon-btn" title="Move up" disabled={i === 0} onclick={() => { const n = move<CtaItem>(menus.cta, i, -1); if (n) menus = { ...menus, cta: n }; }}>↑</button>
								<button type="button" class="icon-btn" title="Move down" disabled={i === menus.cta.length - 1} onclick={() => { const n = move<CtaItem>(menus.cta, i, 1); if (n) menus = { ...menus, cta: n }; }}>↓</button>
							</span>
							<input type="text" bind:value={item.label} placeholder="Label" class="item-label" />
							<select bind:value={item.type} class="item-type">
								<option value="modal">Modal</option>
								<option value="link">Link</option>
							</select>
							{#if item.type === 'link'}
								<input type="text" bind:value={item.href} placeholder="https:// or /path" class="item-href" />
							{/if}
							<label class="item-enabled"><input type="checkbox" bind:checked={item.enabled} /> On</label>
							<button type="button" class="icon-btn danger" title="Remove" onclick={() => removeCta(i)}>×</button>
						</div>
					{/each}
				</div>
				<button type="button" class="add-btn" onclick={addCta}>+ Add CTA</button>
			</div>

			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}
			{#if success}
				<div class="alert alert-success">{success}</div>
			{/if}

			<button type="submit" class="save-btn" disabled={saving}>
				{saving ? 'Saving…' : 'Save menus'}
			</button>
		</form>
	{/if}
</div>

<style>
	.menus-settings-page {
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

	.menus-form {
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
		margin: 0 0 0.35rem 0;
		color: var(--text-primary);
	}

	.section-hint {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.item-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.item-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-subtle);
	}

	.item-row:last-child {
		border-bottom: none;
	}

	.item-order {
		display: flex;
		gap: 0.15rem;
	}

	.icon-btn {
		width: 28px;
		height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-subtle);
		background: var(--bg-secondary);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--text-primary);
	}

	.icon-btn:hover:not(:disabled) {
		border-color: var(--highlight);
		background: var(--bg-accent);
	}

	.icon-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.icon-btn.danger:hover {
		border-color: #dc2626;
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.item-label {
		width: 120px;
		min-width: 80px;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.item-href {
		flex: 1;
		min-width: 100px;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.9rem;
		font-family: 'IBM Plex Mono', monospace;
	}

	.item-type {
		width: 90px;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.85rem;
		background: var(--bg-secondary);
	}

	.item-enabled {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
		white-space: nowrap;
		cursor: pointer;
	}

	.add-btn {
		padding: 0.5rem 1rem;
		border: 1px dashed var(--border-subtle);
		background: transparent;
		border-radius: 8px;
		font-size: 0.9rem;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.add-btn:hover {
		border-color: var(--highlight);
		color: var(--text-primary);
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

	@media (max-width: 640px) {
		.item-row {
			flex-direction: column;
			align-items: stretch;
		}
		.item-label,
		.item-href {
			width: 100%;
		}
	}
</style>
