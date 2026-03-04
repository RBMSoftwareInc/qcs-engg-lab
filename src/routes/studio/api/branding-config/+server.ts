import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireAdmin } from '$lib/studio/auth';
import { getFileContent, createOrUpdateFile } from '$lib/studio/github-api';

const BRANDING_CONFIG_PATH = 'config/branding.json';

type BrandingConfig = {
	siteName?: string;
	tagline?: string;
	logoUrl?: string;
	faviconUrl?: string;
};

function normalize(raw: unknown): BrandingConfig {
	if (!raw || typeof raw !== 'object') return {};
	const o = raw as Record<string, unknown>;
	return {
		siteName: typeof o.siteName === 'string' ? o.siteName.trim() : '',
		tagline: typeof o.tagline === 'string' ? o.tagline.trim() : '',
		logoUrl: typeof o.logoUrl === 'string' ? o.logoUrl.trim() : '',
		faviconUrl: typeof o.faviconUrl === 'string' ? o.faviconUrl.trim() : ''
	};
}

export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const result = await getFileContent(BRANDING_CONFIG_PATH);
		if (result.success && result.data?.content) {
			try {
				return json({ config: normalize(JSON.parse(result.data.content)) });
			} catch {
				return json({ config: normalize({}) });
			}
		}
		return json({ config: normalize({}) });
	} catch {
		return json({ config: normalize({}) });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireAdmin(session)) return json({ error: 'Admin only' }, { status: 403 });
	try {
		const body = await request.json();
		const config = normalize(body);
		const result = await createOrUpdateFile(
			BRANDING_CONFIG_PATH,
			JSON.stringify(config, null, 2),
			'Update branding config from Studio'
		);
		if (result.success) return json({ success: true, config });
		return json({ success: false, message: result.error || 'Failed to save' }, { status: 500 });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
