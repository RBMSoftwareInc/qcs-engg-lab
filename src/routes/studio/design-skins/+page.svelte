<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';

	interface DesignSkin {
		name: string;
		path: string;
		tokens: any;
		sha?: string;
	}

	let skins = $state<DesignSkin[]>([]);
	let activeSkin = $state<string | null>(null);
	let loading = $state(true);
	let isStaticBuild = $state(false);
	let showImportModal = $state(false);
	let showCreateModal = $state(false);
	let importFileId = $state('');
	let importName = $state('');
	let importLoading = $state(false);
	let createName = $state('');
	let createTokens = $state('{}');
	let createLoading = $state(false);
	let error = $state<string | null>(null);

	onMount(async () => {
		loading = false;
		
		try {
			const apiAvailable = await checkApiAvailable();
			if (!apiAvailable) {
				isStaticBuild = true;
				return;
			}
			
			await loadSkins();
		} catch (error) {
			isStaticBuild = true;
			console.warn('Studio not available on static hosting');
		}
	});

	async function loadSkins() {
		loading = true;
		error = null;
		
		try {
			const response = await fetch('/studio/api/design-skins');
			const { data, isHtml } = await safeJsonParse<{ skins: DesignSkin[]; activeSkin: string | null }>(response);
			
			if (isHtml || !data) {
				isStaticBuild = true;
				loading = false;
				return;
			}
			
			skins = data.skins || [];
			activeSkin = data.activeSkin || null;
		} catch (err: any) {
			error = err.message || 'Failed to load design skins';
			console.error('Failed to load skins:', err);
		} finally {
			loading = false;
		}
	}

	async function setActiveSkin(skinName: string) {
		try {
			const response = await fetch('/studio/api/design-skins/active', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ skin: skinName })
			});

			const { data, isHtml } = await safeJsonParse<{ success: boolean; message?: string }>(response);
			
			if (isHtml || !data?.success) {
				error = 'Failed to set active skin';
				return;
			}

			activeSkin = skinName;
			await loadSkins(); // Reload to get updated state
		} catch (err: any) {
			error = err.message || 'Failed to set active skin';
		}
	}

	async function handleFigmaImport() {
		if (!importFileId.trim()) {
			error = 'Figma file ID is required';
			return;
		}

		importLoading = true;
		error = null;

		try {
			const response = await fetch('/studio/api/design-skins/figma-import', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fileId: importFileId.trim(),
					name: importName.trim() || undefined
				})
			});

			const { data, isHtml } = await safeJsonParse<{ success: boolean; message?: string; errors?: string[] }>(response);
			
			if (isHtml || !data?.success) {
				error = data?.message || 'Failed to import from Figma';
				if (data?.errors) {
					error += ': ' + data.errors.join(', ');
				}
				return;
			}

			showImportModal = false;
			importFileId = '';
			importName = '';
			await loadSkins();
		} catch (err: any) {
			error = err.message || 'Failed to import from Figma';
		} finally {
			importLoading = false;
		}
	}

	async function handleCreateSkin() {
		if (!createName.trim()) {
			error = 'Skin name is required';
			return;
		}

		let tokens;
		try {
			tokens = JSON.parse(createTokens);
		} catch (e) {
			error = 'Invalid JSON for tokens';
			return;
		}

		createLoading = true;
		error = null;

		try {
			const response = await fetch('/studio/api/design-skins/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: createName.trim(),
					tokens
				})
			});

			const { data, isHtml } = await safeJsonParse<{ success: boolean; message?: string; errors?: string[] }>(response);
			
			if (isHtml || !data?.success) {
				error = data?.message || 'Failed to create skin';
				if (data?.errors) {
					error += ': ' + data.errors.join(', ');
				}
				return;
			}

			showCreateModal = false;
			createName = '';
			createTokens = '{}';
			await loadSkins();
		} catch (err: any) {
			error = err.message || 'Failed to create skin';
		} finally {
			createLoading = false;
		}
	}

	function getTokenCount(skin: DesignSkin): number {
		const tokens = skin.tokens || {};
		return (
			(Object.keys(tokens.colors || {}).length) +
			(Object.keys(tokens.fonts || {}).length) +
			(Object.keys(tokens.spacing || {}).length)
		);
	}
</script>

<svelte:head>
	<title>Design Skins | QCS Studio</title>
</svelte:head>

<div class="studio-page">
	<div class="page-header">
		<div class="header-content">
			<div>
				<h1>Design Skins</h1>
				<p class="page-description">
					Manage design tokens and skins. Import from Figma or create manually.
					Skins are committed to Git and applied at build time.
				</p>
			</div>
			<div class="header-actions">
				<button class="btn-secondary" onclick={() => showImportModal = true}>
					Import from Figma
				</button>
				<button class="btn-primary" onclick={() => showCreateModal = true}>
					+ Create Skin
				</button>
			</div>
		</div>
	</div>

	{#if isStaticBuild}
		<div class="static-build-notice">
			<h2>Studio Not Available</h2>
			<p>QCS Studio requires server-side capabilities and cannot run on static hosting.</p>
		</div>
	{:else if loading}
		<div class="loading">Loading design skins...</div>
	{:else if error}
		<div class="error-notice">
			<p>{error}</p>
			<button onclick={() => { error = null; loadSkins(); }}>Retry</button>
		</div>
	{:else if skins.length === 0}
		<div class="empty-state">
			<p>No design skins found.</p>
			<p class="empty-hint">Create a skin manually or import from Figma to get started.</p>
			<div class="empty-actions">
				<button class="btn-secondary" onclick={() => showImportModal = true}>
					Import from Figma
				</button>
				<button class="btn-primary" onclick={() => showCreateModal = true}>
					Create First Skin
				</button>
			</div>
		</div>
	{:else}
		<div class="skins-grid">
			{#each skins as skin}
				<div class="skin-card" class:active={activeSkin === skin.name}>
					<div class="skin-header">
						<h3 class="skin-name">{skin.name}</h3>
						{#if activeSkin === skin.name}
							<span class="active-badge">Active</span>
						{/if}
					</div>
					<div class="skin-stats">
						<div class="stat">
							<span class="stat-label">Colors</span>
							<span class="stat-value">{Object.keys(skin.tokens?.colors || {}).length}</span>
						</div>
						<div class="stat">
							<span class="stat-label">Fonts</span>
							<span class="stat-value">{Object.keys(skin.tokens?.fonts || {}).length}</span>
						</div>
						<div class="stat">
							<span class="stat-label">Spacing</span>
							<span class="stat-value">{Object.keys(skin.tokens?.spacing || {}).length}</span>
						</div>
					</div>
					<div class="skin-actions">
						{#if activeSkin !== skin.name}
							<button 
								class="btn-activate"
								onclick={() => setActiveSkin(skin.name)}
							>
								Set as Active
							</button>
						{:else}
							<button class="btn-active" disabled>
								Currently Active
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Figma Import Modal -->
{#if showImportModal}
	<div class="modal-overlay" onclick={() => showImportModal = false}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Import from Figma</h2>
				<button class="modal-close" onclick={() => showImportModal = false}>×</button>
			</div>
			<div class="modal-body">
				<p class="modal-description">
					Enter your Figma file ID to import design tokens (colors, typography, spacing).
					The file ID is in the Figma URL: <code>figma.com/file/FILE_ID/...</code>
				</p>
				<div class="form-group">
					<label for="figma-file-id">Figma File ID *</label>
					<input
						id="figma-file-id"
						type="text"
						bind:value={importFileId}
						placeholder="abc123def456"
						disabled={importLoading}
					/>
				</div>
				<div class="form-group">
					<label for="import-name">Skin Name (optional)</label>
					<input
						id="import-name"
						type="text"
						bind:value={importName}
						placeholder="my-design-skin"
						disabled={importLoading}
					/>
					<small>If not provided, a name will be generated from the file ID.</small>
				</div>
				{#if error}
					<div class="form-error">{error}</div>
				{/if}
			</div>
			<div class="modal-footer">
				<button class="btn-secondary" onclick={() => showImportModal = false} disabled={importLoading}>
					Cancel
				</button>
				<button class="btn-primary" onclick={handleFigmaImport} disabled={importLoading || !importFileId.trim()}>
					{importLoading ? 'Importing...' : 'Import'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Create Skin Modal -->
{#if showCreateModal}
	<div class="modal-overlay" onclick={() => showCreateModal = false}>
		<div class="modal modal-large" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Create Design Skin</h2>
				<button class="modal-close" onclick={() => showCreateModal = false}>×</button>
			</div>
			<div class="modal-body">
				<p class="modal-description">
					Create a design skin manually by providing design tokens in JSON format.
				</p>
				<div class="form-group">
					<label for="create-name">Skin Name *</label>
					<input
						id="create-name"
						type="text"
						bind:value={createName}
						placeholder="my-design-skin"
						disabled={createLoading}
					/>
				</div>
				<div class="form-group">
					<label for="create-tokens">Design Tokens (JSON) *</label>
					<textarea
						id="create-tokens"
						bind:value={createTokens}
						placeholder={"{\"colors\": {\"primary\": \"#000\"}, \"fonts\": {\"body\": \"Arial\"}, \"spacing\": {\"md\": \"16px\"}}"}
						disabled={createLoading}
						rows="12"
					></textarea>
					<small>Provide tokens in JSON format with colors, fonts, and spacing.</small>
				</div>
				{#if error}
					<div class="form-error">{error}</div>
				{/if}
			</div>
			<div class="modal-footer">
				<button class="btn-secondary" onclick={() => showCreateModal = false} disabled={createLoading}>
					Cancel
				</button>
				<button class="btn-primary" onclick={handleCreateSkin} disabled={createLoading || !createName.trim()}>
					{createLoading ? 'Creating...' : 'Create Skin'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.studio-page {
		width: 100%;
		background: var(--bg-primary);
		min-height: 100%;
	}

	.page-header {
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
		padding: 2.5rem 0;
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	.page-description {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.btn-primary, .btn-secondary, .btn-activate, .btn-active {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.95rem;
	}

	.btn-primary {
		background: var(--text-primary);
		color: var(--bg-primary);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--bg-primary);
		border-color: var(--text-primary);
	}

	.btn-activate {
		background: var(--highlight);
		color: var(--bg-primary);
		width: 100%;
	}

	.btn-activate:hover {
		opacity: 0.9;
	}

	.btn-active {
		background: var(--bg-secondary);
		color: var(--text-secondary);
		width: 100%;
		cursor: not-allowed;
	}

	.loading, .error-notice, .static-build-notice, .empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bg-secondary);
		border-radius: 12px;
		border: 1px solid var(--border-subtle);
		margin: 2rem 0;
	}

	.error-notice {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
		color: #ef4444;
	}

	.empty-hint {
		color: var(--text-secondary);
		margin-top: 0.5rem;
	}

	.empty-actions {
		margin-top: 2rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.skins-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.skin-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 1.5rem;
		transition: all 0.2s ease;
	}

	.skin-card.active {
		border-color: var(--highlight);
		box-shadow: 0 0 0 2px rgba(var(--highlight-rgb, 244, 196, 48), 0.2);
	}

	.skin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.skin-name {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.active-badge {
		padding: 0.25rem 0.75rem;
		background: var(--highlight);
		color: var(--bg-primary);
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.skin-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 6px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.skin-actions {
		margin-top: 1rem;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2rem;
	}

	.modal {
		background: var(--bg-primary);
		border-radius: 12px;
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-large {
		max-width: 700px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: var(--text-secondary);
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-close:hover {
		color: var(--text-primary);
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-description {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.modal-description code {
		background: var(--bg-secondary);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9em;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.95rem;
	}

	.form-group textarea {
		font-family: 'IBM Plex Mono', monospace;
		resize: vertical;
	}

	.form-group small {
		display: block;
		margin-top: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.form-error {
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		color: #ef4444;
		margin-top: 1rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid var(--border-subtle);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
		}

		.header-actions {
			width: 100%;
		}

		.header-actions button {
			flex: 1;
		}

		.skins-grid {
			grid-template-columns: 1fr;
		}

		.modal {
			margin: 1rem;
			max-width: calc(100% - 2rem);
		}
	}
</style>
