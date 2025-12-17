<script lang="ts">
	import { onMount } from 'svelte';

	let { term, definition } = $props<{
		term: string;
		definition: string;
	}>();

	let tooltipRef: HTMLElement;
	let showTooltip = $state(false);
	let position = $state({ top: 0, left: 0 });

	const technicalTerms: Record<string, string> = {
		architecture: 'The fundamental structure and organization of a system, defining how components interact.',
		infrastructure: 'The underlying foundation that supports system operations, including hardware and software resources.',
		scalability: 'The ability of a system to handle growing amounts of work by adding resources.',
		observability: 'The ability to understand the internal state of a system by examining its outputs.',
		distributed: 'A system where components are located on different networked computers.',
		'data analytics': 'The process of examining data sets to draw conclusions about the information they contain.',
		'automation': 'The use of technology to perform tasks with minimal human intervention.',
		'cloud architecture': 'The design of systems that leverage cloud computing resources and services.',
		'intelligence': 'The capability of systems to learn, adapt, and make decisions based on data.',
		'platform engineering': 'The practice of building and maintaining platforms that enable software delivery.'
	};

	onMount(() => {
		// Auto-detect if this term has a definition
		const lowerTerm = term.toLowerCase();
		if (technicalTerms[lowerTerm] && !definition) {
			// Could auto-populate, but keeping manual control for now
		}
	});

	function handleClick(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		position = {
			top: rect.bottom + 8,
			left: rect.left + rect.width / 2
		};
		showTooltip = !showTooltip;
	}

	function handleMouseEnter(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		position = {
			top: rect.bottom + 8,
			left: rect.left + rect.width / 2
		};
		showTooltip = true;
	}

	function handleMouseLeave() {
		showTooltip = false;
	}
</script>

<span
	class="term-highlight"
	bind:this={tooltipRef}
	onclick={handleClick}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	role="button"
	tabindex="0"
	aria-label="Click for definition of {term}"
>
	{term}
</span>

{#if showTooltip}
	<div
		class="tooltip"
		style:top={position.top + 'px'}
		style:left={position.left + 'px'}
		role="tooltip"
	>
		<div class="tooltip-header">
			<strong>{term}</strong>
			<button class="tooltip-close" onclick={() => (showTooltip = false)} aria-label="Close">×</button>
		</div>
		<div class="tooltip-content">
			{definition || technicalTerms[term.toLowerCase()] || 'Definition not available.'}
		</div>
	</div>
{/if}

<style>
	.term-highlight {
		color: var(--highlight);
		cursor: help;
		border-bottom: 2px dotted var(--highlight);
		position: relative;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.term-highlight:hover {
		background: rgba(244, 196, 48, 0.1);
		border-bottom-color: var(--text-primary);
	}

	.tooltip {
		position: fixed;
		background: var(--bg-primary);
		border: 2px solid var(--highlight);
		border-radius: 12px;
		padding: 1rem;
		max-width: 320px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		transform: translateX(-50%);
		animation: tooltipFadeIn 0.2s ease;
	}

	@keyframes tooltipFadeIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.tooltip-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.tooltip-header strong {
		color: var(--text-primary);
		font-size: 1rem;
	}

	.tooltip-close {
		width: 24px;
		height: 24px;
		border: none;
		background: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 1.5rem;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s ease;
	}

	.tooltip-close:hover {
		color: var(--text-primary);
	}

	.tooltip-content {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.6;
	}
</style>

