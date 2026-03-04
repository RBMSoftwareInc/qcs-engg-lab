/**
 * Block registry: defines all block types, their slots (for the props panel), and default props.
 * Used by the Studio builder and by BlockRenderer for validation/defaults.
 */

import type { BlockMeta, BlockType } from './types';

export const BLOCK_REGISTRY: Record<BlockType, BlockMeta> = {
	hero: {
		type: 'hero',
		label: 'Hero',
		description: 'Full-width hero with title, subtitle, image and CTA',
		icon: '🦸',
		slots: [
			{ name: 'title', type: 'text', label: 'Title', required: true, default: 'Headline' },
			{ name: 'subtitle', type: 'text', label: 'Subtitle', default: '' },
			{ name: 'tagline', type: 'text', label: 'Tagline', default: '' },
			{ name: 'image', type: 'image', label: 'Image URL', default: '' },
			{ name: 'ctaText', type: 'text', label: 'CTA button text', default: '' },
			{ name: 'ctaLink', type: 'text', label: 'CTA link', default: '' }
		],
		defaultProps: {
			title: 'Headline',
			subtitle: '',
			tagline: '',
			image: '',
			ctaText: 'Get started',
			ctaLink: '#'
		}
	},
	card: {
		type: 'card',
		label: 'Card',
		description: 'Card with title, description, optional image and link',
		icon: '🃏',
		slots: [
			{ name: 'title', type: 'text', label: 'Title', required: true, default: '' },
			{ name: 'description', type: 'text', label: 'Description', default: '' },
			{ name: 'image', type: 'image', label: 'Image URL', default: '' },
			{ name: 'link', type: 'text', label: 'Link URL', default: '' },
			{ name: 'linkText', type: 'text', label: 'Link label', default: 'Read more' }
		],
		defaultProps: {
			title: 'Card title',
			description: 'Card description text.',
			image: '',
			link: '',
			linkText: 'Read more'
		}
	},
	accordion: {
		type: 'accordion',
		label: 'Accordion',
		description: 'Expandable accordion items',
		icon: '📂',
		slots: [
			{ name: 'items', type: 'list', label: 'Items', required: true, default: [] },
			{ name: 'allowMultiple', type: 'boolean', label: 'Allow multiple open', default: false }
		],
		defaultProps: {
			items: [
				{ title: 'Item 1', content: 'Content for item 1.' },
				{ title: 'Item 2', content: 'Content for item 2.' }
			],
			allowMultiple: false
		}
	},
	tile: {
		type: 'tile',
		label: 'Tile grid',
		description: 'Grid of tiles with icon/title/description',
		icon: '▦',
		slots: [
			{ name: 'title', type: 'text', label: 'Section title', default: '' },
			{ name: 'items', type: 'list', label: 'Tiles', required: true, default: [] }
		],
		defaultProps: {
			title: '',
			items: [
				{ title: 'Tile 1', description: 'Description', icon: '' },
				{ title: 'Tile 2', description: 'Description', icon: '' }
			]
		}
	},
	cta: {
		type: 'cta',
		label: 'Call to action',
		description: 'Banner with heading, text and button(s)',
		icon: '📢',
		slots: [
			{ name: 'heading', type: 'text', label: 'Heading', default: '' },
			{ name: 'text', type: 'text', label: 'Body text', default: '' },
			{ name: 'primaryText', type: 'text', label: 'Primary button text', default: '' },
			{ name: 'primaryLink', type: 'text', label: 'Primary button link', default: '' },
			{ name: 'secondaryText', type: 'text', label: 'Secondary button text', default: '' },
			{ name: 'secondaryLink', type: 'text', label: 'Secondary button link', default: '' }
		],
		defaultProps: {
			heading: 'Ready to get started?',
			text: 'Join us and build something great.',
			primaryText: 'Contact us',
			primaryLink: '#',
			secondaryText: '',
			secondaryLink: ''
		}
	},
	text: {
		type: 'text',
		label: 'Rich text',
		description: 'Paragraph or rich HTML text',
		icon: '📝',
		slots: [
			{ name: 'content', type: 'html', label: 'Content', required: true, default: '' },
			{ name: 'align', type: 'text', label: 'Alignment', default: 'left' }
		],
		defaultProps: {
			content: '<p>Add your text here.</p>',
			align: 'left'
		}
	},
	image: {
		type: 'image',
		label: 'Image',
		description: 'Single image with optional caption and link',
		icon: '🖼️',
		slots: [
			{ name: 'src', type: 'image', label: 'Image URL', required: true, default: '' },
			{ name: 'alt', type: 'text', label: 'Alt text', default: '' },
			{ name: 'caption', type: 'text', label: 'Caption', default: '' },
			{ name: 'link', type: 'text', label: 'Link URL', default: '' }
		],
		defaultProps: {
			src: '',
			alt: 'Image',
			caption: '',
			link: ''
		}
	},
	grid: {
		type: 'grid',
		label: 'Grid',
		description: 'Responsive grid of items (cards or custom)',
		icon: '⊞',
		slots: [
			{ name: 'title', type: 'text', label: 'Section title', default: '' },
			{ name: 'columns', type: 'number', label: 'Columns (1–4)', default: 3 },
			{ name: 'items', type: 'list', label: 'Items', required: true, default: [] }
		],
		defaultProps: {
			title: '',
			columns: 3,
			items: [
				{ title: 'Item 1', description: '' },
				{ title: 'Item 2', description: '' },
				{ title: 'Item 3', description: '' }
			]
		}
	},
	columns: {
		type: 'columns',
		label: 'Columns',
		description: 'Two or three columns of content',
		icon: '▌▐',
		slots: [
			{ name: 'columns', type: 'number', label: 'Number of columns (2 or 3)', default: 2 },
			{ name: 'col1', type: 'html', label: 'Column 1', default: '' },
			{ name: 'col2', type: 'html', label: 'Column 2', default: '' },
			{ name: 'col3', type: 'html', label: 'Column 3', default: '' }
		],
		defaultProps: {
			columns: 2,
			col1: '<p>Column 1</p>',
			col2: '<p>Column 2</p>',
			col3: ''
		}
	},
	section: {
		type: 'section',
		label: 'Section',
		description: 'Wrapper with optional title and background',
		icon: '▣',
		slots: [
			{ name: 'title', type: 'text', label: 'Section title', default: '' },
			{ name: 'id', type: 'text', label: 'HTML id (anchor)', default: '' },
			{ name: 'background', type: 'text', label: 'Background (e.g. light, dark)', default: 'light' }
		],
		defaultProps: {
			title: '',
			id: '',
			background: 'light'
		}
	},
	spacer: {
		type: 'spacer',
		label: 'Spacer',
		description: 'Vertical spacing',
		icon: '↕',
		slots: [
			{ name: 'height', type: 'text', label: 'Height (e.g. 2rem, 4rem)', default: '2rem' }
		],
		defaultProps: { height: '2rem' }
	},
	divider: {
		type: 'divider',
		label: 'Divider',
		description: 'Horizontal line',
		icon: '─',
		slots: [
			{ name: 'style', type: 'text', label: 'Style (solid, dashed)', default: 'solid' }
		],
		defaultProps: { style: 'solid' }
	},
	html: {
		type: 'html',
		label: 'Raw HTML',
		description: 'Custom HTML (use with care)',
		icon: '⟨/⟩',
		slots: [
			{ name: 'content', type: 'html', label: 'HTML', required: true, default: '' }
		],
		defaultProps: { content: '' }
	},
	testimonial: {
		type: 'testimonial',
		label: 'Testimonial',
		description: 'Quote with author and optional role',
		icon: '💬',
		slots: [
			{ name: 'quote', type: 'text', label: 'Quote', required: true, default: '' },
			{ name: 'author', type: 'text', label: 'Author', default: '' },
			{ name: 'role', type: 'text', label: 'Role/company', default: '' },
			{ name: 'avatar', type: 'image', label: 'Avatar URL', default: '' }
		],
		defaultProps: {
			quote: 'A great quote here.',
			author: 'Author name',
			role: '',
			avatar: ''
		}
	},
	stats: {
		type: 'stats',
		label: 'Stats',
		description: 'Numbers / key figures row',
		icon: '📊',
		slots: [
			{ name: 'items', type: 'list', label: 'Stat items', required: true, default: [] }
		],
		defaultProps: {
			items: [
				{ value: '99%', label: 'Satisfaction' },
				{ value: '50+', label: 'Clients' },
				{ value: '24/7', label: 'Support' }
			]
		}
	},
	list: {
		type: 'list',
		label: 'List',
		description: 'Bulleted or numbered list',
		icon: '•',
		slots: [
			{ name: 'items', type: 'list', label: 'List items', required: true, default: [] },
			{ name: 'ordered', type: 'boolean', label: 'Numbered list', default: false }
		],
		defaultProps: {
			items: ['Item 1', 'Item 2', 'Item 3'],
			ordered: false
		}
	},
	embed: {
		type: 'embed',
		label: 'Embed',
		description: 'iframe or embed code (e.g. YouTube, map)',
		icon: '📎',
		slots: [
			{ name: 'url', type: 'text', label: 'Embed URL', default: '' },
			{ name: 'html', type: 'html', label: 'Or paste embed HTML', default: '' }
		],
		defaultProps: { url: '', html: '' }
	},
	video: {
		type: 'video',
		label: 'Video',
		description: 'Video embed (URL or embed code)',
		icon: '▶',
		slots: [
			{ name: 'url', type: 'text', label: 'Video URL', default: '' },
			{ name: 'poster', type: 'image', label: 'Poster image URL', default: '' }
		],
		defaultProps: { url: '', poster: '' }
	}
};

export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY) as BlockType[];

export function getBlockMeta(type: BlockType): BlockMeta | null {
	return BLOCK_REGISTRY[type] ?? null;
}

export function getDefaultProps(type: BlockType): Record<string, unknown> {
	const meta = BLOCK_REGISTRY[type];
	return meta ? { ...meta.defaultProps } : {};
}

export function createBlock(type: BlockType, id?: string): { id: string; type: BlockType; props: Record<string, unknown> } {
	return {
		id: id ?? crypto.randomUUID().slice(0, 8),
		type,
		props: getDefaultProps(type)
	};
}
