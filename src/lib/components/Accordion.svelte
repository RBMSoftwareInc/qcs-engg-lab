<script lang="ts">
	import { onMount } from 'svelte';

	let { items, allowMultiple = false } = $props<{
		items: Array<{
			title: string;
			content: string;
			icon?: string;
		}>;
		allowMultiple?: boolean;
	}>();

	let openItems = $state<Set<number>>(new Set());

	function toggle(index: number) {
		if (openItems.has(index)) {
			openItems.delete(index);
		} else {
			if (!allowMultiple) {
				openItems.clear();
			}
			openItems.add(index);
		}
		openItems = new Set(openItems);
	}
</script>

<div class="accordion">
	{#each items as item, index}
		<div class="accordion-item" class:open={openItems.has(index)}>
			<button
				class="accordion-header"
				onclick={() => toggle(index)}
				aria-expanded={openItems.has(index)}
				aria-controls="accordion-content-{index}"
			>
				{#if item.icon}
					<span class="accordion-icon">{item.icon}</span>
				{/if}
				<span class="accordion-title">{item.title}</span>
				<svg
					class="accordion-chevron"
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M5 7.5l5 5 5-5" />
				</svg>
			</button>
			<div
				id="accordion-content-{index}"
				class="accordion-content"
				class:open={openItems.has(index)}
			>
				<div class="accordion-body">
					{@html item.content}
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.accordion {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.accordion-item {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.accordion-item:hover {
		border-color: var(--highlight);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
	}

	.accordion-item.open {
		border-color: var(--highlight);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.accordion-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.accordion-header:hover {
		background: var(--bg-secondary);
	}

	.accordion-icon {
		font-size: 1.5rem;
		opacity: 0.7;
	}

	.accordion-title {
		flex: 1;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	.accordion-chevron {
		transition: transform 0.3s ease;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.accordion-item.open .accordion-chevron {
		transform: rotate(180deg);
	}

	.accordion-content {
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.accordion-content.open {
		max-height: 1000px;
	}

	.accordion-body {
		padding: 0 1.5rem 1.5rem;
		color: var(--text-secondary);
		line-height: 1.7;
	}

	.accordion-body :global(p) {
		margin-bottom: 1rem;
	}

	.accordion-body :global(p:last-child) {
		margin-bottom: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.accordion-content {
			transition: none;
		}

		.accordion-chevron {
			transition: none;
		}
	}
</style>

