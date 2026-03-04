<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';

	/** Move modal to body so it's never clipped by layout/overflow */
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		};
	}

	type StatusEntry = { path: string; code: string; label: string };
	type ActivityEntry = { hash: string; author: string; message: string; date: string };

	let syncSummary = $state('Up to date');
	let syncFiles = $state<StatusEntry[]>([]);
	let syncAvailable = $state(true);
	let loading = $state(true);
	let syncing = $state(false);
	let error = $state('');
	let isStaticBuild = $state(false);
	let syncGroupPages = $state<Record<string, number>>({});
	let activityEntries = $state<ActivityEntry[]>([]);
	let settingsModal = $state<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });
	let modalMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let userRole = $state<string | null>(null);
	let flyoutOpen = $state(false);

	const PAGE_SIZE = 15;
	const LABEL_ORDER = ['Modified', 'New', 'Added', 'Deleted', 'Renamed', 'Copied', 'Unmerged', 'Changed'];

	/** Inline SVG icons for settings (24×24 viewBox). */
	const SETTINGS_ICONS: Record<string, string> = {
		branding: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
		menus: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
		translations: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c2.2 0 4.18.94 5.56 2.44A7.96 7.96 0 0 0 12 4c-2.2 0-4.18.94-5.56 2.44C7.38 7.94 6 9.9 6 12s1.38 4.06 2.44 5.56A7.96 7.96 0 0 0 12 20c2.2 0 4.18-.94 5.56-2.44C18.62 16.06 20 14.1 20 12s-1.38-4.06-2.44-5.56A7.96 7.96 0 0 0 12 4z',
		'data-forms': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
		seo: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
		ai: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
		accessibility: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z',
		'content-defaults': 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
		integrations: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12L8 9.5l1-.5 1 5 1-5 1 .5-1.5 2.5c-.02.04.12.12.5.12H13l-1 7zm-3-2h1l.5-4h-2l.5 4zm4 0h1l.5-4h-2l.5 4z',
		publishing: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
		export: 'M19 9h-4V3H9v6H5l7 7 7-7zm-4 4V9h2.21l-2.21 2.21L17 13zm-6 5H5v-2h4v2z',
		users: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
		credentials: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'
	};

	const allSettingsNav = [
		{ label: 'Branding', href: '/studio/settings/branding', description: 'Site name, logo, tagline', icon: 'branding' },
		{ label: 'Menus', href: '/studio/settings/menus', description: 'Header, footer & CTAs', icon: 'menus' },
		{ label: 'Translations', href: '/studio/settings/translations', description: 'Languages & locale config', icon: 'translations' },
		{ label: 'Data Forms', href: '/studio/settings/data-forms', description: 'Enable/disable lead & contact forms', icon: 'data-forms' },
		{ label: 'SEO & Analytics', href: '/studio/settings/seo', description: 'Meta, tracking', icon: 'seo' },
		{ label: 'AI', href: '/studio/settings/ai', description: 'Provider & status for editor AI', icon: 'ai' },
		{ label: 'Accessibility', href: '/studio/settings/accessibility', description: 'Skip link, a11y statement', icon: 'accessibility' },
		{ label: 'Content defaults', href: '/studio/settings/content-defaults', description: 'Default status & template for new pages', icon: 'content-defaults' },
		{ label: 'Integrations', href: '/studio/settings/integrations', description: 'Webhooks, Slack, on-publish hooks', icon: 'integrations' },
		{ label: 'Publishing', href: '/studio/settings/publishing', description: 'Webhook & defaults', icon: 'publishing' },
		{ label: 'Export & backup', href: '/studio/settings/export', description: 'Repo URL, content backup', icon: 'export' },
		{ label: 'Users', href: '/studio/settings/users', description: 'Access & roles', icon: 'users' },
		{ label: 'Credentials', href: '/studio/settings/credentials', description: 'Your password', icon: 'credentials' }
	];

	const settingsNav = $derived(
		userRole === 'admin'
			? allSettingsNav
			: allSettingsNav.filter((item) => !item.href.endsWith('/users'))
	);

	function groupByLabel(files: StatusEntry[]): { label: string; entries: StatusEntry[] }[] {
		const map = new Map<string, StatusEntry[]>();
		for (const e of files) {
			const list = map.get(e.label) ?? [];
			list.push(e);
			map.set(e.label, list);
		}
		const order = [...LABEL_ORDER];
		return order.filter((l) => map.has(l)).map((label) => ({ label, entries: map.get(label)! }));
	}

	onMount(async () => {
		const apiAvailable = await checkApiAvailable();
		if (!apiAvailable) {
			isStaticBuild = true;
			loading = false;
			return;
		}
		try {
			const authRes = await fetch('/studio/api/auth/check');
			const { data: authData, isHtml } = await safeJsonParse<{ role?: string }>(authRes);
			if (!isHtml && authData?.role) userRole = authData.role;
		} catch {
			// ignore
		}
		await loadStatus();
		loadActivity();
	});

	async function loadActivity() {
		try {
			const res = await fetch('/studio/api/activity?limit=10');
			const { data, isHtml } = await safeJsonParse<{ entries?: ActivityEntry[] }>(res);
			if (!isHtml && data?.entries) activityEntries = data.entries;
		} catch {
			// ignore
		}
	}

	function openSettingsModal(url: string, title: string) {
		modalMessage = null;
		settingsModal = { open: true, url, title };
	}

	function closeSettingsModal() {
		settingsModal = { open: false, url: '', title: '' };
		modalMessage = null;
	}

	$effect(() => {
		if (!settingsModal.open) return;
		const onMessage = (e: MessageEvent) => {
			const d = e.data;
			if (d?.type === 'studio-form-result') {
				modalMessage = d.success ? { type: 'success', text: d.message ?? 'Saved.' } : { type: 'error', text: d.message ?? 'Failed.' };
				setTimeout(() => { modalMessage = null; }, 5000);
			}
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	});

	$effect(() => {
		if (!settingsModal.open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeSettingsModal();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect(() => {
		if (!flyoutOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') flyoutOpen = false;
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function getPreviewUrl(path: string): { url: string; label: string } | null {
		const p = path.replace(/^\/+/, '');
		if (p.startsWith('content/') && p.endsWith('.md')) {
			if (p === 'content/hero/intro.md') return { url: '/', label: 'Preview' };
			const slug = p.replace(/^content\/|\.md$/g, '');
			return { url: '/' + slug, label: 'Preview' };
		}
		const staticPath = p.startsWith('static/') ? p.slice(7) : p;
		if (staticPath.startsWith('assets/images/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(p)) {
			const url = staticPath.startsWith('assets/') ? '/' + staticPath : '/assets/images/' + staticPath;
			return { url, label: 'View' };
		}
		return null;
	}

	async function loadStatus() {
		loading = true;
		error = '';
		try {
			const response = await fetch('/studio/api/git/status');
			const { data, isHtml } = await safeJsonParse<{
				success?: boolean;
				summary?: string;
				files?: StatusEntry[];
				error?: string;
			}>(response);

			if (isHtml || !data) {
				isStaticBuild = true;
				loading = false;
				return;
			}

			syncAvailable = data.success !== false;
			syncSummary = data.summary ?? 'Up to date';
			syncFiles = data.files ?? [];
			if (!data.success && data.error) {
				error = data.error;
			}
		} catch {
			error = 'Could not load sync status';
			isStaticBuild = true;
		} finally {
			loading = false;
		}
	}

	async function handleSync() {
		syncing = true;
		error = '';
		try {
			const response = await fetch('/studio/api/git/pull', { method: 'POST' });
			const { data, isHtml } = await safeJsonParse<{ success: boolean; message?: string; error?: string }>(response);

			if (isHtml || !data) {
				error = 'Sync is not available in this environment.';
				syncing = false;
				return;
			}

			if (data.success) {
				await loadStatus();
			} else {
				error = data.error || data.message || 'Sync failed';
			}
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Sync failed';
		} finally {
			syncing = false;
		}
	}
</script>

<svelte:head>
	<title>Settings | QCS Studio</title>
</svelte:head>

<div class="settings-page">
	<div class="settings-main">
		<header class="page-header">
			<h1>Settings</h1>
			<p class="page-description">Site configuration and access. For edit → review → approve flows, use <a href="/studio/requests">Reviews</a>.</p>
		</header>

		<nav class="settings-nav" aria-label="Settings sections">
			{#each settingsNav as item}
				<a
					href={item.href}
					class="nav-card"
					onclick={(e) => { e.preventDefault(); openSettingsModal(item.href, item.label); }}
				>
					{#if item.icon && SETTINGS_ICONS[item.icon]}
						<span class="nav-card-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d={SETTINGS_ICONS[item.icon]} /></svg>
						</span>
					{/if}
					<span class="nav-card-label">{item.label}</span>
					<span class="nav-card-desc">{item.description}</span>
				</a>
			{/each}
		</nav>
	</div>

	<!-- Notch on right edge: opens Sync & Activity flyout -->
	<button
		type="button"
		class="notch-tab"
		onclick={() => (flyoutOpen = true)}
		aria-label="Open Sync and activity"
		title="Sync &amp; activity"
	>
		<span class="notch-tab-icon" aria-hidden="true">
			<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8L18.4 16c.9-1.4 1.4-3 1.4-4.8 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.6 8C4.7 9.4 4.2 11 4.2 12.8c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
		</span>
		<span class="notch-tab-label">Sync</span>
		{#if syncAvailable && syncSummary !== 'Up to date' && !loading}
			<span class="notch-tab-dot" aria-hidden="true"></span>
		{/if}
	</button>

	<!-- Flyout from right: Sync + Recent activity (wider panel) -->
	<div class="flyout-backdrop" class:open={flyoutOpen} onclick={() => (flyoutOpen = false)} aria-hidden="true"></div>
	<aside
		class="flyout-panel"
		class:open={flyoutOpen}
		aria-label="Sync and activity"
		role="region"
	>
		<div class="flyout-header">
			<h2 class="flyout-title">Sync &amp; activity</h2>
			<button type="button" class="flyout-close" onclick={() => (flyoutOpen = false)} aria-label="Close panel">×</button>
		</div>
		<div class="flyout-body">
			<section class="flyout-section">
				<h3 class="flyout-section-title">
					<span class="flyout-section-icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8L18.4 16c.9-1.4 1.4-3 1.4-4.8 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.6 8C4.7 9.4 4.2 11 4.2 12.8c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
					</span>
					Sync
				</h3>
				<div class="flyout-section-badge" class:has-changes={syncAvailable && syncSummary !== 'Up to date' && !loading}>{syncSummary}</div>
				<div class="sync-actions">
					<button type="button" class="sync-btn" onclick={handleSync} disabled={syncing || !syncAvailable}>
						{syncing ? 'Syncing…' : 'Refresh'}
					</button>
				</div>
				{#if loading}
					<p class="sync-muted">Checking…</p>
				{:else}
					<p class="sync-summary" class:sync-unavailable={!syncAvailable}>{syncSummary}</p>
					{#if !syncAvailable}
						<p class="sync-note">Saves are stored in the cloud. Sync status is available when running in a full environment.</p>
					{:else if syncFiles.length > 0}
						<div class="sync-accordion">
							{#each groupByLabel(syncFiles) as { label, entries }}
								{@const totalPages = Math.ceil(entries.length / PAGE_SIZE)}
								{@const page = syncGroupPages[label] ?? 0}
								<details class="sync-details">
									<summary class="sync-details-summary">
										<span class="sync-details-label">{label}</span>
										<span class="sync-details-count">{entries.length}</span>
									</summary>
									<div class="sync-details-inner">
										<table class="sync-table">
											<thead>
												<tr>
													<th class="sync-th-code">Code</th>
													<th class="sync-th-path">Path</th>
													<th class="sync-th-preview">Preview</th>
												</tr>
											</thead>
											<tbody>
												{#each entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) as entry}
													{@const preview = getPreviewUrl(entry.path)}
													<tr>
														<td class="sync-td-code"><code class="sync-code sync-code-{entry.label.toLowerCase()}">{entry.code || '—'}</code></td>
														<td class="sync-td-path"><span class="sync-path" title={entry.path}>{entry.path}</span></td>
														<td class="sync-td-preview">
															{#if preview}
																<a href={preview.url} target="_blank" rel="noopener noreferrer" class="sync-preview-link">{preview.label}</a>
															{:else}
																—
															{/if}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
										{#if totalPages > 1}
											<div class="sync-pagination">
												<button type="button" class="sync-page-btn" disabled={page <= 0} onclick={() => { syncGroupPages = { ...syncGroupPages, [label]: Math.max(0, page - 1) }; }}>Previous</button>
												<span class="sync-page-info">Page {page + 1} of {totalPages}</span>
												<button type="button" class="sync-page-btn" disabled={page >= totalPages - 1} onclick={() => { syncGroupPages = { ...syncGroupPages, [label]: Math.min(totalPages - 1, page + 1) }; }}>Next</button>
											</div>
										{/if}
									</div>
								</details>
							{/each}
						</div>
					{/if}
				{/if}
			</section>

			{#if !isStaticBuild}
				<section class="flyout-section">
					<h3 class="flyout-section-title">
						<span class="flyout-section-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-1.87-1.93-2.17l-1.42 1.42C17.27 15.23 18 14.21 18 13c0-2.76-2.24-5-5-5z"/></svg>
						</span>
						Recent activity
						{#if activityEntries.length > 0}
							<span class="flyout-section-badge">{activityEntries.length}</span>
						{/if}
					</h3>
					{#if activityEntries.length > 0}
						<ul class="activity-list">
							{#each activityEntries.slice(0, 10) as entry}
								<li class="activity-item">
									<span class="activity-message">{entry.message}</span>
									<span class="activity-meta">{entry.author} · {entry.date ? new Date(entry.date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="activity-empty">No recent activity.</p>
					{/if}
				</section>
			{/if}
		</div>
	</aside>

	{#if settingsModal.open}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="settings-modal-backdrop"
			use:portal
			onclick={closeSettingsModal}
			onkeydown={(e) => e.key === 'Escape' && closeSettingsModal()}
			role="presentation"
		>
			<div
				class="settings-modal"
				tabindex="-1"
				role="dialog"
				aria-modal="true"
				aria-label={settingsModal.title}
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="settings-modal-header">
					<h2 class="settings-modal-title">{settingsModal.title}</h2>
					<div class="settings-modal-actions">
						<a href={settingsModal.url} target="_blank" rel="noopener noreferrer" class="settings-modal-open-tab">Open in tab</a>
						<button type="button" class="settings-modal-close" onclick={closeSettingsModal} aria-label="Close">×</button>
					</div>
				</div>
				{#if modalMessage}
					<div class="settings-modal-message" class:success={modalMessage.type === 'success'} class:error={modalMessage.type === 'error'}>
						{modalMessage.text}
					</div>
				{/if}
				<div class="settings-modal-iframe-wrapper">
					<iframe class="settings-modal-iframe" title={settingsModal.title} src={settingsModal.url}></iframe>
				</div>
			</div>
		</div>
	{/if}

	<details class="getting-started-section">
		<summary>Getting started</summary>
		<div class="getting-started-inner">
			<p>Set up your content platform in a few steps—no heavy backend.</p>
			<ul>
				<li><a href="/studio/settings/branding">Branding</a> — Site name, logo, tagline</li>
				<li><a href="/studio/settings/menus">Menus</a> — Configure header, footer, and CTAs</li>
				<li><a href="/studio/settings/translations">Translations</a> — Supported languages and default locale</li>
				<li><a href="/studio/settings/data-forms">Data Forms</a> — Enable/disable and customize labels for Get Started, Newsletter, Contact, etc.</li>
				<li><a href="/studio/settings/seo">SEO &amp; Analytics</a> — Site URL and meta</li>
				<li><a href="/studio/settings/ai">AI</a> — Provider status for editor AI (suggest, meta description, transform)</li>
				<li><a href="/studio/settings/accessibility">Accessibility</a> — Skip link, a11y statement</li>
				<li><a href="/studio/settings/content-defaults">Content defaults</a> — Default status and template for new pages</li>
				<li><a href="/studio/settings/integrations">Integrations</a> — Webhooks, Slack, on-publish hooks</li>
				<li><a href="/studio/settings/publishing">Publishing</a> — Optional build webhook for instant deploys</li>
				<li><a href="/studio/settings/export">Export &amp; backup</a> — Repo URL, content backup</li>
				<li><a href="/studio/settings/users">Users</a> — Add your team and roles</li>
				<li><a href="/studio/settings/credentials">Credentials</a> — Your password</li>
			</ul>
		</div>
	</details>

	<details class="about-section">
		<summary>About this platform</summary>
		<div class="about-inner">
			<p class="platform-tagline">QCS Studio is a <strong>file-native content platform</strong>. Content lives as files; changes sync and version automatically. Built for speed and team clarity—without the weight of traditional CMS or page builders.</p>
			<p>Content is stored as Markdown in <code>/content</code>; media in <code>/static/assets/images</code>. Access is managed via users and credentials. Re-deploy or use a build webhook to publish.</p>
			<p class="about-paths"><strong>Paths:</strong> Content <code>/content</code> · Media <code>/static/assets/images</code></p>
		</div>
	</details>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}
</div>

<style>
	.settings-page {
		width: 100%;
		max-width: 100%;
		background: var(--bg-primary);
		min-height: 100%;
		padding: 0 1.5rem 2rem;
		box-sizing: border-box;
	}

	.settings-main {
		background: var(--bg-primary);
		border-radius: 12px;
		padding: 0;
		min-width: 0;
		max-width: 1600px;
		margin: 0 auto;
	}

	/* ---- Notch (right edge tab) ---- */
	.notch-tab {
		position: fixed;
		top: 50%;
		right: 0;
		transform: translateY(-50%);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-right: none;
		border-radius: 12px 0 0 12px;
		box-shadow: -2px 0 12px rgba(0, 0, 0, 0.06);
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
		transition: background 0.2s ease, box-shadow 0.2s ease, padding 0.2s ease;
	}

	.notch-tab:hover {
		background: var(--bg-accent);
		box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
		padding-right: 0.6rem;
	}

	.notch-tab:focus-visible {
		outline: 2px solid var(--highlight);
		outline-offset: 2px;
	}

	.notch-tab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
	}

	.notch-tab-label {
		writing-mode: vertical-rl;
		text-orientation: mixed;
		letter-spacing: 0.02em;
	}

	.notch-tab-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--highlight);
		flex-shrink: 0;
	}

	/* ---- Flyout backdrop ---- */
	.flyout-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.2);
		z-index: 1100;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.25s ease, visibility 0.25s ease;
	}

	.flyout-backdrop.open {
		opacity: 1;
		visibility: visible;
	}

	/* ---- Flyout panel (wider: 420px) ---- */
	.flyout-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 420px;
		max-width: 96vw;
		z-index: 1101;
		background: var(--bg-primary);
		border-left: 1px solid var(--border-subtle);
		box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
		display: flex;
		flex-direction: column;
		transform: translateX(100%);
		transition: transform 0.3s ease;
	}

	.flyout-panel.open {
		transform: translateX(0);
	}

	.flyout-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--bg-secondary);
		flex-shrink: 0;
	}

	.flyout-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.flyout-close {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		border-radius: 8px;
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		color: var(--text-secondary);
		transition: background 0.2s ease, color 0.2s ease;
	}

	.flyout-close:hover {
		background: var(--bg-accent);
		color: var(--text-primary);
	}

	.flyout-body {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.25rem;
	}

	.flyout-section {
		margin-bottom: 1.5rem;
	}

	.flyout-section:last-child {
		margin-bottom: 0;
	}

	.flyout-section-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.75rem 0;
	}

	.flyout-section-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
	}

	.flyout-section-badge {
		margin-left: auto;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-muted);
		background: var(--bg-secondary);
		padding: 0.2rem 0.5rem;
		border-radius: 6px;
	}

	.flyout-section-badge.has-changes {
		background: var(--bg-accent);
		color: var(--text-primary);
	}

	.sync-actions {
		margin-bottom: 0.75rem;
	}

	.sync-actions .sync-btn {
		width: 100%;
	}

	.flyout-panel .sync-details-inner {
		overflow-x: auto;
		max-width: 100%;
	}

	.activity-empty {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0.5rem 0 0 0;
	}

	.page-header {
		margin-bottom: 1.75rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.page-header h1 {
		font-size: 1.85rem;
		font-weight: 600;
		margin: 0 0 0.35rem 0;
		color: var(--text-primary);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.page-description {
		font-size: 0.95rem;
		color: var(--text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.page-description a {
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		border-bottom: 1px solid var(--highlight);
		transition: color 0.2s ease, border-color 0.2s ease;
	}

	.page-description a:hover {
		color: var(--text-primary);
		border-bottom-color: var(--text-primary);
	}

	.settings-nav {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
		width: 100%;
	}

	.nav-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		width: 100%;
		text-align: left;
		cursor: pointer;
		padding: 1rem 1.1rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		text-decoration: none;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, background 0.2s ease;
		font: inherit;
		color: inherit;
	}

	.nav-card:hover {
		border-color: var(--highlight);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
		background: var(--bg-secondary);
	}

	@media (prefers-reduced-motion: no-preference) {
		.nav-card:hover {
			transform: translateY(-2px);
		}
	}

	.nav-card:focus-visible {
		outline: 2px solid var(--highlight);
		outline-offset: 2px;
	}

	.nav-card.active {
		border-color: var(--highlight);
		background: rgba(244, 196, 48, 0.08);
		box-shadow: 0 2px 8px rgba(244, 196, 48, 0.12);
	}

	.nav-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		transition: background 0.2s ease, color 0.2s ease;
	}

	.nav-card:hover .nav-card-icon {
		background: var(--bg-accent);
		color: var(--text-primary);
	}

	.settings-modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		box-sizing: border-box;
	}

	.settings-modal {
		background: var(--bg-primary);
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		width: 100%;
		max-width: min(1200px, 96vw);
		max-height: 95vh;
		min-height: 80vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-sizing: border-box;
	}

	.settings-modal-iframe-wrapper {
		flex: 1;
		min-height: 0;
		overflow: auto;
		background: var(--bg-primary);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	.settings-modal-iframe-wrapper :global(iframe) {
		display: block;
	}

	.settings-modal-message {
		flex-shrink: 0;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.settings-modal-message.success {
		background: rgba(34, 197, 94, 0.12);
		border-bottom: 1px solid rgba(34, 197, 94, 0.3);
		color: #16a34a;
	}

	.settings-modal-message.error {
		background: rgba(239, 68, 68, 0.1);
		border-bottom: 1px solid rgba(239, 68, 68, 0.3);
		color: #dc2626;
	}

	.settings-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}

	.settings-modal-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.settings-modal-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.settings-modal-open-tab {
		font-size: 0.85rem;
		color: var(--text-secondary);
		text-decoration: none;
	}

	.settings-modal-open-tab:hover {
		color: var(--highlight);
	}

	.settings-modal-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: var(--bg-secondary);
		border-radius: 6px;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		color: var(--text-primary);
	}

	.settings-modal-close:hover {
		background: var(--bg-accent);
	}

	.settings-modal-iframe {
		width: 100%;
		min-width: 100%;
		min-height: 560px;
		height: 100%;
		border: none;
		display: block;
		vertical-align: top;
	}

	.nav-card-label {
		display: block;
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.3;
	}

	.nav-card-desc {
		display: block;
		font-size: 0.8rem;
		color: var(--text-muted);
		line-height: 1.4;
		margin: 0;
	}

	.sync-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.sync-heading {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.sync-summary {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0 0 1rem 0;
		padding: 0.5rem 0;
	}

	.sync-summary.sync-unavailable {
		color: var(--text-muted);
	}

	.sync-btn {
		padding: 0.5rem 1rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.sync-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.sync-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sync-muted,
	.sync-note {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin: 0.5rem 0 0 0;
	}

	.sync-accordion {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 0.75rem;
	}

	.sync-details {
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg-secondary);
	}

	.sync-details-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.6rem 0.9rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
		cursor: pointer;
		list-style: none;
	}

	.sync-details-summary::-webkit-details-marker {
		display: none;
	}

	.sync-details-summary::before {
		content: '▸ ';
		opacity: 0.6;
		transition: transform 0.2s ease;
	}

	.sync-details[open] .sync-details-summary::before {
		transform: rotate(90deg);
	}

	.sync-details-label {
		flex: 1;
	}

	.sync-details-count {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--bg-primary);
		padding: 0.2rem 0.5rem;
		border-radius: 6px;
	}

	.sync-details-inner {
		border-top: 1px solid var(--border-subtle);
		padding: 0.75rem;
		background: var(--bg-primary);
	}

	.sync-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
	}

	.sync-th-code,
	.sync-td-code {
		width: 4rem;
		vertical-align: top;
		padding: 0.35rem 0.5rem 0.35rem 0;
	}

	.sync-th-path,
	.sync-td-path {
		padding: 0.35rem 0;
		word-break: break-all;
		color: var(--text-secondary);
	}

	.sync-th-preview,
	.sync-td-preview {
		width: 5rem;
		text-align: right;
		padding-left: 0.5rem;
	}

	.sync-preview-link {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--highlight);
		text-decoration: none;
	}

	.sync-preview-link:hover {
		text-decoration: underline;
	}

	.sync-th-code,
	.sync-th-path {
		text-align: left;
		font-weight: 600;
		color: var(--text-muted);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		border-bottom: 1px solid var(--border-subtle);
		padding-bottom: 0.4rem;
	}

	.sync-code {
		display: inline-block;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.75rem;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-weight: 600;
	}

	.sync-code-modified { background: rgba(245, 158, 11, 0.2); color: #b45309; }
	.sync-code-new { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
	.sync-code-added { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
	.sync-code-deleted { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
	.sync-code-renamed { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
	.sync-code-copied { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
	.sync-code-unmerged { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
	.sync-code-changed { background: var(--bg-secondary); color: var(--text-secondary); }

	.sync-pagination {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
	}

	.sync-page-btn {
		padding: 0.35rem 0.65rem;
		font-size: 0.8rem;
		border: 1px solid var(--border-subtle);
		background: var(--bg-secondary);
		border-radius: 6px;
		cursor: pointer;
		color: var(--text-primary);
	}

	.sync-page-btn:hover:not(:disabled) {
		border-color: var(--highlight);
	}

	.sync-page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sync-page-info {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.activity-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.activity-item {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--border-subtle);
		font-size: 0.875rem;
	}

	.activity-item:last-child {
		border-bottom: none;
	}

	.activity-message {
		color: var(--text-primary);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.activity-meta {
		color: var(--text-muted);
		font-size: 0.8rem;
		white-space: nowrap;
	}

	.getting-started-section {
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 0.5rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.getting-started-section:hover {
		border-color: rgba(31, 41, 55, 0.12);
	}

	.getting-started-section summary {
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		list-style: none;
		transition: color 0.2s ease, background 0.2s ease;
	}

	.getting-started-section summary:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.getting-started-section summary::-webkit-details-marker {
		display: none;
	}

	.getting-started-section summary::before {
		content: '▸ ';
		display: inline-block;
		transition: transform 0.2s ease;
	}

	.getting-started-section[open] summary::before {
		transform: rotate(90deg);
	}

	.getting-started-inner {
		padding: 0 1rem 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	.getting-started-inner p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0 0 0.5rem 0;
	}

	.getting-started-inner ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.getting-started-inner li {
		margin-bottom: 0.35rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.getting-started-inner a {
		color: var(--text-primary);
		font-weight: 500;
		text-decoration: none;
	}

	.getting-started-inner a:hover {
		color: var(--highlight);
	}

	.about-section {
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		overflow: hidden;
		transition: border-color 0.2s ease;
	}

	.about-section:hover {
		border-color: rgba(31, 41, 55, 0.12);
	}

	.about-section summary {
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		list-style: none;
		transition: color 0.2s ease, background 0.2s ease;
	}

	.about-section summary:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.about-section summary::-webkit-details-marker {
		display: none;
	}

	.about-section summary::before {
		content: '▸ ';
		display: inline-block;
		transition: transform 0.2s ease;
	}

	.about-section[open] summary::before {
		transform: rotate(90deg);
	}

	.about-inner {
		padding: 0 1rem 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	.about-inner p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0.75rem 0 0 0;
	}

	.about-inner p.platform-tagline {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text-primary);
		margin-bottom: 0.75rem;
	}

	.about-inner p.about-paths {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.about-inner code {
		background: var(--bg-secondary);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		font-size: 0.9rem;
	}

	.alert-error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #dc2626;
	}
</style>
