<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import TipTapEditor from '$lib/components/studio/TipTapEditor.svelte';
	import ContentPreview from '$lib/components/studio/ContentPreview.svelte';
	import DiffView from '$lib/components/studio/DiffView.svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	let { data } = $props();

	let title = $state(data.file.metadata.title || '');
	let description = $state(data.file.metadata.description || '');
	let status = $state(data.file.metadata.status || 'draft');
	let order = $state(data.file.metadata.order || '');
	let publishAt = $state('');
	let content = $state(data.file.content);
	let originalContent = $state(data.file.content); // Store original for diff
	let saving = $state(false);
	let error = $state('');
	let success = $state(false);
	let lastSaved = $state<Date | null>(null);
	let submittingForReview = $state(false);
	let submitForReviewSuccess = $state<string | null>(null);
	
	// View modes: 'edit' | 'preview' | 'split' | 'diff'
	let viewMode = $state<'edit' | 'preview' | 'split' | 'diff'>('edit');
	let showSkinPreview = $state(false);
	
	// Revision history
	let historyOpen = $state(false);
	let historyCommits = $state<{ sha: string; message: string; authorName: string; date: string }[]>([]);
	let historyLoading = $state(false);
	let restoring = $state(false);
	
	// Autosave
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let hasUnsavedChanges = $state(false);

	// AI: editor ref and status (ref to TipTapEditor for getMarkdown/insertAtEnd/replaceSelection)
	let editorRef: { getMarkdown(): string; getSelectedText(): string; insertAtEnd(markdown: string): void; replaceSelection(markdown: string): void } | null = $state(null);
	let aiAvailable = $state(false);
	let aiLoading = $state(false);
	let aiError = $state('');

	// Parse frontmatter from full content
	const frontmatterKeys = Object.keys(data.file.metadata);

	// Editor utilities: word/char count, view-on-site URL
	const wordCount = $derived(content.trim() ? content.trim().split(/\s+/).length : 0);
	const charCount = $derived(content.length);
	const viewOnSitePath = $derived(
		data.file.relativePath === 'hero/intro.md' ? '/' : '/' + data.file.relativePath.replace(/\.md$/, '')
	);
	
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
			if (publishAt) frontmatter.publishAt = new Date(publishAt).toISOString();
			
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
	
	// Load draft from localStorage on mount; init publishAt from metadata; check AI status
	onMount(() => {
		const v = data.file.metadata?.publishAt;
		if (v) {
			const d = new Date(v);
			if (!isNaN(d.getTime())) publishAt = d.toISOString().slice(0, 16);
		}
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
		// AI status
		fetch('/studio/api/ai/status')
			.then((r) => r.json())
			.then((d) => { aiAvailable = !!d?.available; })
			.catch(() => {});
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
			if (publishAt) frontmatter.publishAt = new Date(publishAt).toISOString();

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

			const { data: result, isHtml } = await safeJsonParse<{ success: boolean; message?: string }>(response);
			
			if (isHtml || !result) {
				error = 'Studio API not available. Studio requires server-side deployment.';
				saving = false;
				return;
			}

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

	function buildFullContent(): string {
		const frontmatter: Record<string, any> = {
			title,
			status,
			...data.file.metadata
		};
		if (description) frontmatter.description = description;
		if (order) frontmatter.order = parseInt(order) || undefined;
		if (publishAt) frontmatter.publishAt = new Date(publishAt).toISOString();
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
		return `---\n${frontmatterStr}\n---\n\n${content}`;
	}

	async function handleSubmitForReview() {
		const errs = validateContent();
		if (errs.length > 0) {
			error = errs[0];
			return;
		}
		submittingForReview = true;
		error = '';
		submitForReviewSuccess = null;
		try {
			const fullContent = buildFullContent();
			const res = await fetch('/studio/api/change-requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim() || data.file.title || data.file.relativePath,
					description: description.trim() || undefined,
					files: [{ path: data.file.relativePath, content: fullContent }]
				})
			});
			const { data: result, isHtml } = await safeJsonParse<{ success?: boolean; changeRequest?: { id: string } }>(res);
			if (isHtml || !result) {
				error = 'Studio API not available.';
				return;
			}
			if (result.success && result.changeRequest?.id) {
				submitForReviewSuccess = result.changeRequest.id;
				setTimeout(() => { submitForReviewSuccess = null; }, 8000);
			} else {
				error = (result as any)?.message ?? 'Failed to submit for review';
			}
		} catch (e: any) {
			error = e.message ?? 'Failed to submit for review';
		} finally {
			submittingForReview = false;
		}
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

	const contentPath = 'content/' + data.file.relativePath;

	async function loadHistory() {
		historyOpen = true;
		historyLoading = true;
		historyCommits = [];
		try {
			const res = await fetch(`/studio/api/content/history?path=${encodeURIComponent(contentPath)}`);
			const { data: result, isHtml } = await safeJsonParse<{ commits?: { sha: string; message: string; authorName: string; date: string }[] }>(res);
			if (!isHtml && result?.commits) historyCommits = result.commits;
		} catch {
			// ignore
		} finally {
			historyLoading = false;
		}
	}

	async function restoreVersion(sha: string) {
		restoring = true;
		error = '';
		try {
			const res = await fetch('/studio/api/content/restore', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: contentPath, sha })
			});
			const { data: result, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && result?.success) {
				historyOpen = false;
				window.location.reload();
				return;
			}
			error = (result as any)?.message ?? 'Restore failed';
		} catch (e: any) {
			error = e.message ?? 'Restore failed';
		} finally {
			restoring = false;
		}
	}

	function handleSchedulePublish() {
		if (!publishAt) {
			error = 'Pick a date and time to schedule';
			return;
		}
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}
		if (!content.trim()) {
			error = 'Content cannot be empty';
			return;
		}
		status = 'draft';
		handleSave();
	}

	// --- AI actions (suggest, meta description, transform) ---
	async function aiSuggestNext() {
		if (!editorRef || !aiAvailable) return;
		aiLoading = true;
		aiError = '';
		try {
			const body = { content, cursorContext: editorRef.getSelectedText() || content.slice(-400) };
			const res = await fetch('/studio/api/ai/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
			const data = await res.json().catch(() => ({}));
			if (data.suggestion) editorRef.insertAtEnd(data.suggestion);
			else aiError = data.error || 'No suggestion';
		} catch (e) {
			aiError = e instanceof Error ? e.message : 'Request failed';
		} finally {
			aiLoading = false;
		}
	}
	async function aiMetaDescription() {
		if (!aiAvailable) return;
		aiLoading = true;
		aiError = '';
		try {
			const res = await fetch('/studio/api/ai/meta-description', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, title }) });
			const data = await res.json().catch(() => ({}));
			if (data.description) description = data.description;
			else aiError = data.error || 'No description';
		} catch (e) {
			aiError = e instanceof Error ? e.message : 'Request failed';
		} finally {
			aiLoading = false;
		}
	}
	async function aiTransform(op: 'shorten' | 'expand' | 'formal' | 'casual') {
		if (!editorRef || !aiAvailable) return;
		const text = editorRef.getSelectedText() || content;
		if (!text.trim()) { aiError = 'Select text or add content first'; return; }
		aiLoading = true;
		aiError = '';
		try {
			const res = await fetch('/studio/api/ai/transform', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text, operation: op }) });
			const data = await res.json().catch(() => ({}));
			if (data.text) editorRef.replaceSelection(data.text);
			else aiError = data.error || 'Transform failed';
		} catch (e) {
			aiError = e instanceof Error ? e.message : 'Request failed';
		} finally {
			aiLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Edit: {title} | QCS Studio</title>
</svelte:head>

<div class="editor-page">
	<div class="editor-header">
		<div class="header-left">
			<a href="/studio" class="back-link">← Back to Content</a>
			<div class="header-title-block">
				<span class="editor-label">Edit Content</span>
				<h1 class="editor-doc-title">{title || 'Untitled'}</h1>
				<p class="editor-subtitle">Modify frontmatter and body. Changes are saved to Git automatically.</p>
			</div>
		</div>
		<div class="header-actions">
			<div class="view-mode-group">
				<span class="view-mode-label">View</span>
				<div class="view-mode-toggle">
				<button
					class="mode-btn"
					class:active={viewMode === 'edit'}
					onclick={() => viewMode = 'edit'}
					title="Edit Mode"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
					</svg>
					<span>Edit</span>
				</button>
				<button
					class="mode-btn"
					class:active={viewMode === 'preview'}
					onclick={() => viewMode = 'preview'}
					title="Preview Mode"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
						<circle cx="12" cy="12" r="3"></circle>
					</svg>
					<span>Preview</span>
				</button>
				<button
					class="mode-btn"
					class:active={viewMode === 'split'}
					onclick={() => viewMode = 'split'}
					title="Split View"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="12" y1="3" x2="12" y2="21"></line>
					</svg>
					<span>Split</span>
				</button>
				<button
					class="mode-btn"
					class:active={viewMode === 'diff'}
					onclick={() => viewMode = 'diff'}
					title="Compare with Live"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 3v18M3 12h18"></path>
					</svg>
					<span>Diff</span>
				</button>
				</div>
			</div>
			<div class="save-actions">
				{#if hasUnsavedChanges}
					<span class="unsaved-indicator">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"></circle>
						</svg>
						Unsaved changes
					</span>
				{/if}
				{#if lastSaved}
					<span class="last-saved">Saved {lastSaved.toLocaleTimeString()}</span>
				{/if}
				<button class="save-btn" onclick={handleSave} disabled={saving} title="Save as Draft">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
						<polyline points="17 21 17 13 7 13 7 21"></polyline>
						<polyline points="7 3 7 8 15 8"></polyline>
					</svg>
					<span>{saving ? 'Saving...' : 'Save Draft'}</span>
				</button>
				<button class="publish-btn" onclick={handlePublish} disabled={saving} title="Publish to Live">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
						<circle cx="12" cy="12" r="10"></circle>
					</svg>
					<span>Publish</span>
				</button>
				<button class="submit-review-btn" onclick={handleSubmitForReview} disabled={submittingForReview} title="Submit for admin review">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
						<polyline points="14 2 14 8 20 8"></polyline>
						<line x1="16" y1="13" x2="8" y2="13"></line>
						<line x1="16" y1="17" x2="8" y2="17"></line>
					</svg>
					<span>{submittingForReview ? 'Submitting…' : 'Submit for review'}</span>
				</button>
			</div>
		</div>
	</div>

	{#if submitForReviewSuccess}
		<div class="alert alert-success">
			Review submitted. <a href="/studio/requests/{submitForReviewSuccess}">View review</a> · <a href="/studio/requests">All reviews</a>
		</div>
	{/if}
	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if success}
		<div class="alert alert-success">Content saved successfully!</div>
	{/if}

	<div class="editor-layout">
		<aside class="editor-sidebar">
			<h2 class="sidebar-heading">Metadata</h2>
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

			<div class="form-group">
				<label for="publishAt">Schedule publish</label>
				<input type="datetime-local" id="publishAt" bind:value={publishAt} class="schedule-input" />
				<small>Optional. Save as draft with this date; run the scheduled publish job to go live at that time.</small>
				{#if publishAt}
					<button type="button" class="schedule-btn" onclick={handleSchedulePublish} disabled={saving}>Save schedule</button>
				{/if}
			</div>

			<div class="form-group">
				<button type="button" class="history-btn" onclick={loadHistory} title="View revision history">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
					<span>History</span>
				</button>
				{#if historyOpen}
					<div class="history-panel">
						{#if historyLoading}
							<p class="history-loading">Loading…</p>
						{:else}
							<ul class="history-list">
								{#each historyCommits as commit}
									<li class="history-item">
										<span class="history-msg">{commit.message}</span>
										<span class="history-meta">{commit.authorName} · {new Date(commit.date).toLocaleString()}</span>
										<button type="button" class="history-restore-btn" onclick={() => restoreVersion(commit.sha)} disabled={restoring} title="Restore this version">Restore</button>
									</li>
								{/each}
							</ul>
							{#if historyCommits.length === 0 && !historyLoading}
								<p class="history-empty">No history yet</p>
							{/if}
						{/if}
						<button type="button" class="history-close" onclick={() => historyOpen = false}>Close</button>
					</div>
				{/if}
			</div>

			{#if viewMode === 'preview' || viewMode === 'split'}
				<div class="form-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={showSkinPreview} />
						<span>Preview with Design Skin</span>
					</label>
					<small>Apply active design skin CSS to preview</small>
				</div>
			{/if}

			{#if aiAvailable}
				<div class="form-group ai-actions">
					<h3 class="editor-utils-heading">AI</h3>
					{#if aiError}<p class="ai-error">{aiError}</p>{/if}
					<div class="ai-buttons">
						<button type="button" class="ai-btn" onclick={aiSuggestNext} disabled={aiLoading} title="Append a suggested next paragraph">Suggest next</button>
						<button type="button" class="ai-btn" onclick={aiMetaDescription} disabled={aiLoading} title="Generate meta description into sidebar">Meta description</button>
						<button type="button" class="ai-btn" onclick={() => aiTransform('shorten')} disabled={aiLoading} title="Shorten selected text">Shorten</button>
						<button type="button" class="ai-btn" onclick={() => aiTransform('expand')} disabled={aiLoading} title="Expand selected text">Expand</button>
						<button type="button" class="ai-btn" onclick={() => aiTransform('formal')} disabled={aiLoading} title="Make selected text formal">Formal</button>
						<button type="button" class="ai-btn" onclick={() => aiTransform('casual')} disabled={aiLoading} title="Make selected text casual">Casual</button>
					</div>
				</div>
			{/if}

			<div class="editor-utils">
				<h3 class="editor-utils-heading">Counts</h3>
				<p class="editor-utils-row"><span>{wordCount}</span> words · <span>{charCount}</span> characters</p>
			</div>

			{#if status === 'live'}
				<div class="editor-utils">
					<a href={viewOnSitePath} target="_blank" rel="noopener noreferrer" class="view-on-site-link">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
						View on site
					</a>
				</div>
			{/if}

			<div class="file-info">
				<p><strong>Path:</strong> <code>{data.file.relativePath}</code></p>
				<p><strong>Slug:</strong> <code>{data.file.slug}</code></p>
			</div>
		</aside>

		<div class="editor-main">
			<h2 class="main-heading">Body</h2>
			{#if viewMode === 'edit'}
				<TipTapEditor
					bind:this={editorRef}
					content={content}
					onUpdate={handleContentUpdate}
					placeholder="Write your content here..."
				/>
			{:else if viewMode === 'preview'}
				<div class="preview-container">
					<ContentPreview markdown={content} showSkinPreview={showSkinPreview} />
				</div>
			{:else if viewMode === 'split'}
				<div class="split-container">
					<div class="split-editor">
						<TipTapEditor
							bind:this={editorRef}
							content={content}
							onUpdate={handleContentUpdate}
							placeholder="Write your content here..."
						/>
					</div>
					<div class="split-preview">
						<ContentPreview markdown={content} showSkinPreview={showSkinPreview} />
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
		background: var(--bg-primary);
		min-height: 100%;
	}

	.editor-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1.5rem;
		background: var(--bg-primary);
		padding: 2rem 0;
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.header-left {
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		flex: 1;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s ease;
		padding: 0.5rem 0;
	}

	.back-link:hover {
		color: var(--text-primary);
	}

	.back-link::before {
		content: '';
		width: 16px;
		height: 16px;
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M19 12H5M12 19l-7-7 7-7'%3E%3C/path%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.back-link:hover::before {
		opacity: 1;
	}

	.editor-label {
		display: block;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.editor-doc-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.35rem 0;
		color: var(--text-primary);
		letter-spacing: -0.02em;
		line-height: 1.3;
	}

	.editor-subtitle {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.header-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 1.25rem;
	}

	.view-mode-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.view-mode-label {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text-muted);
	}

	.view-mode-toggle {
		display: inline-flex;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 2px;
	}

	.mode-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s, color 0.2s;
	}

	.mode-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.6);
	}

	.mode-btn.active {
		background: var(--bg-primary);
		color: var(--text-primary);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	}

	.save-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.unsaved-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.unsaved-indicator svg {
		fill: var(--highlight);
		stroke: var(--highlight);
		flex-shrink: 0;
	}

	.last-saved {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.save-actions .save-btn,
	.save-actions .publish-btn,
	.save-actions .submit-review-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
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

	.submit-review-btn {
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--border-subtle);
		background: transparent;
		color: var(--text-primary);
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		gap: 0.5rem;
	}
	.submit-review-btn:hover:not(:disabled) {
		background: var(--bg-secondary);
	}
	.submit-review-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		padding: 1.5rem;
		height: fit-content;
		position: sticky;
		top: 100px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.sidebar-heading {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		margin: 0 0 1.25rem 0;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.editor-main .main-heading {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		margin: 0 0 0.75rem 0;
	}

	.file-info code {
		font-size: 0.8em;
		background: var(--bg-primary);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
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

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-label input[type="checkbox"] {
		width: auto;
		margin: 0;
		cursor: pointer;
	}

	.form-group small {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.editor-utils {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border-subtle);
	}

	.editor-utils-heading {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		margin: 0 0 0.5rem 0;
	}

	.ai-actions { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); }
	.ai-error { font-size: 0.8rem; color: var(--error, #dc2626); margin: 0 0 0.5rem 0; }
	.ai-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.ai-btn {
		padding: 0.4rem 0.65rem;
		font-size: 0.8rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
		color: var(--text-primary);
	}
	.ai-btn:hover:not(:disabled) { border-color: var(--highlight); background: rgba(244, 196, 48, 0.08); }
	.ai-btn:disabled { opacity: 0.6; cursor: not-allowed; }

	.editor-utils-row {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.view-on-site-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
		text-decoration: none;
		padding: 0.4rem 0;
	}

	.view-on-site-link:hover {
		color: var(--highlight);
	}

	.schedule-input {
		width: 100%;
	}
	.schedule-btn {
		margin-top: 0.5rem;
		padding: 0.4rem 0.75rem;
		font-size: 0.85rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
	}
	.schedule-btn:hover { background: var(--border-subtle); }
	.history-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.9rem;
		cursor: pointer;
		width: 100%;
	}
	.history-btn:hover { background: var(--border-subtle); }
	.history-panel {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		max-height: 280px;
		overflow-y: auto;
	}
	.history-loading, .history-empty { font-size: 0.9rem; color: var(--text-muted); margin: 0; }
	.history-list { list-style: none; padding: 0; margin: 0; }
	.history-item {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-subtle);
		font-size: 0.85rem;
	}
	.history-item:last-child { border-bottom: none; }
	.history-msg { flex: 1 1 100%; font-weight: 500; }
	.history-meta { color: var(--text-muted); font-size: 0.8rem; }
	.history-restore-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		background: var(--highlight);
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.history-restore-btn:hover:not(:disabled) { opacity: 0.9; }
	.history-restore-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.history-close {
		margin-top: 0.5rem;
		padding: 0.35rem 0.75rem;
		font-size: 0.85rem;
		background: transparent;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
	}

	.file-info {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
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
		.editor-header {
			flex-direction: column;
			align-items: stretch;
		}

		.header-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.view-mode-group {
			justify-content: flex-start;
		}

		.save-actions {
			justify-content: flex-start;
		}

		.editor-layout {
			grid-template-columns: 1fr;
		}

		.editor-sidebar {
			position: static;
		}
	}

	@media (max-width: 640px) {
		.view-mode-toggle {
			flex-wrap: wrap;
		}

		.mode-btn span {
			display: none;
		}
	}
</style>

