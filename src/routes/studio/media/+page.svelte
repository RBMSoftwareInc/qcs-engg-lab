<script lang="ts">
	import { onMount } from 'svelte';

	let files = $state<string[]>([]);
	let uploading = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(async () => {
		await loadMedia();
	});

	async function loadMedia() {
		try {
			const response = await fetch('/studio/api/media');
			const data = await response.json();
			files = data.files || [];
		} catch (err) {
			console.error('Failed to load media:', err);
		}
	}

	async function handleUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const fileList = target.files;
		if (!fileList || fileList.length === 0) return;

		uploading = true;
		error = '';
		success = '';

		try {
			const formData = new FormData();
			for (let i = 0; i < fileList.length; i++) {
				formData.append('files', fileList[i]);
			}

			const response = await fetch('/studio/api/media/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.success) {
				success = `Uploaded ${result.uploaded?.length || 0} file(s)`;
				await loadMedia();
				setTimeout(() => success = '', 3000);
			} else {
				error = result.message || 'Upload failed';
			}
		} catch (err: any) {
			error = err.message || 'Upload failed';
		} finally {
			uploading = false;
			target.value = '';
		}
	}

	function copyImagePath(file: string) {
		const path = `/assets/images/${file}`;
		navigator.clipboard.writeText(path);
		success = `Copied: ${path}`;
		setTimeout(() => success = '', 2000);
	}

	function getImageUrl(file: string) {
		return `/assets/images/${file}`;
	}
</script>

<svelte:head>
	<title>Media | QCS Studio</title>
</svelte:head>

<div class="media-page">
	<div class="page-header">
		<h1>Media</h1>
		<label class="upload-btn">
			<input type="file" multiple accept="image/*" onchange={handleUpload} disabled={uploading} />
			{uploading ? 'Uploading...' : '+ Upload Images'}
		</label>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if success}
		<div class="alert alert-success">{success}</div>
	{/if}

	{#if files.length === 0}
		<div class="empty-state">
			<p>No media files uploaded yet.</p>
			<p class="empty-hint">Upload images to use in your content.</p>
		</div>
	{:else}
		<div class="media-grid">
			{#each files as file}
				<div class="media-item">
					<div class="media-preview">
						<img src={getImageUrl(file)} alt={file} loading="lazy" />
					</div>
					<div class="media-info">
						<p class="media-name">{file}</p>
						<div class="media-actions">
							<button class="copy-btn" onclick={() => copyImagePath(file)}>
								Copy Path
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.media-page {
		width: 100%;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 600;
		margin: 0;
	}

	.upload-btn {
		padding: 0.75rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-block;
	}

	.upload-btn:hover:not(:has(input:disabled)) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.upload-btn input {
		display: none;
	}

	.upload-btn:has(input:disabled) {
		opacity: 0.6;
		cursor: not-allowed;
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

	.alert-success {
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: #059669;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--text-secondary);
	}

	.empty-hint {
		font-size: 0.9rem;
		margin-top: 0.5rem;
		color: var(--text-muted);
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.media-item {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.media-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.media-preview {
		width: 100%;
		height: 200px;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.media-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.media-info {
		padding: 1rem;
	}

	.media-name {
		font-size: 0.9rem;
		font-family: 'IBM Plex Mono', monospace;
		color: var(--text-primary);
		margin: 0 0 0.75rem 0;
		word-break: break-all;
	}

	.media-actions {
		display: flex;
		gap: 0.5rem;
	}

	.copy-btn {
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--text-primary);
	}

	.copy-btn:hover {
		background: var(--bg-accent);
		border-color: var(--highlight);
	}
</style>

