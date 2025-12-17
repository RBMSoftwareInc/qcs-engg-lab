<script lang="ts">
	let { categories, types, selectedCategory, selectedType, onCategoryChange, onTypeChange } = $props<{
		categories: string[];
		types: string[];
		selectedCategory: string;
		selectedType: string;
		onCategoryChange: (category: string) => void;
		onTypeChange: (type: string) => void;
	}>();

	let showFilters = $state(false);
</script>

<div class="filter-bar">
	<div class="filter-tabs">
		<button
			class="filter-tab"
			class:active={selectedCategory === 'all'}
			onclick={() => onCategoryChange('all')}
		>
			All
		</button>
		{#each categories as category}
			<button
				class="filter-tab"
				class:active={selectedCategory === category}
				onclick={() => onCategoryChange(category)}
			>
				{category}
			</button>
		{/each}
	</div>

	<div class="filter-dropdowns">
		<select
			class="filter-select"
			value={selectedType}
			onchange={(e) => onTypeChange((e.target as HTMLSelectElement).value)}
		>
			<option value="all">All Types</option>
			{#each types as type}
				<option value={type}>{type === 'technical' ? 'Technical' : 'Business'}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.filter-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
		margin-bottom: 3rem;
		padding: 1.5rem;
		background: var(--bg-secondary);
		border-radius: 12px;
		flex-wrap: wrap;
	}

	.filter-tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.filter-tab {
		padding: 0.65rem 1.5rem;
		border: 2px solid transparent;
		background: var(--bg-primary);
		color: var(--text-secondary);
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: capitalize;
	}

	.filter-tab:hover {
		border-color: var(--border-subtle);
		color: var(--text-primary);
	}

	.filter-tab.active {
		background: var(--text-primary);
		color: var(--bg-primary);
		border-color: var(--text-primary);
		box-shadow: 0 2px 8px rgba(31, 41, 55, 0.2);
	}

	.filter-dropdowns {
		display: flex;
		gap: 1rem;
	}

	.filter-select {
		padding: 0.65rem 1.25rem;
		border: 2px solid var(--border-subtle);
		background: var(--bg-primary);
		color: var(--text-primary);
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: inherit;
	}

	.filter-select:hover {
		border-color: var(--highlight);
	}

	.filter-select:focus {
		outline: none;
		border-color: var(--highlight);
		box-shadow: 0 0 0 3px rgba(244, 196, 48, 0.1);
	}

	@media (max-width: 640px) {
		.filter-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.filter-tabs {
			width: 100%;
		}

		.filter-tab {
			flex: 1;
			min-width: 0;
		}

		.filter-dropdowns {
			width: 100%;
		}

		.filter-select {
			width: 100%;
		}
	}
</style>

