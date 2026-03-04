/**
 * Block-based page builder: types and shared interfaces.
 * Each block has an id, type, and props; stored in content/pages/*.json.
 */

export type BlockType =
	| 'hero'
	| 'card'
	| 'accordion'
	| 'tile'
	| 'cta'
	| 'text'
	| 'image'
	| 'grid'
	| 'columns'
	| 'section'
	| 'spacer'
	| 'divider'
	| 'html'
	| 'testimonial'
	| 'stats'
	| 'list'
	| 'embed'
	| 'video';

export interface BlockDef {
	id: string;
	type: BlockType;
	props: Record<string, unknown>;
}

export interface PageModel {
	title: string;
	slug: string;
	description?: string;
	blocks: BlockDef[];
}

export interface BlockSlot {
	name: string;
	type: 'text' | 'number' | 'image' | 'list' | 'object' | 'boolean' | 'html';
	label: string;
	required?: boolean;
	default?: unknown;
	description?: string;
}

export interface BlockMeta {
	type: BlockType;
	label: string;
	description: string;
	icon?: string;
	slots: BlockSlot[];
	defaultProps: Record<string, unknown>;
}
