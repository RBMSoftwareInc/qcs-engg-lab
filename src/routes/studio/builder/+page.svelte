<script lang="ts">
	import { onMount } from 'svelte';
	import { page as pageStore } from '$app/stores';
	import { safeJsonParse } from '$lib/studio/api-utils';
	import BlockRenderer from '$lib/blocks/BlockRenderer.svelte';
	import {
		BLOCK_REGISTRY,
		BLOCK_TYPES,
		createBlock,
		getBlockMeta,
		type BlockDef,
		type PageModel,
		type BlockType
	} from '$lib/blocks';

	let pageSlug = $state('');
	let page = $state<PageModel>({ title: '', slug: '', blocks: [] });
	let pages = $state<Array<{ slug: string }>>([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');
	let selectedBlockId = $state<string | null>(null);
	let addBlockOpen = $state(false);
	let newPageSlug = $state('');
	let dragIndex = $state<number | null>(null);
	let dropIndex = $state<number | null>(null);

	const selectedBlock = $derived(selectedBlockId ? page.blocks.find((b) => b.id === selectedBlockId) : null);
	const selectedMeta = $derived(selectedBlock ? getBlockMeta(selectedBlock.type) : null);

	onMount(async () => {
		await loadPages();
		const slugFromUrl = $pageStore.url.searchParams.get('page');
		if (slugFromUrl) {
			await loadPage(slugFromUrl);
		} else {
			loading = false;
		}
	});

	async function loadPages() {
		try {
			const res = await fetch('/studio/api/pages');
			const { data } = await safeJsonParse<{ pages: Array<{ slug: string }> }>(res);
			pages = data?.pages ?? [];
		} catch {
			pages = [];
		}
	}

	async function loadPage(slug: string) {
		if (!slug) return;
		loading = true;
		error = '';
		try {
			const res = await fetch(`/studio/api/pages/${encodeURIComponent(slug)}`);
			const { data } = await safeJsonParse<{ page: PageModel }>(res);
			if (data?.page) {
				page = data.page;
				pageSlug = slug;
				selectedBlockId = null;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load page';
		} finally {
			loading = false;
		}
	}

	async function createNewPage() {
		const slug = newPageSlug.trim().replace(/[^a-z0-9-_]/gi, '') || 'new-page';
		newPageSlug = '';
		page = { title: slug.charAt(0).toUpperCase() + slug.slice(1), slug, blocks: [] };
		pageSlug = slug;
		selectedBlockId = null;
		await savePage();
	}

	async function savePage() {
		if (!pageSlug) return;
		saving = true;
		error = '';
		success = '';
		try {
			const res = await fetch(`/studio/api/pages/${encodeURIComponent(pageSlug)}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...page, slug: pageSlug })
			});
			const { data } = await safeJsonParse<{ success?: boolean }>(res);
			if (data?.success) {
				success = 'Saved.';
				if (!pages.some((p) => p.slug === pageSlug)) {
					await loadPages();
				}
			} else {
				error = 'Failed to save';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}

	function addBlock(type: BlockType) {
		const block = createBlock(type);
		page = { ...page, blocks: [...page.blocks, block] };
		selectedBlockId = block.id;
		addBlockOpen = false;
	}

	function removeBlock(id: string) {
		page = { ...page, blocks: page.blocks.filter((b) => b.id !== id) };
		if (selectedBlockId === id) selectedBlockId = null;
	}

	function updateBlockProps(id: string, props: Record<string, unknown>) {
		page = {
			...page,
			blocks: page.blocks.map((b) => (b.id === id ? { ...b, props } : b))
		};
	}

	function updatePageTitle(title: string) {
		page = { ...page, title };
	}

	// Drag and drop
	function handleDragStart(e: DragEvent, index: number) {
		dragIndex = index;
		e.dataTransfer?.setData('text/plain', String(index));
		e.dataTransfer!.effectAllowed = 'move';
	}
	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		dropIndex = index;
	}
	function handleDragLeave() {
		dropIndex = null;
	}
	function handleDrop(e: DragEvent, index: number) {
		e.preventDefault();
		dropIndex = null;
		if (dragIndex === null) return;
		const from = dragIndex;
		const to = index;
		if (from === to) return;
		const blocks = [...page.blocks];
		const [removed] = blocks.splice(from, 1);
		blocks.splice(to, 0, removed);
		page = { ...page, blocks };
		dragIndex = null;
	}
	function handleDragEnd() {
		dragIndex = null;
		dropIndex = null;
	}

	function getPropValue(block: BlockDef, key: string): unknown {
		const val = block.props[key];
		if (typeof val === 'object' && val !== null && !Array.isArray(val)) return JSON.stringify(val, null, 2);
		if (Array.isArray(val)) return JSON.stringify(val, null, 2);
		return val ?? '';
	}

	function setPropValue(block: BlockDef, key: string, raw: string, slotType: string) {
		let value: unknown = raw;
		if (slotType === 'number') value = Number(raw);
		else if (slotType === 'boolean') value = raw === 'true';
		else if (slotType === 'list' || slotType === 'object') {
			try {
				value = JSON.parse(raw);
			} catch {
				value = raw;
			}
		}
		updateBlockProps(block.id, { ...block.props, [key]: value });
	}
</script>

<svelte:head>
	<title>Block Builder | QCS Studio</title>
</svelte:head>

<div class="builder-page">
	<header class="builder-header">
		<div class="builder-header-top">
			<h1 class="builder-title">Block Builder</h1>
			<div class="builder-actions">
				<select
					class="builder-page-select"
					value={pageSlug}
					onchange={(e) => loadPage((e.currentTarget as HTMLSelectElement).value)}
				>
					<option value="">Select page…</option>
					{#each pages as p}
						<option value={p.slug}>{p.slug}</option>
					{/each}
				</select>
				<div class="builder-new">
					<input type="text" bind:value={newPageSlug} placeholder="New page slug" class="builder-slug-input" />
					<button type="button" class="btn btn-secondary" onclick={createNewPage}>Create page</button>
				</div>
				{#if pageSlug}
					<button type="button" class="btn btn-primary" onclick={savePage} disabled={saving}>
						{saving ? 'Saving…' : 'Save'}
					</button>
					<a href="/page/{pageSlug}" target="_blank" rel="noopener" class="btn btn-secondary">View page</a>
				{/if}
			</div>
		</div>
		{#if error}<p class="builder-error">{error}</p>{/if}
		{#if success}<p class="builder-success">{success}</p>{/if}
	</header>

	{#if !pageSlug && !loading}
		<div class="builder-empty">
			<div class="builder-empty-steps">
				<p class="builder-empty-lead">Select a page from the dropdown above, or create a new one to start building.</p>
				<div class="builder-empty-create">
					<input type="text" bind:value={newPageSlug} placeholder="e.g. home, about" class="builder-slug-input" />
					<button type="button" class="btn btn-primary" onclick={createNewPage}>Create page</button>
				</div>
			</div>
			<div class="builder-palette-section">
				<h3 class="builder-palette-title">Block palette</h3>
				<p class="builder-palette-desc">Create a page above, then add these blocks to your canvas.</p>
				<div class="builder-block-palette builder-palette-standalone">
					{#each BLOCK_TYPES as type}
						{@const meta = BLOCK_REGISTRY[type]}
						<div class="builder-palette-btn" title={meta?.label ?? type}>
							<span class="builder-palette-icon">{meta?.icon ?? '▢'}</span>
							<span class="builder-palette-label">{meta?.label ?? type}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else if pageSlug}
		<div class="builder-workspace">
			<!-- Left: Blocks canvas (fixed width, scrollable) -->
			<section class="builder-panel builder-canvas-panel" aria-label="Blocks">
				<div class="builder-panel-head">
					<span class="builder-panel-title">Blocks</span>
				</div>
				<div class="builder-canvas-inner">
					<div class="builder-page-title-row">
						<label for="builder-page-title">Page title</label>
						<input id="builder-page-title" type="text" bind:value={page.title} oninput={(e) => updatePageTitle((e.currentTarget as HTMLInputElement).value)} class="builder-title-input" />
					</div>
					<div class="builder-blocks-list">
						{#each page.blocks as block, index (block.id)}
							{@const meta = getBlockMeta(block.type)}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="builder-block-row"
								class:selected={selectedBlockId === block.id}
								class:dragging={dragIndex === index}
								class:drop-target={dropIndex === index}
								role="button"
								tabindex="0"
								draggable="true"
								ondragstart={(e) => handleDragStart(e, index)}
								ondragover={(e) => handleDragOver(e, index)}
								ondragleave={handleDragLeave}
								ondrop={(e) => handleDrop(e, index)}
								ondragend={handleDragEnd}
							>
								<span class="builder-drag-handle" aria-label="Drag to reorder">⋮⋮</span>
								<button type="button" class="builder-block-label" onclick={() => selectedBlockId = selectedBlockId === block.id ? null : block.id}>
									<span class="builder-block-icon">{meta?.icon ?? '▢'}</span>
									<span class="builder-block-name">{meta?.label ?? block.type}</span>
								</button>
								<button type="button" class="builder-block-remove" onclick={() => removeBlock(block.id)} aria-label="Remove block">×</button>
							</div>
						{/each}
					</div>
					<div class="builder-add">
						<button type="button" class="btn-add-block" onclick={() => (addBlockOpen = !addBlockOpen)}>
							+ Add block
						</button>
						{#if addBlockOpen}
							<div class="builder-block-palette">
								{#each BLOCK_TYPES as type}
									{@const meta = BLOCK_REGISTRY[type]}
									<button type="button" class="builder-palette-btn" onclick={() => addBlock(type)}>
										<span class="palette-icon">{meta?.icon ?? '▢'}</span>
										<span>{meta?.label ?? type}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</section>
			<!-- Center: Preview (contained, scrollable) -->
			<section class="builder-panel builder-preview-panel" aria-label="Preview">
				<div class="builder-panel-head">
					<span class="builder-panel-title">Preview</span>
					<a href="/page/{pageSlug}" target="_blank" rel="noopener" class="builder-preview-open">Open in tab</a>
				</div>
				<div class="builder-preview-inner">
					<BlockRenderer blocks={page.blocks} />
				</div>
			</section>
			<!-- Right: Props sidebar -->
			<aside class="builder-panel builder-props-panel" aria-label="Properties">
				<div class="builder-panel-head">
					<span class="builder-panel-title">Properties</span>
				</div>
				<div class="builder-props-inner">
					{#if selectedBlock && selectedMeta}
						<p class="builder-props-block-label">{selectedMeta.label}</p>
						<div class="builder-props-form">
							{#each selectedMeta.slots as slot}
								<div class="builder-prop">
									<label for="prop-{selectedBlock.id}-{slot.name}">{slot.label}</label>
									{#if slot.type === 'text' || slot.type === 'image'}
										<input
											id="prop-{selectedBlock.id}-{slot.name}"
											type="text"
											value={String(getPropValue(selectedBlock, slot.name))}
											oninput={(e) => setPropValue(selectedBlock, slot.name, (e.currentTarget as HTMLInputElement).value, slot.type)}
										/>
									{:else if slot.type === 'number'}
										<input
											id="prop-{selectedBlock.id}-{slot.name}"
											type="number"
											value={String(getPropValue(selectedBlock, slot.name))}
											oninput={(e) => setPropValue(selectedBlock, slot.name, (e.currentTarget as HTMLInputElement).value, slot.type)}
										/>
									{:else if slot.type === 'boolean'}
										<input
											id="prop-{selectedBlock.id}-{slot.name}"
											type="checkbox"
											checked={Boolean(selectedBlock.props[slot.name])}
											onchange={(e) => setPropValue(selectedBlock, slot.name, (e.currentTarget as HTMLInputElement).checked ? 'true' : 'false', slot.type)}
										/>
									{:else}
										<textarea
											id="prop-{selectedBlock.id}-{slot.name}"
											rows="3"
											value={String(getPropValue(selectedBlock, slot.name))}
											oninput={(e) => setPropValue(selectedBlock, slot.name, (e.currentTarget as HTMLTextAreaElement).value, slot.type)}
										></textarea>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="builder-props-hint">Click a block to edit its properties.</p>
					{/if}
				</div>
			</aside>
		</div>
	{/if}
</div>

<style>
	.builder-page {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		max-width: 1600px;
		margin: 0 auto;
		padding: 1rem 1.25rem;
		width: 100%;
		box-sizing: border-box;
	}
	.builder-header {
		flex-shrink: 0;
		margin-bottom: 1rem;
	}
	.builder-header-top {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.builder-title {
		font-size: 1.15rem;
		font-weight: 600;
		margin: 0;
		margin-right: auto;
		color: var(--text-primary);
	}
	.builder-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.builder-page-select {
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		min-width: 120px;
		font-size: 0.9rem;
	}
	.builder-new {
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}
	.builder-slug-input {
		width: 100px;
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 0.9rem;
	}
	.btn {
		padding: 0.45rem 0.85rem;
		border-radius: 6px;
		font-weight: 500;
		font-size: 0.9rem;
		cursor: pointer;
		border: none;
		text-decoration: none;
	}
	.btn-primary {
		background: var(--text-primary);
		color: var(--bg-primary);
	}
	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}
	.builder-error {
		color: #dc2626;
		font-size: 0.85rem;
		margin: 0.4rem 0 0;
	}
	.builder-success {
		color: #16a34a;
		font-size: 0.85rem;
		margin: 0.4rem 0 0;
	}
	.builder-empty {
		padding: 2rem;
		max-width: 900px;
	}
	.builder-empty-steps { margin-bottom: 2rem; }
	.builder-empty-lead {
		color: var(--text-secondary);
		margin: 0 0 1rem;
		font-size: 1rem;
	}
	.builder-empty-create {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}
	.builder-palette-section {
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 10px;
		padding: 1.5rem;
	}
	.builder-palette-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--text-primary); }
	.builder-palette-desc { font-size: 0.9rem; color: var(--text-muted); margin: 0 0 1rem; }
	.builder-palette-standalone {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.5rem;
	}
	.builder-palette-standalone .builder-palette-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0.5rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		cursor: default;
		font-size: 0.85rem;
		color: var(--text-primary);
	}
	.builder-palette-icon { font-size: 1.5rem; }
	.builder-palette-label { text-align: center; font-size: 0.8rem; }

	/* Workspace: 3 columns */
	.builder-workspace {
		display: grid;
		grid-template-columns: 320px 1fr 300px;
		gap: 0;
		min-height: calc(100vh - 140px);
		max-height: calc(100vh - 120px);
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		overflow: hidden;
		background: var(--bg-secondary);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	}
	.builder-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
		border-right: 1px solid var(--border-subtle);
	}
	.builder-panel:last-child {
		border-right: none;
	}
	.builder-panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}
	.builder-panel-title {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}
	.builder-preview-open {
		font-size: 0.75rem;
		color: var(--highlight);
		text-decoration: none;
	}
	.builder-preview-open:hover { text-decoration: underline; }

	/* Left: Blocks */
	.builder-canvas-panel {
		width: 320px;
		flex-shrink: 0;
	}
	.builder-canvas-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		overflow-y: auto;
		padding: 0.75rem 1rem;
	}
	.builder-page-title-row {
		margin-bottom: 0.75rem;
		flex-shrink: 0;
	}
	.builder-page-title-row label {
		display: block;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: 0.2rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.builder-title-input {
		width: 100%;
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.9rem;
		background: var(--bg-primary);
		color: var(--text-primary);
		box-sizing: border-box;
	}
	.builder-blocks-list {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		flex: 1;
		min-height: 0;
	}
	.builder-block-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.6rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		flex-shrink: 0;
	}
	.builder-block-row:hover {
		border-color: var(--highlight);
	}
	.builder-block-row.selected {
		border-color: var(--highlight);
		background: rgba(244, 196, 48, 0.08);
	}
	.builder-block-row.dragging { opacity: 0.5; }
	.builder-block-row.drop-target {
		border-top: 2px solid var(--highlight);
	}
	.builder-drag-handle {
		cursor: grab;
		color: var(--text-muted);
		font-size: 0.75rem;
		user-select: none;
		opacity: 0.7;
	}
	.builder-drag-handle:active { cursor: grabbing; }
	.builder-block-label {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		text-align: left;
		background: none;
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		font-size: 0.85rem;
		padding: 0;
		min-width: 0;
	}
	.builder-block-icon { font-size: 1rem; flex-shrink: 0; }
	.builder-block-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.builder-block-remove {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: 4px;
		font-size: 1.1rem;
		line-height: 1;
		flex-shrink: 0;
	}
	.builder-block-remove:hover {
		background: rgba(239, 68, 68, 0.12);
		color: #dc2626;
	}
	.builder-add {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}
	.btn-add-block {
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: var(--bg-primary);
		border: 1px dashed var(--border-subtle);
		border-radius: 6px;
		font-size: 0.85rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: border-color 0.2s, color 0.2s;
	}
	.btn-add-block:hover {
		border-color: var(--highlight);
		color: var(--text-primary);
	}
	.builder-block-palette {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.4rem;
		margin-top: 0.5rem;
		padding: 0.6rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		max-height: 180px;
		overflow-y: auto;
	}
	.builder-palette-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.6rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.8rem;
		color: var(--text-primary);
		text-align: left;
	}
	.builder-palette-btn:hover { border-color: var(--highlight); }
	.palette-icon { font-size: 1rem; flex-shrink: 0; }

	/* Center: Preview */
	.builder-preview-panel {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.builder-preview-inner {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1rem;
		background: var(--bg-primary);
	}
	.builder-preview-inner :global(.block-renderer) {
		max-width: 720px;
		margin: 0 auto;
	}

	/* Right: Properties */
	.builder-props-panel {
		width: 300px;
		flex-shrink: 0;
	}
	.builder-props-inner {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.75rem 1rem;
	}
	.builder-props-block-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.6rem;
	}
	.builder-props-form {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.builder-prop label {
		display: block;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: 0.2rem;
	}
	.builder-prop input,
	.builder-prop textarea {
		width: 100%;
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		font-size: 0.85rem;
		background: var(--bg-primary);
		color: var(--text-primary);
		box-sizing: border-box;
	}
	.builder-prop textarea {
		font-family: inherit;
		resize: vertical;
		min-height: 60px;
	}
	.builder-props-hint {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 1100px) {
		.builder-workspace {
			grid-template-columns: 280px 1fr;
			grid-template-rows: 1fr auto;
		}
		.builder-props-panel {
			grid-column: 1 / -1;
			width: 100%;
			max-height: 280px;
			border-top: 1px solid var(--border-subtle);
			border-right: none;
		}
	}
	@media (max-width: 700px) {
		.builder-workspace {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto;
			max-height: none;
		}
		.builder-canvas-panel { width: 100%; max-height: 40vh; }
		.builder-preview-panel { min-height: 50vh; }
		.builder-props-panel { max-height: 35vh; }
	}
</style>
