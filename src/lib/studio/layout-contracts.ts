/**
 * Layout Contracts System
 * Code-defined layouts that map markdown fields to layout slots
 * 
 * This is NOT visual editing. Layouts are defined in code.
 * Studio only allows selecting layouts and mapping content fields.
 */

export interface LayoutSlot {
	name: string;
	type: 'text' | 'image' | 'list' | 'object';
	required?: boolean;
	description?: string;
}

export interface LayoutContract {
	name: string;
	description: string;
	slots: LayoutSlot[];
	component?: string; // Svelte component name
}

/**
 * Registry of available layouts
 * These are code-defined, not editable in Studio
 */
export const LAYOUT_REGISTRY: Record<string, LayoutContract> = {
	hero: {
		name: 'Hero Layout',
		description: 'Full-width hero section with title, subtitle, and optional image',
		slots: [
			{ name: 'title', type: 'text', required: true, description: 'Main heading' },
			{ name: 'subtitle', type: 'text', required: false, description: 'Subheading or description' },
			{ name: 'image', type: 'image', required: false, description: 'Hero image URL' },
			{ name: 'ctaText', type: 'text', required: false, description: 'Call-to-action button text' },
			{ name: 'ctaLink', type: 'text', required: false, description: 'Call-to-action button link' }
		],
		component: 'HeroLayout'
	},
	article: {
		name: 'Article Layout',
		description: 'Standard article layout with title, metadata, and content',
		slots: [
			{ name: 'title', type: 'text', required: true, description: 'Article title' },
			{ name: 'author', type: 'text', required: false, description: 'Author name' },
			{ name: 'date', type: 'text', required: false, description: 'Publication date' },
			{ name: 'content', type: 'text', required: true, description: 'Article body content' },
			{ name: 'image', type: 'image', required: false, description: 'Featured image' }
		],
		component: 'ArticleLayout'
	},
	card: {
		name: 'Card Layout',
		description: 'Card component with title, description, and optional image',
		slots: [
			{ name: 'title', type: 'text', required: true, description: 'Card title' },
			{ name: 'description', type: 'text', required: false, description: 'Card description' },
			{ name: 'image', type: 'image', required: false, description: 'Card image' },
			{ name: 'link', type: 'text', required: false, description: 'Card link URL' }
		],
		component: 'CardLayout'
	},
	grid: {
		name: 'Grid Layout',
		description: 'Grid of items with consistent structure',
		slots: [
			{ name: 'title', type: 'text', required: true, description: 'Grid section title' },
			{ name: 'items', type: 'list', required: true, description: 'Array of grid items' }
		],
		component: 'GridLayout'
	},
	default: {
		name: 'Default Layout',
		description: 'Standard markdown content layout',
		slots: [
			{ name: 'title', type: 'text', required: true, description: 'Page title' },
			{ name: 'content', type: 'text', required: true, description: 'Markdown content' }
		],
		component: 'DefaultLayout'
	}
};

/**
 * Get layout by name
 */
export function getLayout(name: string): LayoutContract | null {
	return LAYOUT_REGISTRY[name] || LAYOUT_REGISTRY.default;
}

/**
 * List all available layouts
 */
export function listLayouts(): LayoutContract[] {
	return Object.values(LAYOUT_REGISTRY);
}

/**
 * Validate content matches layout contract
 */
export function validateLayoutContent(
	layoutName: string,
	content: Record<string, any>
): { valid: boolean; errors: string[] } {
	const layout = getLayout(layoutName);
	if (!layout) {
		return {
			valid: false,
			errors: [`Layout "${layoutName}" not found`]
		};
	}

	const errors: string[] = [];

	for (const slot of layout.slots) {
		if (slot.required && !content[slot.name]) {
			errors.push(`Required slot "${slot.name}" is missing`);
		}

		// Type validation
		if (content[slot.name]) {
			const value = content[slot.name];
			switch (slot.type) {
				case 'text':
					if (typeof value !== 'string') {
						errors.push(`Slot "${slot.name}" must be a string`);
					}
					break;
				case 'image':
					if (typeof value !== 'string' || !value.startsWith('/') && !value.startsWith('http')) {
						errors.push(`Slot "${slot.name}" must be a valid image URL`);
					}
					break;
				case 'list':
					if (!Array.isArray(value)) {
						errors.push(`Slot "${slot.name}" must be an array`);
					}
					break;
				case 'object':
					if (typeof value !== 'object' || Array.isArray(value)) {
						errors.push(`Slot "${slot.name}" must be an object`);
					}
					break;
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Map markdown frontmatter to layout slots
 */
export function mapContentToLayout(
	layoutName: string,
	frontmatter: Record<string, any>,
	body: string
): Record<string, any> {
	const layout = getLayout(layoutName);
	if (!layout) {
		return { ...frontmatter, content: body };
	}

	const mapped: Record<string, any> = {
		...frontmatter,
		content: body
	};

	// Ensure all required slots have values
	for (const slot of layout.slots) {
		if (slot.required && !mapped[slot.name]) {
			// Set default based on type
			switch (slot.type) {
				case 'text':
					mapped[slot.name] = '';
					break;
				case 'list':
					mapped[slot.name] = [];
					break;
				case 'object':
					mapped[slot.name] = {};
					break;
			}
		}
	}

	return mapped;
}
