<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';
	import MediaTreeFolder from '$lib/components/studio/MediaTreeFolder.svelte';

	function flattenFolderTree(
		nodes: MediaNode[],
		expanded: Set<string>,
		depth = 0
	): { path: string; name: string; depth: number }[] {
		const out: { path: string; name: string; depth: number }[] = [];
		for (const n of nodes) {
			if (n.type !== 'folder') continue;
			out.push({ path: n.path, name: n.name, depth });
			if (expanded.has(n.path)) {
				out.push(...flattenFolderTree(n.children, expanded, depth + 1));
			}
		}
		return out;
	}

	function setIndeterminate(node: HTMLInputElement, value: boolean) {
		node.indeterminate = value;
	}

	type ViewMode = 'thumbnails' | 'list';
	type SortOption = 'name-asc' | 'name-desc';
	type MediaNode =
		| { type: 'folder'; name: string; path: string; children: MediaNode[] }
		| { type: 'file'; name: string; path: string; size?: number };

	let tree = $state<MediaNode[]>([]);
	let files = $state<string[]>([]);
	let uploading = $state(false);
	let error = $state('');
	let success = $state('');
	let isStaticBuild = $state(false);
	let viewMode = $state<ViewMode>('thumbnails');
	let sortBy = $state<SortOption>('name-asc');
	let filterExt = $state<string>('all');
	let selected = $state<Set<string>>(new Set());
	let currentFolder = $state('');
	let expandedFolders = $state<Set<string>>(new Set());
	let showNewFolder = $state(false);
	let newFolderName = $state('');
	let creatingFolder = $state(false);

	function getNodeAtPath(nodes: MediaNode[], pathSegments: string[]): MediaNode | null {
		if (pathSegments.length === 0) return null;
		const [first, ...rest] = pathSegments;
		const folder = nodes.find((n) => n.type === 'folder' && n.name === first);
		if (!folder || folder.type !== 'folder') return null;
		if (rest.length === 0) return folder;
		return getNodeAtPath(folder.children, rest);
	}

	const currentFolderNode = $derived.by(() => {
		if (!currentFolder) return null;
		const segments = currentFolder.split('/').filter(Boolean);
		return getNodeAtPath(tree, segments);
	});

	const directChildren = $derived.by(() => {
		const nodes = currentFolder ? (currentFolderNode && currentFolderNode.type === 'folder' ? currentFolderNode.children : []) : tree;
		const folderPaths = nodes.filter((n) => n.type === 'folder').map((n) => (n as { path: string }).path);
		const filePaths = nodes.filter((n) => n.type === 'file').map((n) => (n as { path: string }).path);
		return { folders: folderPaths, files: filePaths };
	});

	const sortedAndFiltered = $derived.by(() => {
		let list = [...directChildren.files];
		if (filterExt !== 'all') {
			const ext = filterExt.toLowerCase();
			list = list.filter((f) => f.toLowerCase().endsWith(`.${ext}`));
		}
		list.sort((a, b) => {
			const c = sortBy === 'name-asc' ? 1 : -1;
			return c * a.localeCompare(b, undefined, { sensitivity: 'base' });
		});
		return list;
	});

	const extensions = $derived.by(() => {
		const set = new Set<string>();
		for (const f of directChildren.files) {
			const m = f.match(/\.([a-z0-9]+)$/i);
			if (m) set.add(m[1].toLowerCase());
		}
		return Array.from(set).sort();
	});

	const selectedCount = $derived(selected.size);

	const flatFolderEntries = $derived(flattenFolderTree(tree, expandedFolders));

	const uploadAccept = 'image/*,video/*,.pdf,.doc,.docx';
	const sizeLimits = 'Images 5MB · Video 50MB · PDF/DOC 10MB';

	onMount(async () => {
		const apiAvailable = await checkApiAvailable();
		if (!apiAvailable) {
			isStaticBuild = true;
			return;
		}
		await loadMedia();
	});

	async function loadMedia() {
		try {
			const response = await fetch('/studio/api/media');
			const { data, isHtml } = await safeJsonParse<{ tree?: MediaNode[]; files?: string[] }>(response);
			if (isHtml || !data) {
				isStaticBuild = true;
				return;
			}
			tree = data.tree ?? [];
			files = data.files ?? [];
			selected = new Set();
		} catch (err) {
			console.error('Failed to load media:', err);
			isStaticBuild = true;
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
			formData.append('folder', currentFolder);
			for (let i = 0; i < fileList.length; i++) {
				formData.append('files', fileList[i]);
			}
			const response = await fetch('/studio/api/media/upload', {
				method: 'POST',
				body: formData
			});
			const { data: result, isHtml } = await safeJsonParse<{ success: boolean; uploaded?: string[]; message?: string }>(response);
			if (isHtml || !result) {
				error = 'Studio API not available.';
				return;
			}
			if (result.success) {
				success = `Uploaded ${result.uploaded?.length || 0} file(s)`;
				await loadMedia();
				setTimeout(() => (success = ''), 3000);
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

	function getMediaUrl(file: string) {
		return `/assets/images/${file}`;
	}

	function getExtension(file: string): string {
		const m = file.match(/\.([a-z0-9]+)$/i);
		return m ? m[1].toUpperCase() : '';
	}

	function isImageOrGif(file: string): boolean {
		return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file);
	}

	function copyImagePath(file: string) {
		const url = getMediaUrl(file);
		navigator.clipboard.writeText(url);
		success = `Copied: ${url}`;
		setTimeout(() => (success = ''), 2000);
	}

	function copyMarkdown(file: string) {
		const url = getMediaUrl(file);
		const name = file.split('/').pop() || file;
		const md = isImageOrGif(file) ? `![${name}](${url})` : `[${name}](${url})`;
		navigator.clipboard.writeText(md);
		success = 'Copied as Markdown';
		setTimeout(() => (success = ''), 2000);
	}

	function toggleSelect(file: string) {
		const next = new Set(selected);
		if (next.has(file)) next.delete(file);
		else next.add(file);
		selected = next;
	}

	function selectAll() {
		if (selected.size === sortedAndFiltered.length) selected = new Set();
		else selected = new Set(sortedAndFiltered);
	}

	async function removeFile(file: string) {
		if (!confirm(`Remove "${file}"? This cannot be undone.`)) return;
		await doRemove(file);
	}

	async function doRemove(file: string, skipReload = false) {
		try {
			const res = await fetch(`/studio/api/media?path=${encodeURIComponent(file)}`, { method: 'DELETE' });
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				selected = new Set(selected);
				selected.delete(file);
				if (!skipReload) {
					await loadMedia();
					success = 'Removed';
					setTimeout(() => (success = ''), 2000);
				}
				return true;
			} else {
				error = data?.message || 'Failed to remove';
				return false;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove';
			return false;
		}
	}

	async function removeSelected() {
		if (selectedCount === 0) return;
		if (!confirm(`Remove ${selectedCount} selected file(s)? This cannot be undone.`)) return;
		error = '';
		const toRemove = [...selected];
		let done = 0;
		for (const file of toRemove) {
			const ok = await doRemove(file, true);
			if (ok) done++;
		}
		selected = new Set();
		await loadMedia();
		success = done > 0 ? `Removed ${done} file(s)` : '';
		setTimeout(() => (success = ''), 3000);
	}

	function toggleExpand(path: string) {
		const next = new Set(expandedFolders);
		if (next.has(path)) next.delete(path);
		else next.add(path);
		expandedFolders = next;
	}

	/** Add folder and all its ancestors to expanded set so the tree shows the path open */
	function expandAncestors(folderPath: string) {
		const next = new Set(expandedFolders);
		next.add(folderPath);
		let parts = folderPath.split('/').filter(Boolean);
		while (parts.length > 1) {
			parts = parts.slice(0, -1);
			next.add(parts.join('/'));
		}
		expandedFolders = next;
	}

	function selectFolder(path: string) {
		currentFolder = path;
		expandAncestors(path);
	}

	async function createFolder() {
		const name = newFolderName.trim().replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
		if (!name) return;
		creatingFolder = true;
		error = '';
		try {
			const pathParam = currentFolder ? `${currentFolder}/${name}` : name;
			const res = await fetch('/studio/api/media', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: pathParam })
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Folder created';
				showNewFolder = false;
				newFolderName = '';
				await loadMedia();
				expandedFolders = new Set([...expandedFolders, currentFolder]);
				setTimeout(() => (success = ''), 2000);
			} else {
				error = data?.message || 'Failed to create folder';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create folder';
		} finally {
			creatingFolder = false;
		}
	}

	async function removeFolder(folderPath: string) {
		if (!confirm(`Remove folder "${folderPath}" and all its contents? This cannot be undone.`)) return;
		try {
			const res = await fetch(`/studio/api/media?path=${encodeURIComponent(folderPath)}`, { method: 'DELETE' });
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				await loadMedia();
				if (currentFolder === folderPath || currentFolder.startsWith(folderPath + '/')) currentFolder = '';
				success = 'Folder removed';
				setTimeout(() => (success = ''), 2000);
			} else {
				error = data?.message || 'Failed to remove folder';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove folder';
		}
	}
</script>

<svelte:head>
	<title>Media | QCS Studio</title>
</svelte:head>

<div class="media-page">
	<div class="page-header">
		<div class="header-content">
			<div>
				<h1>Media</h1>
				<p class="page-description">Organize by folders. Upload images (5MB), video (50MB), GIFs, PDFs and docs (10MB).</p>
			</div>
			<div class="header-actions">
				<button type="button" class="new-folder-btn" onclick={() => { showNewFolder = true; newFolderName = ''; }} title="New folder in current location">
					+ New folder
				</button>
				<label class="upload-btn">
					<input type="file" multiple accept={uploadAccept} onchange={handleUpload} disabled={uploading} />
					{uploading ? 'Uploading…' : '+ Upload'}
				</label>
			</div>
		</div>
		{#if showNewFolder}
			<div class="new-folder-bar">
				<input type="text" bind:value={newFolderName} placeholder="Folder name" class="new-folder-input" />
				<button type="button" class="action-btn" onclick={createFolder} disabled={creatingFolder || !newFolderName.trim()}>{creatingFolder ? 'Creating…' : 'Create'}</button>
				<button type="button" class="action-btn" onclick={() => { showNewFolder = false; newFolderName = ''; }}>Cancel</button>
			</div>
		{/if}
		<p class="size-hint">{sizeLimits}</p>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}
	{#if success}
		<div class="alert alert-success">{success}</div>
	{/if}

	{#if isStaticBuild}
		<div class="empty-state">
			<p>Media requires the Studio server. Run the app with the API available.</p>
		</div>
	{:else}
		<div class="media-layout">
			<aside class="tree-sidebar">
				<div class="tree-header">Folders</div>
				<button type="button" class="tree-item tree-item-root" class:active={currentFolder === ''} onclick={() => (currentFolder = '')}>
					<span class="tree-icon">📁</span> All media
				</button>
				<MediaTreeFolder entries={flatFolderEntries} currentFolder={currentFolder} expandedFolders={expandedFolders} onSelect={selectFolder} onToggle={toggleExpand} />
			</aside>

			<main class="media-main">
				<div class="breadcrumb">
					{currentFolder || 'All media'}
				</div>

				{#if directChildren.folders.length > 0}
					<div class="subfolders-block">
						<h3 class="block-title">Subfolders</h3>
						<div class="subfolders-list">
							{#each directChildren.folders as folderPath}
								{@const name = folderPath.split('/').pop() ?? folderPath}
								<div class="subfolder-card">
									<button type="button" class="subfolder-link" onclick={() => selectFolder(folderPath)}>
										<span class="tree-icon">📁</span> {name}
									</button>
									<button type="button" class="remove-btn small" onclick={() => removeFolder(folderPath)} title="Remove folder">×</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if sortedAndFiltered.length === 0 && directChildren.folders.length === 0}
					<div class="empty-folder">
						<p>This folder is empty.</p>
						<p class="empty-hint">Upload files or create a subfolder above.</p>
					</div>
				{:else if sortedAndFiltered.length > 0}
					<div class="toolbar">
						<div class="toolbar-group" role="group" aria-label="View mode">
							<span class="toolbar-label">View</span>
							<div class="view-toggle">
								<button type="button" class:active={viewMode === 'thumbnails'} onclick={() => (viewMode = 'thumbnails')}>Thumbnails</button>
								<button type="button" class:active={viewMode === 'list'} onclick={() => (viewMode = 'list')}>List</button>
							</div>
						</div>
						<div class="toolbar-group" role="group" aria-label="Sort">
							<label class="toolbar-label" for="media-sort">Sort</label>
							<select id="media-sort" class="toolbar-select" bind:value={sortBy}>
								<option value="name-asc">Name A–Z</option>
								<option value="name-desc">Name Z–A</option>
							</select>
						</div>
						{#if extensions.length > 0}
							<div class="toolbar-group" role="group" aria-label="Type">
								<label class="toolbar-label" for="media-type">Type</label>
								<select id="media-type" class="toolbar-select" bind:value={filterExt}>
									<option value="all">All</option>
									{#each extensions as ext}
										<option value={ext}>{ext.toUpperCase()}</option>
									{/each}
								</select>
							</div>
						{/if}
						{#if viewMode === 'list' && selectedCount > 0}
							<button type="button" class="bulk-remove-btn" onclick={removeSelected}>Remove selected ({selectedCount})</button>
						{/if}
					</div>

					{#if viewMode === 'thumbnails'}
						<div class="media-grid">
							{#each sortedAndFiltered as file}
								<div class="media-item">
									<div class="media-preview">
										{#if isImageOrGif(file)}
											<img src={getMediaUrl(file)} alt={file} loading="lazy" />
										{:else}
											<div class="media-placeholder" title={getExtension(file)}>
												{#if /\.(mp4|webm|mov|ogv)$/i.test(file)}
													<span class="placeholder-icon">🎬</span>
												{:else if /\.pdf$/i.test(file)}
													<span class="placeholder-icon">📄</span>
												{:else}
													<span class="placeholder-icon">📎</span>
												{/if}
												<span class="placeholder-ext">{getExtension(file)}</span>
											</div>
										{/if}
									</div>
									<div class="media-info">
										<p class="media-name" title={file}>{file.split('/').pop() || file}</p>
										<div class="media-actions">
											<a href={getMediaUrl(file)} target="_blank" rel="noopener noreferrer" class="action-btn">View</a>
											<button type="button" class="action-btn" onclick={() => copyImagePath(file)}>Copy path</button>
											<button type="button" class="action-btn" onclick={() => copyMarkdown(file)}>Markdown</button>
											<button type="button" class="remove-btn" onclick={() => removeFile(file)}>Remove</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="media-list-wrap">
							<table class="media-table">
								<thead>
									<tr>
										<th class="col-check"><input type="checkbox" checked={selectedCount === sortedAndFiltered.length && sortedAndFiltered.length > 0} use:setIndeterminate={selectedCount > 0 && selectedCount < sortedAndFiltered.length} onchange={selectAll} aria-label="Select all" /></th>
										<th class="col-preview">Preview</th>
										<th class="col-path">Name</th>
										<th class="col-type">Type</th>
										<th class="col-actions">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each sortedAndFiltered as file}
										<tr>
											<td class="col-check"><input type="checkbox" checked={selected.has(file)} onchange={() => toggleSelect(file)} aria-label="Select {file}" /></td>
											<td class="col-preview">
												{#if isImageOrGif(file)}
													<a href={getMediaUrl(file)} target="_blank" rel="noopener noreferrer" class="list-thumb">
														<img src={getMediaUrl(file)} alt="" loading="lazy" />
													</a>
												{:else}
													<a href={getMediaUrl(file)} target="_blank" rel="noopener noreferrer" class="list-thumb list-thumb-placeholder">
														<span>{getExtension(file)}</span>
													</a>
												{/if}
											</td>
											<td class="col-path"><code class="path-cell">{file}</code></td>
											<td class="col-type">{getExtension(file)}</td>
											<td class="col-actions">
												<a href={getMediaUrl(file)} target="_blank" rel="noopener noreferrer" class="action-btn">View</a>
												<button type="button" class="action-btn" onclick={() => copyImagePath(file)}>Copy path</button>
												<button type="button" class="action-btn" onclick={() => copyMarkdown(file)}>Markdown</button>
												<button type="button" class="remove-btn" onclick={() => removeFile(file)}>Remove</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				{/if}
			</main>
		</div>
	{/if}
</div>

<style>
	.media-page { width: 100%; background: var(--bg-primary); min-height: 100%; }
	.page-header { background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%); padding: 2rem 0; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); }
	.header-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; flex-wrap: wrap; }
	.page-header h1 { font-size: 2.5rem; font-weight: 600; margin: 0 0 0.5rem 0; color: var(--text-primary); }
	.page-description { font-size: 1.05rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
	.header-actions { display: flex; gap: 0.75rem; align-items: center; }
	.new-folder-btn { padding: 0.5rem 1rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 8px; font-weight: 500; cursor: pointer; }
	.new-folder-btn:hover { background: var(--bg-accent); }
	.upload-btn { padding: 0.75rem 1.5rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-block; }
	.upload-btn:hover:not(:has(input:disabled)) { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
	.upload-btn input { display: none; }
	.upload-btn:has(input:disabled) { opacity: 0.6; cursor: not-allowed; }
	.new-folder-bar { display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; }
	.new-folder-input { padding: 0.5rem 0.75rem; border: 1px solid var(--border-subtle); border-radius: 6px; min-width: 200px; }
	.size-hint { font-size: 0.85rem; color: var(--text-muted); margin: 0.5rem 0 0 0; }
	.alert { padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
	.alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #dc2626; }
	.alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #059669; }
	.empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
	.empty-folder { text-align: center; padding: 3rem 2rem; color: var(--text-muted); }
	.empty-hint { font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-muted); }

	.media-layout { display: flex; gap: 0; min-height: 60vh; }
	.tree-sidebar { width: 260px; flex-shrink: 0; border-right: 1px solid var(--border-subtle); padding: 1rem 0; background: var(--bg-secondary); }
	.tree-header { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 0 1rem 0.75rem; }
	.tree-item { display: flex; align-items: center; gap: 0.35rem; width: 100%; padding: 0.4rem 1rem; border: none; background: transparent; cursor: pointer; text-align: left; font-size: 0.9rem; color: var(--text-primary); }
	.tree-item:hover { background: var(--bg-accent); }
	.tree-item.active { background: var(--highlight); color: var(--bg-primary); }
	.tree-item-root { font-weight: 500; }
	.tree-icon { font-size: 1rem; }

	.media-main { flex: 1; min-width: 0; padding: 1rem 1.5rem; }
	.breadcrumb { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle); }
	.subfolders-block { margin-bottom: 1.5rem; }
	.block-title { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin: 0 0 0.5rem 0; }
	.subfolders-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.subfolder-card { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.35rem 0.75rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 6px; }
	.subfolder-link { display: inline-flex; align-items: center; gap: 0.35rem; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; padding: 0; }
	.subfolder-link:hover { text-decoration: underline; }
	.remove-btn.small { padding: 0 0.35rem; font-size: 1rem; line-height: 1; }

	.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle); }
	.toolbar-group { display: flex; align-items: center; gap: 0.5rem; }
	.toolbar-label { font-size: 0.85rem; color: var(--text-muted); }
	.view-toggle { display: flex; }
	.view-toggle button { padding: 0.5rem 0.75rem; border: 1px solid var(--border-subtle); background: var(--bg-primary); border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
	.view-toggle button:first-child { border-radius: 6px 0 0 6px; }
	.view-toggle button:last-child { border-radius: 0 6px 6px 0; border-left-width: 0; }
	.view-toggle button.active { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
	.toolbar-select { padding: 0.5rem 0.75rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-primary); font-size: 0.9rem; }
	.bulk-remove-btn { padding: 0.5rem 1rem; border: 1px solid #dc2626; color: #dc2626; border-radius: 6px; font-size: 0.9rem; cursor: pointer; margin-left: auto; }
	.bulk-remove-btn:hover { background: rgba(239,68,68,0.08); }

	.media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
	.media-item { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; }
	.media-preview { width: 100%; height: 160px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; }
	.media-preview img { width: 100%; height: 100%; object-fit: cover; }
	.media-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; height: 100%; color: var(--text-muted); font-size: 0.8rem; }
	.placeholder-icon { font-size: 2rem; }
	.media-info { padding: 0.75rem; }
	.media-name { font-size: 0.85rem; margin: 0 0 0.5rem 0; word-break: break-all; line-height: 1.3; max-height: 2.6em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; }
	.media-actions { display: flex; flex-wrap: wrap; gap: 0.35rem; }
	.action-btn { padding: 0.35rem 0.6rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 6px; font-size: 0.8rem; cursor: pointer; color: var(--text-primary); text-decoration: none; }
	.action-btn:hover { background: var(--bg-accent); }
	.remove-btn { padding: 0.35rem 0.6rem; background: transparent; border: 1px solid var(--border-subtle); border-radius: 6px; font-size: 0.8rem; cursor: pointer; color: var(--text-secondary); }
	.remove-btn:hover { border-color: #dc2626; color: #dc2626; background: rgba(239,68,68,0.08); }

	.media-list-wrap { overflow-x: auto; margin-bottom: 2rem; border: 1px solid var(--border-subtle); border-radius: 8px; }
	.media-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
	.media-table th, .media-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border-subtle); }
	.media-table th { font-weight: 600; color: var(--text-muted); background: var(--bg-secondary); }
	.col-check { width: 2.5rem; }
	.col-preview { width: 56px; }
	.list-thumb { display: block; width: 44px; height: 44px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-subtle); }
	.list-thumb img { width: 100%; height: 100%; object-fit: cover; }
	.list-thumb-placeholder { display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--text-muted); }
	.path-cell { font-size: 0.85rem; word-break: break-all; }
	.col-type { width: 4rem; color: var(--text-muted); }
	.col-actions .action-btn, .col-actions .remove-btn { margin-right: 0.25rem; }
</style>
