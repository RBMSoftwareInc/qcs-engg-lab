import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireAdmin } from '$lib/studio/auth';
import { getFileContent, createOrUpdateFile } from '$lib/studio/github-api';

const SEO_CONFIG_PATH = 'config/seo.json';

const SEO_CONFIG_DEFAULTS = {
	siteUrl: '',
	defaultTitle: 'QuantumCore Solutions',
	defaultDescription:
		'Architecture before infrastructure. Systems designed to evolve. Engineering lab focused on systems architecture and research-driven development.',
	gtmId: '',
	gaMeasurementId: '',
	ogImage: '',
	twitterHandle: ''
} as const;

type SeoConfig = {
	siteUrl?: string;
	defaultTitle?: string;
	defaultDescription?: string;
	gtmId?: string;
	gaMeasurementId?: string;
	ogImage?: string;
	twitterHandle?: string;
};

function normalizeConfig(raw: unknown): SeoConfig {
	if (!raw || typeof raw !== 'object') return {};
	const o = raw as Record<string, unknown>;
	return {
		siteUrl: typeof o.siteUrl === 'string' ? o.siteUrl.trim() : '',
		defaultTitle: typeof o.defaultTitle === 'string' ? o.defaultTitle.trim() : SEO_CONFIG_DEFAULTS.defaultTitle,
		defaultDescription:
			typeof o.defaultDescription === 'string' ? o.defaultDescription.trim() : SEO_CONFIG_DEFAULTS.defaultDescription,
		gtmId: typeof o.gtmId === 'string' ? o.gtmId.trim() : '',
		gaMeasurementId: typeof o.gaMeasurementId === 'string' ? o.gaMeasurementId.trim() : '',
		ogImage: typeof o.ogImage === 'string' ? o.ogImage.trim() : '',
		twitterHandle: typeof o.twitterHandle === 'string' ? o.twitterHandle.trim() : ''
	};
}

/** GET: return current SEO config (from repo or defaults) */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await getFileContent(SEO_CONFIG_PATH);
		if (result.success && result.data?.content) {
			let parsed: unknown;
			try {
				parsed = JSON.parse(result.data.content);
			} catch {
				return json({ config: normalizeConfig({}) });
			}
			return json({ config: normalizeConfig(parsed) });
		}
		return json({ config: normalizeConfig({}) });
	} catch (err: unknown) {
		return json({ config: normalizeConfig({}) });
	}
};

/** POST: save SEO config to config/seo.json (Admin only) */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireAdmin(session)) {
		return json({ error: 'Admin only' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const config = normalizeConfig(body);
		const content = JSON.stringify(config, null, 2);
		const result = await createOrUpdateFile(
			SEO_CONFIG_PATH,
			content,
			'Update SEO config from Studio'
		);
		if (result.success) {
			return json({ success: true, config });
		}
		return json({ success: false, message: result.error || 'Failed to save' }, { status: 500 });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
