/**
 * Figma API Integration
 * Fetches design tokens from Figma files
 * 
 * This is NOT for importing raw frames or generating HTML.
 * This ONLY imports design tokens (colors, typography, spacing).
 */

export interface FigmaToken {
	name: string;
	value: string;
	type: 'color' | 'typography' | 'spacing' | 'other';
}

export interface FigmaColorStyle {
	id: string;
	name: string;
	description?: string;
	styles: {
		fills?: Array<{
			type: string;
			color?: {
				r: number;
				g: number;
				b: number;
				a: number;
			};
		}>;
	};
}

export interface FigmaTextStyle {
	id: string;
	name: string;
	description?: string;
	style: {
		fontFamily?: string;
		fontSize?: number;
		fontWeight?: number;
		lineHeight?: number;
		letterSpacing?: number;
	};
}

export interface DesignTokens {
	colors: Record<string, string>;
	fonts: Record<string, string>;
	spacing: Record<string, string>;
	metadata?: {
		source: string;
		importedAt: string;
		figmaFileId?: string;
	};
}

/**
 * Get Figma API token from environment
 */
function getFigmaToken(): string {
	const token = process.env.FIGMA_TOKEN || process.env.VITE_FIGMA_TOKEN;
	if (!token) {
		throw new Error('Figma token not configured. Set FIGMA_TOKEN environment variable.');
	}
	return token;
}

/**
 * Make authenticated Figma API request
 */
async function figmaRequest<T>(endpoint: string): Promise<{ success: boolean; data?: T; error?: string }> {
	try {
		const token = getFigmaToken();
		const url = `https://api.figma.com/v1${endpoint}`;

		const response = await fetch(url, {
			headers: {
				'X-Figma-Token': token,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `Figma API error: ${response.status} ${response.statusText}`;
			
			try {
				const errorJson = JSON.parse(errorText);
				errorMessage = errorJson.err || errorMessage;
			} catch {
				errorMessage = errorText || errorMessage;
			}

			return {
				success: false,
				error: errorMessage
			};
		}

		const data = await response.json();
		return {
			success: true,
			data
		};
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Figma API request failed'
		};
	}
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (n: number) => {
		const hex = Math.round(n * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Fetch color styles from Figma file
 */
async function fetchColorStyles(fileId: string): Promise<FigmaColorStyle[]> {
	const result = await figmaRequest<{ meta: { styles: FigmaColorStyle[] } }>(
		`/files/${fileId}/styles`
	);

	if (!result.success || !result.data) {
		return [];
	}

	// Filter for fill styles (colors)
	return result.data.meta.styles.filter(style => {
		// We'll need to get the actual style data
		return true; // For now, return all styles
	});
}

/**
 * Fetch text styles from Figma file
 */
async function fetchTextStyles(fileId: string): Promise<FigmaTextStyle[]> {
	const result = await figmaRequest<{ meta: { styles: any[] } }>(
		`/files/${fileId}/styles`
	);

	if (!result.success || !result.data) {
		return [];
	}

	// Filter for text styles
	return result.data.meta.styles.filter((style: any) => {
		return style.styleType === 'TEXT';
	}).map((style: any) => ({
		id: style.key,
		name: style.name,
		description: style.description,
		style: {
			fontFamily: style.style.fontFamily,
			fontSize: style.style.fontSize,
			fontWeight: style.style.fontWeight,
			lineHeight: style.style.lineHeightPx,
			letterSpacing: style.style.letterSpacing
		}
	}));
}

/**
 * Get file nodes to extract design tokens
 */
async function getFileNodes(fileId: string): Promise<any> {
	const result = await figmaRequest<{ document: any }>(
		`/files/${fileId}`
	);

	if (!result.success || !result.data) {
		return null;
	}

	return result.data.document;
}

/**
 * Extract color tokens from Figma file
 */
async function extractColorTokens(fileId: string): Promise<Record<string, string>> {
	const nodes = await getFileNodes(fileId);
	const colors: Record<string, string> = {};

	if (!nodes) {
		return colors;
	}

	// Traverse document to find color styles
	function traverse(node: any) {
		if (node.fills && Array.isArray(node.fills)) {
			for (const fill of node.fills) {
				if (fill.type === 'SOLID' && fill.color) {
					const colorName = node.name || 'color';
					const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
					// Use a sanitized name
					const key = colorName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
					if (key && !colors[key]) {
						colors[key] = hex;
					}
				}
			}
		}

		if (node.children) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	}

	traverse(nodes);

	return colors;
}

/**
 * Extract typography tokens from Figma file
 */
async function extractTypographyTokens(fileId: string): Promise<Record<string, string>> {
	const textStyles = await fetchTextStyles(fileId);
	const fonts: Record<string, string> = {};

	for (const style of textStyles) {
		if (style.style.fontFamily) {
			const key = style.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
			if (key) {
				fonts[key] = style.style.fontFamily;
			}
		}
	}

	return fonts;
}

/**
 * Extract spacing tokens from Figma file (from frame padding, gaps, etc.)
 */
async function extractSpacingTokens(fileId: string): Promise<Record<string, string>> {
	const nodes = await getFileNodes(fileId);
	const spacing: Record<string, string> = {};

	if (!nodes) {
		return spacing;
	}

	// Common spacing values to extract
	const spacingValues = new Set<number>();

	function traverse(node: any) {
		// Extract padding
		if (node.paddingLeft) spacingValues.add(node.paddingLeft);
		if (node.paddingRight) spacingValues.add(node.paddingRight);
		if (node.paddingTop) spacingValues.add(node.paddingTop);
		if (node.paddingBottom) spacingValues.add(node.paddingBottom);

		// Extract gaps
		if (node.itemSpacing) spacingValues.add(node.itemSpacing);

		// Extract corner radius (sometimes used as spacing reference)
		if (node.cornerRadius) spacingValues.add(node.cornerRadius);

		if (node.children) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	}

	traverse(nodes);

	// Convert to named tokens
	const sorted = Array.from(spacingValues).sort((a, b) => a - b);
	
	// Map to standard names
	const names = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
	for (let i = 0; i < Math.min(sorted.length, names.length); i++) {
		spacing[names[i]] = `${sorted[i]}px`;
	}

	return spacing;
}

/**
 * Import design tokens from Figma file
 */
export async function importFigmaTokens(fileId: string): Promise<{ success: boolean; tokens?: DesignTokens; error?: string }> {
	try {
		const [colors, fonts, spacing] = await Promise.all([
			extractColorTokens(fileId),
			extractTypographyTokens(fileId),
			extractSpacingTokens(fileId)
		]);

		const tokens: DesignTokens = {
			colors,
			fonts,
			spacing,
			metadata: {
				source: 'figma',
				importedAt: new Date().toISOString(),
				figmaFileId: fileId
			}
		};

		return {
			success: true,
			tokens
		};
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to import Figma tokens'
		};
	}
}
