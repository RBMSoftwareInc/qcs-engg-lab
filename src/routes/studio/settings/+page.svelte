<script lang="ts">
	import { onMount } from 'svelte';

	let gitStatus = $state('');
	let loading = $state(true);
	let pulling = $state(false);
	let error = $state('');

	onMount(async () => {
		await loadStatus();
	});

	async function loadStatus() {
		loading = true;
		try {
			const response = await fetch('/studio/api/git/status');
			const data = await response.json();
			gitStatus = data.status || 'No changes';
		} catch (err) {
			error = 'Failed to load Git status';
		} finally {
			loading = false;
		}
	}

	async function handlePull() {
		pulling = true;
		error = '';
		try {
			const response = await fetch('/studio/api/git/pull', { method: 'POST' });
			const data = await response.json();
			if (data.success) {
				await loadStatus();
			} else {
				error = data.message || 'Pull failed';
			}
		} catch (err: any) {
			error = err.message || 'Pull failed';
		} finally {
			pulling = false;
		}
	}
</script>

<svelte:head>
	<title>Settings | QCS Studio</title>
</svelte:head>

<div class="settings-page">
	<h1>Settings</h1>

	<div class="settings-section">
		<h2>Git Status</h2>
		<div class="git-status">
			{#if loading}
				<p>Loading...</p>
			{:else}
				<pre class="status-output">{gitStatus || 'No changes'}</pre>
			{/if}
		</div>
		<div class="git-actions">
			<button class="pull-btn" onclick={handlePull} disabled={pulling}>
				{pulling ? 'Pulling...' : 'Pull Latest Changes'}
			</button>
		</div>
	</div>

	<div class="settings-section">
		<h2>Environment</h2>
		<div class="env-info">
			<p><strong>Content Directory:</strong> <code>/content</code></p>
			<p><strong>Media Directory:</strong> <code>/static/assets/images</code></p>
			<p><strong>Git Repository:</strong> <code>Current directory</code></p>
		</div>
	</div>

	<div class="settings-section">
		<h2>Documentation</h2>
		<div class="docs-info">
			<p>QCS Studio is a Git-native content management system.</p>
			<ul>
				<li>All content is stored as Markdown files in <code>/content</code></li>
				<li>Changes are committed and pushed to Git automatically</li>
				<li>Media files are stored in <code>/static/assets/images</code></li>
				<li>Authentication uses environment variables: <code>VITE_STUDIO_EMAIL</code> and <code>VITE_STUDIO_PASSWORD</code></li>
			</ul>
		</div>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}
</div>

<style>
	.settings-page {
		max-width: 900px;
	}

	.settings-page h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 2rem;
	}

	.settings-section {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.settings-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
	}

	.git-status {
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.status-output {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		color: var(--text-primary);
		margin: 0;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.git-actions {
		display: flex;
		gap: 1rem;
	}

	.pull-btn {
		padding: 0.75rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.pull-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.pull-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.env-info,
	.docs-info {
		color: var(--text-secondary);
		line-height: 1.7;
	}

	.env-info p,
	.docs-info p {
		margin-bottom: 0.75rem;
	}

	.env-info code,
	.docs-info code {
		background: var(--bg-secondary);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9em;
		color: var(--text-primary);
	}

	.docs-info ul {
		margin-left: 1.5rem;
		margin-top: 1rem;
	}

	.docs-info li {
		margin-bottom: 0.5rem;
	}

	.alert {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
	}

	.alert-error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #dc2626;
	}
</style>

