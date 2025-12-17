<script lang="ts">
	let { original = '', modified = '' } = $props<{
		original: string;
		modified: string;
	}>();

	function computeDiff(original: string, modified: string): Array<{ type: 'added' | 'removed' | 'unchanged'; line: string }> {
		const originalLines = original.split('\n');
		const modifiedLines = modified.split('\n');
		const diff: Array<{ type: 'added' | 'removed' | 'unchanged'; line: string }> = [];

		// Simple line-by-line diff
		const maxLen = Math.max(originalLines.length, modifiedLines.length);
		
		for (let i = 0; i < maxLen; i++) {
			const origLine = originalLines[i];
			const modLine = modifiedLines[i];

			if (origLine === undefined) {
				diff.push({ type: 'added', line: modLine });
			} else if (modLine === undefined) {
				diff.push({ type: 'removed', line: origLine });
			} else if (origLine === modLine) {
				diff.push({ type: 'unchanged', line: origLine });
			} else {
				diff.push({ type: 'removed', line: origLine });
				diff.push({ type: 'added', line: modLine });
			}
		}

		return diff;
	}

	let diffLines = $derived(computeDiff(original, modified));
</script>

<div class="diff-view">
	<div class="diff-header">
		<h3>Compare with Live</h3>
		<div class="diff-legend">
			<span class="legend-item removed">Removed</span>
			<span class="legend-item added">Added</span>
		</div>
	</div>
	<div class="diff-content">
		{#each diffLines as { type, line }, index}
			<div class="diff-line" class:added={type === 'added'} class:removed={type === 'removed'}>
				<span class="line-number">{index + 1}</span>
				<span class="line-content">{line || ' '}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.diff-view {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		overflow: hidden;
	}

	.diff-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--bg-secondary);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.diff-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.diff-legend {
		display: flex;
		gap: 1rem;
	}

	.legend-item {
		font-size: 0.85rem;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
	}

	.legend-item.removed {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.legend-item.added {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
	}

	.diff-content {
		flex: 1;
		overflow-y: auto;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.diff-line {
		display: flex;
		padding: 0.25rem 0;
	}

	.diff-line.added {
		background: rgba(16, 185, 129, 0.05);
	}

	.diff-line.removed {
		background: rgba(239, 68, 68, 0.05);
		text-decoration: line-through;
		opacity: 0.7;
	}

	.line-number {
		width: 50px;
		padding: 0 1rem;
		color: var(--text-muted);
		text-align: right;
		flex-shrink: 0;
		user-select: none;
	}

	.line-content {
		flex: 1;
		padding-right: 1.5rem;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>

