import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { LayoutServerLoad } from './$types';
import { normalizeMenus, DEFAULT_MENUS } from '$lib/menus';

const SEO_CONFIG_PATH = 'config/seo.json';
const MENUS_CONFIG_PATH = 'config/menus.json';
const ACTIVE_SKIN_PATH = 'design/active-skin.json';
const DESIGN_SKINS_DIR = 'design/skins';

export type SeoConfig = {
	siteUrl?: string;
	defaultTitle?: string;
	defaultDescription?: string;
	gtmId?: string;
	gaMeasurementId?: string;
	ogImage?: string;
	twitterHandle?: string;
};

function loadSeoConfig(): SeoConfig | null {
	try {
		const path = join(process.cwd(), SEO_CONFIG_PATH);
		if (!existsSync(path)) return null;
		const raw = readFileSync(path, 'utf-8');
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		return {
			siteUrl: typeof parsed.siteUrl === 'string' ? parsed.siteUrl.trim() : undefined,
			defaultTitle: typeof parsed.defaultTitle === 'string' ? parsed.defaultTitle.trim() : undefined,
			defaultDescription:
				typeof parsed.defaultDescription === 'string' ? parsed.defaultDescription.trim() : undefined,
			gtmId: typeof parsed.gtmId === 'string' ? parsed.gtmId.trim() : undefined,
			gaMeasurementId:
				typeof parsed.gaMeasurementId === 'string' ? parsed.gaMeasurementId.trim() : undefined,
			ogImage: typeof parsed.ogImage === 'string' ? parsed.ogImage.trim() : undefined,
			twitterHandle: typeof parsed.twitterHandle === 'string' ? parsed.twitterHandle.trim() : undefined
		};
	} catch {
		return null;
	}
}

function loadMenusConfig(): typeof DEFAULT_MENUS {
	try {
		const path = join(process.cwd(), MENUS_CONFIG_PATH);
		if (!existsSync(path)) return DEFAULT_MENUS;
		const raw = readFileSync(path, 'utf-8');
		const parsed = JSON.parse(raw) as unknown;
		return normalizeMenus(parsed);
	} catch {
		return DEFAULT_MENUS;
	}
}

function loadActiveSkinCss(): { skinCss: string; activeSkinName: string | null } | null {
	try {
		const root = process.cwd();
		const activePath = join(root, ACTIVE_SKIN_PATH);
		if (!existsSync(activePath)) return null;
		const activeRaw = readFileSync(activePath, 'utf-8');
		const active = JSON.parse(activeRaw) as { skin?: string };
		const name = typeof active?.skin === 'string' ? active.skin.trim() : null;
		if (!name) return null;
		const cssPath = join(root, DESIGN_SKINS_DIR, `${name}.css`);
		if (!existsSync(cssPath)) return null;
		const skinCss = readFileSync(cssPath, 'utf-8');
		return { skinCss, activeSkinName: name };
	} catch {
		return null;
	}
}

export const load: LayoutServerLoad = async () => {
	const seoConfig = loadSeoConfig();
	const menus = loadMenusConfig();
	const skin = loadActiveSkinCss();
	return {
		seoConfig,
		menus,
		skinCss: skin?.skinCss ?? null,
		activeSkinName: skin?.activeSkinName ?? null
	};
};
