/**
 * Design Tokens → CSS Variables Pipeline
 * Converts design tokens to CSS custom properties
 */

import type { DesignTokens } from './figma-api';

/**
 * Convert design tokens to CSS variables
 */
export function tokensToCSS(tokens: DesignTokens, skinName: string): string {
	const lines: string[] = [];
	
	lines.push(`/* Design Skin: ${skinName} */`);
	lines.push(`/* Generated from design tokens */`);
	lines.push(`:root {`);
	lines.push(``);

	// Color tokens
	if (tokens.colors && Object.keys(tokens.colors).length > 0) {
		lines.push(`  /* Colors */`);
		for (const [key, value] of Object.entries(tokens.colors)) {
			const cssVar = `--color-${key}`;
			lines.push(`  ${cssVar}: ${value};`);
		}
		lines.push(``);
	}

	// Font tokens
	if (tokens.fonts && Object.keys(tokens.fonts).length > 0) {
		lines.push(`  /* Typography */`);
		for (const [key, value] of Object.entries(tokens.fonts)) {
			const cssVar = `--font-${key}`;
			lines.push(`  ${cssVar}: '${value}';`);
		}
		lines.push(``);
	}

	// Spacing tokens
	if (tokens.spacing && Object.keys(tokens.spacing).length > 0) {
		lines.push(`  /* Spacing */`);
		for (const [key, value] of Object.entries(tokens.spacing)) {
			const cssVar = `--space-${key}`;
			lines.push(`  ${cssVar}: ${value};`);
		}
		lines.push(``);
	}

	lines.push(`}`);

	return lines.join('\n');
}

/**
 * Validate design tokens schema
 */
export function validateTokens(tokens: any): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!tokens || typeof tokens !== 'object') {
		errors.push('Tokens must be an object');
		return { valid: false, errors };
	}

	// Colors should be object with string values
	if (tokens.colors) {
		if (typeof tokens.colors !== 'object' || Array.isArray(tokens.colors)) {
			errors.push('Colors must be an object');
		} else {
			for (const [key, value] of Object.entries(tokens.colors)) {
				if (typeof value !== 'string') {
					errors.push(`Color "${key}" must be a string`);
				} else if (!/^#[0-9A-Fa-f]{6}$/.test(value) && !/^#[0-9A-Fa-f]{3}$/.test(value)) {
					errors.push(`Color "${key}" must be a valid hex color`);
				}
			}
		}
	}

	// Fonts should be object with string values
	if (tokens.fonts) {
		if (typeof tokens.fonts !== 'object' || Array.isArray(tokens.fonts)) {
			errors.push('Fonts must be an object');
		} else {
			for (const [key, value] of Object.entries(tokens.fonts)) {
				if (typeof value !== 'string') {
					errors.push(`Font "${key}" must be a string`);
				}
			}
		}
	}

	// Spacing should be object with string values (px, rem, etc.)
	if (tokens.spacing) {
		if (typeof tokens.spacing !== 'object' || Array.isArray(tokens.spacing)) {
			errors.push('Spacing must be an object');
		} else {
			for (const [key, value] of Object.entries(tokens.spacing)) {
				if (typeof value !== 'string') {
					errors.push(`Spacing "${key}" must be a string`);
				}
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Get default design tokens (fallback)
 */
export function getDefaultTokens(): DesignTokens {
	return {
		colors: {
			primary: '#1F2937',
			secondary: '#4B5563',
			background: '#FFFFFF',
			text: '#1F2937',
			textSecondary: '#6B7280'
		},
		fonts: {
			body: 'system-ui, -apple-system, sans-serif',
			heading: 'system-ui, -apple-system, sans-serif',
			mono: 'Monaco, "Courier New", monospace'
		},
		spacing: {
			xs: '4px',
			sm: '8px',
			md: '16px',
			lg: '32px',
			xl: '64px'
		}
	};
}
