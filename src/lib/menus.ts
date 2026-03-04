/**
 * Site menu config: header nav, footer nav, and CTA items.
 * Consumed by +layout.server.ts and Studio API; edited via Studio Settings → Menus.
 */

export type MenuLink = {
	label: string;
	href: string;
	enabled?: boolean;
};

export type CtaItem = {
	id?: string;
	label: string;
	type: 'modal' | 'link';
	href?: string;
	enabled?: boolean;
};

export type MenusConfig = {
	header: MenuLink[];
	footer: MenuLink[];
	cta: CtaItem[];
};

export const DEFAULT_MENUS: MenusConfig = {
	header: [
		{ label: 'Practice', href: '/practice', enabled: true },
		{ label: 'Philosophy', href: '/philosophy', enabled: true },
		{ label: 'Insights', href: '/insights', enabled: true },
		{ label: 'Signals', href: '/signals', enabled: true },
		{ label: 'Neural', href: '/playground', enabled: true },
		{ label: 'Forge', href: '/forge', enabled: true },
		{ label: 'About', href: '/about', enabled: true }
	],
	footer: [
		{ label: 'Practice', href: '/practice', enabled: true },
		{ label: 'Philosophy', href: '/philosophy', enabled: true },
		{ label: 'Insights', href: '/insights', enabled: true },
		{ label: 'Signals', href: '/signals', enabled: true },
		{ label: 'Neural', href: '/playground', enabled: true },
		{ label: 'Forge', href: '/forge', enabled: true },
		{ label: 'About', href: '/about', enabled: true }
	],
	cta: [
		{ id: 'initiate', label: 'Initiate', type: 'modal', enabled: true },
		{ id: 'contact', label: 'Contact', type: 'link', href: 'mailto:info@quantumcoresolutions.com', enabled: false }
	]
};

function normalizeLink(raw: unknown): MenuLink | null {
	if (!raw || typeof raw !== 'object') return null;
	const o = raw as Record<string, unknown>;
	const label = typeof o.label === 'string' ? o.label.trim() : '';
	const href = typeof o.href === 'string' ? o.href.trim() : '';
	if (!label || !href) return null;
	return {
		label,
		href,
		enabled: o.enabled !== false
	};
}

function normalizeCta(raw: unknown): CtaItem | null {
	if (!raw || typeof raw !== 'object') return null;
	const o = raw as Record<string, unknown>;
	const label = typeof o.label === 'string' ? o.label.trim() : '';
	const type = o.type === 'link' ? 'link' : 'modal';
	if (!label) return null;
	const item: CtaItem = { label, type, enabled: o.enabled !== false };
	if (typeof o.id === 'string') item.id = o.id.trim();
	if (type === 'link' && typeof o.href === 'string') item.href = o.href.trim();
	return item;
}

export function normalizeMenus(raw: unknown): MenusConfig {
	if (!raw || typeof raw !== 'object') return DEFAULT_MENUS;
	const o = raw as Record<string, unknown>;
	const header = Array.isArray(o.header)
		? o.header.map(normalizeLink).filter((x): x is MenuLink => x !== null)
		: [...DEFAULT_MENUS.header];
	const footer = Array.isArray(o.footer)
		? o.footer.map(normalizeLink).filter((x): x is MenuLink => x !== null)
		: [...DEFAULT_MENUS.footer];
	const cta = Array.isArray(o.cta)
		? o.cta.map(normalizeCta).filter((x): x is CtaItem => x !== null)
		: [...DEFAULT_MENUS.cta];
	return { header, footer, cta };
}
