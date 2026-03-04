<script lang="ts">
	import type { BlockDef, BlockType } from './types';
	import { getBlockMeta } from './registry';
	import HeroBlock from './HeroBlock.svelte';
	import CardBlock from './CardBlock.svelte';
	import AccordionBlock from './AccordionBlock.svelte';
	import TileBlock from './TileBlock.svelte';
	import CtaBlock from './CtaBlock.svelte';
	import TextBlock from './TextBlock.svelte';
	import ImageBlock from './ImageBlock.svelte';
	import GridBlock from './GridBlock.svelte';
	import ColumnsBlock from './ColumnsBlock.svelte';
	import SectionBlock from './SectionBlock.svelte';
	import SpacerBlock from './SpacerBlock.svelte';
	import DividerBlock from './DividerBlock.svelte';
	import HtmlBlock from './HtmlBlock.svelte';
	import TestimonialBlock from './TestimonialBlock.svelte';
	import StatsBlock from './StatsBlock.svelte';
	import ListBlock from './ListBlock.svelte';
	import EmbedBlock from './EmbedBlock.svelte';
	import VideoBlock from './VideoBlock.svelte';

	let { blocks = [] } = $props<{ blocks: BlockDef[] }>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const COMPONENT_MAP: Record<BlockType, any> = {
		hero: HeroBlock,
		card: CardBlock,
		accordion: AccordionBlock,
		tile: TileBlock,
		cta: CtaBlock,
		text: TextBlock,
		image: ImageBlock,
		grid: GridBlock,
		columns: ColumnsBlock,
		section: SectionBlock,
		spacer: SpacerBlock,
		divider: DividerBlock,
		html: HtmlBlock,
		testimonial: TestimonialBlock,
		stats: StatsBlock,
		list: ListBlock,
		embed: EmbedBlock,
		video: VideoBlock
	};

	function getProps(block: BlockDef): Record<string, unknown> {
		const meta = getBlockMeta(block.type);
		const defaults = meta?.defaultProps ?? {};
		return { ...defaults, ...block.props };
	}
</script>

<div class="block-renderer">
	{#each blocks as block (block.id)}
		{@const Component = COMPONENT_MAP[block.type as BlockType]}
		{#if Component}
			<Component {...getProps(block)} />
		{:else}
			<div class="block-unknown">Unknown block: {block.type}</div>
		{/if}
	{/each}
</div>

<style>
	.block-renderer {
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.block-unknown {
		padding: 2rem;
		background: var(--bg-secondary);
		color: var(--text-muted);
		text-align: center;
		border: 1px dashed var(--border-subtle);
		border-radius: 8px;
		margin: 1rem 0;
	}
</style>
