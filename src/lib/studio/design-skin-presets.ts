/**
 * Predefined design skin presets. Use "Create from preset" in Studio Design Skins to create a skin from these.
 */

import type { DesignTokens } from './figma-api';

export interface SkinPreset {
	id: string;
	label: string;
	description: string;
	tokens: DesignTokens;
}

export const SKIN_PRESETS: SkinPreset[] = [
	{
		id: 'default',
		label: 'Default (current site)',
		description: 'Creamy white, mango highlight, IBM Plex',
		tokens: {
			colors: {
				background: '#FFFDF7',
				backgroundSecondary: '#FFF6DB',
				accent: '#FFE8A3',
				text: '#1F2937',
				textSecondary: '#4B5563',
				textMuted: '#9CA3AF',
				primary: '#F4C430',
				highlight: '#F4C430',
				borderSubtle: 'rgba(31, 41, 55, 0.08)'
			},
			fonts: {
				body: 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
				heading: 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
				mono: 'IBM Plex Mono, Courier New, monospace'
			},
			spacing: { xs: '4px', sm: '8px', md: '16px', lg: '32px', xl: '64px' }
		}
	},
	{
		id: 'dark',
		label: 'Dark',
		description: 'Dark background, light text, amber accent',
		tokens: {
			colors: {
				background: '#111827',
				backgroundSecondary: '#1F2937',
				accent: '#374151',
				text: '#F9FAFB',
				textSecondary: '#D1D5DB',
				textMuted: '#9CA3AF',
				primary: '#F59E0B',
				highlight: '#F59E0B',
				borderSubtle: 'rgba(255, 255, 255, 0.1)'
			},
			fonts: {
				body: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
				heading: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
				mono: 'JetBrains Mono, Monaco, Courier New, monospace'
			},
			spacing: { xs: '4px', sm: '8px', md: '16px', lg: '32px', xl: '64px' }
		}
	},
	{
		id: 'high-contrast',
		label: 'High contrast',
		description: 'Black and white with strong accent for accessibility',
		tokens: {
			colors: {
				background: '#FFFFFF',
				backgroundSecondary: '#F3F4F6',
				accent: '#E5E7EB',
				text: '#000000',
				textSecondary: '#374151',
				textMuted: '#6B7280',
				primary: '#2563EB',
				highlight: '#2563EB',
				borderSubtle: 'rgba(0, 0, 0, 0.2)'
			},
			fonts: {
				body: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
				heading: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
				mono: 'ui-monospace, monospace'
			},
			spacing: { xs: '4px', sm: '8px', md: '16px', lg: '32px', xl: '64px' }
		}
	},
	{
		id: 'serif',
		label: 'Serif editorial',
		description: 'Classic serif fonts, warm paper tone',
		tokens: {
			colors: {
				background: '#FDFBF7',
				backgroundSecondary: '#F5F0E8',
				accent: '#E8E0D4',
				text: '#2C2419',
				textSecondary: '#5C5348',
				textMuted: '#8C8378',
				primary: '#8B4513',
				highlight: '#8B4513',
				borderSubtle: 'rgba(44, 36, 25, 0.12)'
			},
			fonts: {
				body: 'Lora, Georgia, Times New Roman, serif',
				heading: 'Playfair Display, Georgia, serif',
				mono: 'Source Code Pro, Courier New, monospace'
			},
			spacing: { xs: '4px', sm: '8px', md: '16px', lg: '32px', xl: '64px' }
		}
	},
	{
		id: 'minimal',
		label: 'Minimal',
		description: 'Light gray, no strong accent, clean spacing',
		tokens: {
			colors: {
				background: '#FAFAFA',
				backgroundSecondary: '#F5F5F5',
				accent: '#EEEEEE',
				text: '#171717',
				textSecondary: '#525252',
				textMuted: '#737373',
				primary: '#404040',
				highlight: '#404040',
				borderSubtle: 'rgba(0, 0, 0, 0.06)'
			},
			fonts: {
				body: 'system-ui, -apple-system, sans-serif',
				heading: 'system-ui, -apple-system, sans-serif',
				mono: 'ui-monospace, monospace'
			},
			spacing: { xs: '4px', sm: '12px', md: '24px', lg: '48px', xl: '80px' }
		}
	}
];

export function getPresetById(id: string): SkinPreset | undefined {
	return SKIN_PRESETS.find((p) => p.id === id);
}
