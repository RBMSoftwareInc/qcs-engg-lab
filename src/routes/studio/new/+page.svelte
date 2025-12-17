<script lang="ts">
	import { goto } from '$app/navigation';

	let title = $state('');
	let category = $state('domains');
	let slug = $state('');
	let description = $state('');
	let content = $state('');
	let creating = $state(false);
	let error = $state('');

	$effect(() => {
		// Auto-generate slug from title
		if (title && !slug) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	});

	async function handleCreate() {
		if (!title || !slug) {
			error = 'Title and slug are required';
			return;
		}

		creating = true;
		error = '';

		try {
			// Build frontmatter
			const frontmatter = {
				type: category === 'domains' ? 'domain' : category === 'services' ? 'service' : 'page',
				status: 'draft',
				title,
				description: description || undefined,
				order: undefined
			};

			const frontmatterStr = Object.entries(frontmatter)
				.map(([key, value]) => {
					if (value === undefined) return '';
					return `${key}: ${JSON.stringify(value)}`;
				})
				.filter(Boolean)
				.join('\n');

			const fullContent = `---\n${frontmatterStr}\n---\n\n${content || '# ' + title + '\n\nWrite your content here...'}`;

			const filePath = `${category}/${slug}.md`;

			const response = await fetch('/studio/api/content/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					path: filePath,
					content: fullContent,
					commitMessage: `Create new content: ${title}`
				})
			});

			const result = await response.json();

			if (result.success) {
				// Find the file and redirect to edit
				goto(`/studio/edit/${category}-${slug}`);
			} else {
				error = result.message || 'Failed to create content';
			}
		} catch (err: any) {
			error = err.message || 'Failed to create content';
		} finally {
			creating = false;
		}
	}
</script>

<svelte:head>
	<title>New Content | QCS Studio</title>
</svelte:head>

<div class="new-content-page">
	<div class="page-header">
		<a href="/studio" class="back-link">← Back</a>
		<h1>New Content</h1>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	<div class="new-content-form">
		<div class="form-group">
			<label for="category">Category</label>
			<select id="category" bind:value={category}>
				<option value="domains">Domains</option>
				<option value="services">Services</option>
				<option value="insights">Insights</option>
				<option value="signals">Signals</option>
				<option value="about">About</option>
			</select>
		</div>

		<div class="form-group">
			<label for="title">Title *</label>
			<input type="text" id="title" bind:value={title} required placeholder="Content title" />
		</div>

		<div class="form-group">
			<label for="slug">Slug *</label>
			<input type="text" id="slug" bind:value={slug} required placeholder="url-slug" />
			<small>Auto-generated from title, but you can edit it</small>
		</div>

		<div class="form-group">
			<label for="description">Description</label>
			<textarea id="description" bind:value={description} rows="3" placeholder="Brief description"></textarea>
		</div>

		<div class="form-group">
			<label for="content">Initial Content (Markdown)</label>
			<textarea
				id="content"
				bind:value={content}
				rows="10"
				placeholder="# Title&#10;&#10;Write your content here..."
				class="markdown-input"
			></textarea>
		</div>

		<div class="form-actions">
			<button class="create-btn" onclick={handleCreate} disabled={creating || !title || !slug}>
				{creating ? 'Creating...' : 'Create Content'}
			</button>
		</div>
	</div>
</div>

<style>
	.new-content-page {
		max-width: 800px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
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

	.page-header h1 {
		font-size: 2rem;
		font-weight: 600;
		margin: 0;
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

	.new-content-form {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 2rem;
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

	.form-group small {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.markdown-input {
		font-family: 'IBM Plex Mono', monospace;
		line-height: 1.6;
		tab-size: 2;
	}

	.form-actions {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-subtle);
	}

	.create-btn {
		padding: 0.875rem 2rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.create-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.create-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

