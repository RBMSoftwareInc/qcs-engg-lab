<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import TipTapEditor from '$lib/components/studio/TipTapEditor.svelte';
	import ContentPreview from '$lib/components/studio/ContentPreview.svelte';
	import DiffView from '$lib/components/studio/DiffView.svelte';

	let { data } = $props<PageData>();

	let title = $state(data.file.metadata.title || '');
	let description = $state(data.file.metadata.description || '');
	let status = $state(data.file.metadata.status || 'draft');
	let order = $state(data.file.metadata.order || '');
	let content = $state(data.file.content);
	let originalContent = $state(data.file.content); // Store original for diff
	let saving = $state(false);
	let error = $state('');
	let success = $state(false);
	let lastSaved = $state<Date | null>(null);
	
	// View modes: 'edit' | 'preview' | 'split' | 'diff'
	let viewMode = $state<'edit' | 'preview' | 'split' | 'diff'>('edit');
	
	// Autosave
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let hasUnsavedChanges = $state(false);

	// Parse frontmatter from full content
	const frontmatterKeys = Object.keys(data.file.metadata);
	
	function handleContentUpdate(markdown: string) {
		content = markdown;
		hasUnsavedChanges = true;
		
		// Clear existing timer
		if (autosaveTimer) {
			clearTimeout(autosaveTimer);
		}
		
		// Autosave after 2 seconds of inactivity
		autosaveTimer = setTimeout(() => {
			handleAutosave();
		}, 2000);
	}
	
	async function handleAutosave() {
		if (!hasUnsavedChanges) return;
		
		try {
			const frontmatter: Record<string, any> = {
				title,
				status,
				...data.file.metadata
			};
			
			if (description) frontmatter.description = description;
			if (order) frontmatter.order = parseInt(order) || undefined;
			
			const frontmatterStr = Object.entries(frontmatter)
				.map(([key, value]) => {
					if (value === undefined || value === null) return '';
					if (typeof value === 'string' && value.includes('\n')) {
						return `${key}: |\n  ${value.split('\n').join('\n  ')}`;
					}
					return `${key}: ${JSON.stringify(value)}`;
				})
				.filter(Boolean)
				.join('\n');
			
			const fullContent = `---\n${frontmatterStr}\n---\n\n${content}`;
			
			// Save to localStorage as draft
			localStorage.setItem(`studio-draft-${data.file.slug}`, fullContent);
			hasUnsavedChanges = false;
		} catch (err) {
			console.error('Autosave failed:', err);
		}
	}
	
	// Load draft from localStorage on mount
	onMount(() => {
		const draft = localStorage.getItem(`studio-draft-${data.file.slug}`);
		if (draft) {
			// Parse draft and restore content
			// For now, just restore the markdown body
			const match = draft.match(/^---\n[\s\S]*?\n---\n\n([\s\S]*)$/);
			if (match) {
				content = match[1];
				hasUnsavedChanges = true;
			}
		}
	});
	
	async function handleSave() {
		saving = true;
		error = '';
		success = false;

		try {
			// Build frontmatter
			const frontmatter: Record<string, any> = {
				title,
				status,
				...data.file.metadata
			};

			if (description) frontmatter.description = description;
			if (order) frontmatter.order = parseInt(order) || undefined;

			// Build frontmatter string
			const frontmatterStr = Object.entries(frontmatter)
				.map(([key, value]) => {
					if (value === undefined || value === null) return '';
					if (typeof value === 'string' && value.includes('\n')) {
						return `${key}: |\n  ${value.split('\n').join('\n  ')}`;
					}
					return `${key}: ${JSON.stringify(value)}`;
				})
				.filter(Boolean)
				.join('\n');

			const fullContent = `---\n${frontmatterStr}\n---\n\n${content}`;

			const response = await fetch(`/studio/api/content/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					path: data.file.relativePath,
					content: fullContent,
					commitMessage: `Update ${data.file.title}`
				})
			});

			const result = await response.json();

			if (result.success) {
				success = true;
				lastSaved = new Date();
				hasUnsavedChanges = false;
				originalContent = content; // Update original for diff
				localStorage.removeItem(`studio-draft-${data.file.slug}`); // Clear draft
				setTimeout(() => success = false, 3000);
			} else {
				error = result.message || 'Failed to save';
			}
		} catch (err: any) {
			error = err.message || 'Failed to save content';
		} finally {
			saving = false;
		}
	}

	function handlePublish() {
		// Validate before publishing
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}
		
		if (!content.trim()) {
			error = 'Content cannot be empty';
			return;
		}
		
		status = 'live';
		handleSave();
	}
	
	function validateContent(): string[] {
		const errors: string[] = [];
		
		if (!title.trim()) {
			errors.push('Title is required');
		}
		
		if (!content.trim()) {
			errors.push('Content cannot be empty');
		}
		
		// Check for broken image links
		const imageRegex = /!\[.*?\]\((.*?)\)/g;
		const matches = content.matchAll(imageRegex);
		for (const match of matches) {
			const src = match[1];
			if (!src.startsWith('http') && !src.startsWith('/')) {
				errors.push(`Image path "${src}" may be invalid`);
			}
		}
		
		return errors;
	}
</script>

<svelte:head>
	<title>Edit: {title} | QCS Studio</title>
</svelte:head>

<div class="editor-page">
	<div class="editor-header">
		<div class="header-left">
			<a href="/studio" class="back-link">← Back</a>
			<h1>Edit Content</h1>
		</div>
		<div class="header-actions">
			<div class="view-mode-toggle">
				<button
					class="mode-btn"
					class:active={viewMode === 'edit'}
					onclick={() => viewMode = 'edit'}
					title="Edit Mode"
				>
					Edit
				</button>
				<button
					class="mode-btn"
					class:active={viewMode === 'preview'}
					onclick={() => viewMode = 'preview'}
					title="Preview Mode"
				>
					Preview
				</button>
				<button
					class="mode-btn"
					class:active={viewMode === 'split'}
					onclick={() => viewMode = 'split'}
					title="Split View"
				>
					Split
				</button>
				<button
					class="mode-btn"
					class:active={viewMode === 'diff'}
					onclick={() => viewMode = 'diff'}
					title="Compare with Live"
				>
					Diff
				</button>
			</div>
			<div class="save-actions">
				{#if hasUnsavedChanges}
					<span class="unsaved-indicator">Unsaved changes</span>
				{/if}
				{#if lastSaved}
					<span class="last-saved">Saved {lastSaved.toLocaleTimeString()}</span>
				{/if}
				<button class="save-btn" onclick={handleSave} disabled={saving}>
					{saving ? 'Saving...' : 'Save Draft'}
				</button>
				<button class="publish-btn" onclick={handlePublish} disabled={saving}>
					Publish
				</button>
			</div>
		</div>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if success}
		<div class="alert alert-success">Content saved successfully!</div>
	{/if}

	<div class="editor-layout">
		<div class="editor-sidebar">
			<div class="form-group">
				<label for="title">Title</label>
				<input type="text" id="title" bind:value={title} />
			</div>

			<div class="form-group">
				<label for="description">Description</label>
				<textarea id="description" bind:value={description} rows="3"></textarea>
			</div>

			<div class="form-group">
				<label for="status">Status</label>
				<select id="status" bind:value={status}>
					<option value="draft">Draft</option>
					<option value="review">Review</option>
					<option value="live">Live</option>
				</select>
			</div>

			<div class="form-group">
				<label for="order">Order</label>
				<input type="number" id="order" bind:value={order} />
			</div>

			<div class="file-info">
				<p><strong>Path:</strong> {data.file.relativePath}</p>
				<p><strong>Slug:</strong> {data.file.slug}</p>
			</div>
		</div>

		<div class="editor-main">
			{#if viewMode === 'edit'}
				<TipTapEditor
					content={content}
					onUpdate={handleContentUpdate}
					placeholder="Write your content here..."
				/>
			{:else if viewMode === 'preview'}
				<div class="preview-container">
					<ContentPreview markdown={content} />
				</div>
			{:else if viewMode === 'split'}
				<div class="split-container">
					<div class="split-editor">
						<TipTapEditor
							content={content}
							onUpdate={handleContentUpdate}
							placeholder="Write your content here..."
						/>
					</div>
					<div class="split-preview">
						<ContentPreview markdown={content} />
					</div>
				</div>
			{:else if viewMode === 'diff'}
				<div class="diff-container">
					<DiffView original={originalContent} modified={content} />
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.editor-page {
		width: 100%;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.back-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: var(--text-primary);
	}

	.editor-header h1 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.save-btn,
	.publish-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.save-btn {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.save-btn:hover:not(:disabled) {
		background: var(--bg-accent);
	}

	.publish-btn {
		background: var(--text-primary);
		color: var(--bg-primary);
	}

	.publish-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.save-btn:disabled,
	.publish-btn:disabled {
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

	.editor-layout {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 2rem;
	}

	.editor-sidebar {
		background: var(--bg-secondary);
		border-radius: 8px;
		padding: 1.5rem;
		height: fit-content;
		position: sticky;
		top: 100px;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--highlight);
	}

	.file-info {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-subtle);
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.file-info p {
		margin: 0.5rem 0;
		font-family: 'IBM Plex Mono', monospace;
	}

	.editor-main {
		display: flex;
		flex-direction: column;
		min-height: 600px;
	}

	.preview-container {
		flex: 1;
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		overflow: hidden;
	}

	.split-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		height: 100%;
		min-height: 600px;
	}

	.split-editor,
	.split-preview {
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		overflow: hidden;
	}

	.diff-container {
		flex: 1;
		min-height: 600px;
	}

	@media (max-width: 1024px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}

		.editor-sidebar {
			position: static;
		}
	}
</style>

