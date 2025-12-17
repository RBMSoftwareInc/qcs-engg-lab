<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';

	let contentFiles = $state<any[]>([]);
	let categories = $state<Record<string, any[]>>({});
	let loading = $state(true);
	let selectedCategory = $state<string | null>(null);
	let isStaticBuild = $state(false);

	onMount(async () => {
		// Check if API is available
		const apiAvailable = await checkApiAvailable();
		
		if (!apiAvailable) {
			isStaticBuild = true;
			loading = false;
			return;
		}
		
		await loadContent();
	});

	async function loadContent() {
		loading = true;
		try {
			const response = await fetch('/studio/api/content');
			const { data, isHtml } = await safeJsonParse<{ files: any[] }>(response);
			
			if (isHtml || !data) {
				isStaticBuild = true;
				loading = false;
				return;
			}
			contentFiles = data?.files || [];
			
			// Group by category
			const grouped: Record<string, any[]> = {};
			for (const file of contentFiles) {
				const cat = file.relativePath.split('/')[0] || 'root';
				if (!grouped[cat]) grouped[cat] = [];
				grouped[cat].push(file);
			}
			categories = grouped;
			
			if (Object.keys(grouped).length > 0 && !selectedCategory) {
				selectedCategory = Object.keys(grouped)[0];
			}
		} catch (error) {
			console.error('Failed to load content:', error);
		} finally {
			loading = false;
		}
	}

	function handleEdit(slug: string) {
		goto(`/studio/edit/${slug}`);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'live': return '#10b981';
			case 'review': return '#f59e0b';
			case 'draft': return '#6b7280';
			default: return '#6b7280';
		}
	}
</script>

<svelte:head>
	<title>Content | QCS Studio</title>
</svelte:head>

<div class="studio-page">
	<div class="page-header">
		<div class="header-content">
			<div>
				<h1>Content</h1>
				<p class="page-description">Manage all markdown content files. Edit, publish, and organize your content.</p>
			</div>
			<button class="new-content-btn" onclick={() => goto('/studio/new')}>
				+ New Content
			</button>
		</div>
	</div>

	{#if isStaticBuild}
		<div class="static-build-notice">
			<h2>Studio Not Available</h2>
			<p>QCS Studio requires server-side capabilities and cannot run on static hosting.</p>
			<p>Please use Studio locally or deploy to a Node.js-capable hosting service.</p>
			<a href="/" class="back-link">← Back to Site</a>
		</div>
	{:else if loading}
		<div class="loading">Loading content...</div>
	{:else if contentFiles.length === 0}
		<div class="empty-state">
			<p>No content files found.</p>
			<button class="new-content-btn" onclick={() => goto('/studio/new')}>
				Create First Content
			</button>
		</div>
	{:else}
		<div class="content-layout">
			<aside class="category-sidebar">
				<h2>Categories</h2>
				<nav class="category-nav">
					{#each Object.keys(categories) as category}
						<button
							class="category-btn"
							class:active={selectedCategory === category}
							onclick={() => selectedCategory = category}
						>
							{category}
							<span class="count">({categories[category].length})</span>
						</button>
					{/each}
				</nav>
			</aside>

			<main class="content-list">
				{#if selectedCategory && categories[selectedCategory]}
					<div class="content-grid">
						{#each categories[selectedCategory] as file}
							<div class="content-card" onclick={() => handleEdit(file.slug)}>
								<div class="card-header">
									<h3 class="card-title">{file.title}</h3>
									<span
										class="status-badge"
										style:background={getStatusColor(file.status || 'draft') + '20'}
										style:color={getStatusColor(file.status || 'draft')}
									>
										{file.status || 'draft'}
									</span>
								</div>
								<div class="card-meta">
									<span class="meta-item">{file.relativePath}</span>
									{#if file.updatedAt}
										<span class="meta-item">
											{new Date(file.updatedAt).toLocaleDateString()}
										</span>
									{/if}
								</div>
								<div class="card-preview">
									{file.content.substring(0, 150)}...
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</main>
		</div>
	{/if}
</div>

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

	.new-content-btn {
		padding: 0.75rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.new-content-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.loading {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		border-radius: 12px;
		border: 1px solid var(--border-subtle);
		margin: 2rem 0;
	}

	.static-build-notice {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bg-secondary);
		border-radius: 12px;
		border: 1px solid var(--border-subtle);
		margin: 2rem 0;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.static-build-notice h2 {
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.static-build-notice p {
		color: var(--text-secondary);
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.static-build-notice .back-link {
		display: inline-block;
		margin-top: 1.5rem;
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-color: var(--highlight);
	}

	.content-layout {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.category-sidebar {
		background: var(--bg-secondary);
		border-radius: 8px;
		padding: 1.5rem;
		height: fit-content;
		position: sticky;
		top: 100px;
	}

	.category-sidebar h2 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.category-nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.category-btn {
		padding: 0.75rem 1rem;
		text-align: left;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--text-secondary);
		font-size: 0.95rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.category-btn:hover {
		background: var(--bg-primary);
		border-color: var(--border-subtle);
	}

	.category-btn.active {
		background: var(--bg-primary);
		border-color: var(--highlight);
		color: var(--text-primary);
		font-weight: 500;
	}

	.count {
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.content-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.content-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.content-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: var(--highlight);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
		gap: 1rem;
	}

	.card-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		flex: 1;
		color: var(--text-primary);
	}

	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.card-meta {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.75rem;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.meta-item {
		font-family: 'IBM Plex Mono', monospace;
	}

	.card-preview {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.6;
		margin: 0;
	}

	@media (max-width: 1024px) {
		.content-layout {
			grid-template-columns: 1fr;
		}

		.category-sidebar {
			position: static;
		}
	}
</style>

