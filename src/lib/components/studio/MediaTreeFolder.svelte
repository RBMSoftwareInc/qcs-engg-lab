<script lang="ts">
	type MediaNode =
		| { type: 'folder'; name: string; path: string; children: MediaNode[] }
		| { type: 'file'; name: string; path: string };

	let {
		entries,
		currentFolder,
		onSelect,
		onToggle,
		expandedFolders
	}: {
		entries: { path: string; name: string; depth: number }[];
		currentFolder: string;
		onSelect: (path: string) => void;
		onToggle: (path: string) => void;
		expandedFolders: Set<string>;
	} = $props();
</script>

{#each entries as entry}
	<div class="tree-folder" style="padding-left: {entry.depth * 12 + 4}px">
		<div
			class="tree-item"
			class:active={currentFolder === entry.path}
			role="button"
			tabindex="0"
			onclick={() => onSelect(entry.path)}
			onkeydown={(e) => e.key === 'Enter' && onSelect(entry.path)}
		>
			<span
				class="tree-chevron"
				role="button"
				tabindex="0"
				onclick={(e) => { e.stopPropagation(); onToggle(entry.path); }}
				onkeydown={(e) => { e.stopPropagation(); if (e.key === 'Enter') onToggle(entry.path); }}
				aria-label={expandedFolders.has(entry.path) ? 'Collapse' : 'Expand'}
			>
				{expandedFolders.has(entry.path) ? '▼' : '▶'}
			</span>
			<span class="tree-icon">📁</span>
			<span class="tree-label">{entry.name}</span>
		</div>
	</div>
{/each}

<style>
	.tree-folder { margin: 0; }
	.tree-item { display: flex; align-items: center; gap: 0.35rem; width: 100%; padding: 0.4rem 1rem; border: none; background: transparent; cursor: pointer; text-align: left; font-size: 0.9rem; color: var(--text-primary); }
	.tree-item:hover { background: var(--bg-accent); }
	.tree-item.active { background: var(--highlight); color: var(--bg-primary); }
	.tree-chevron { width: 1.2rem; padding: 0; background: transparent; cursor: pointer; font-size: 0.65rem; color: var(--text-muted); flex-shrink: 0; }
	.tree-icon { font-size: 1rem; }
	.tree-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
