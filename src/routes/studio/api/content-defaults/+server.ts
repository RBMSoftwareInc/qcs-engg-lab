import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireAdmin } from '$lib/studio/auth';
import { getFileContent, createOrUpdateFile } from '$lib/studio/github-api';

const CONTENT_DEFAULTS_PATH = 'config/content-defaults.json';

type ContentDefaultsConfig = {
	defaultStatus?: string;
	defaultTemplate?: string;
};

function normalize(raw: unknown): ContentDefaultsConfig {
	if (!raw || typeof raw !== 'object') return {};
	const o = raw as Record<string, unknown>;
	return {
		defaultStatus: typeof o.defaultStatus === 'string' ? o.defaultStatus.trim() : 'draft',
		defaultTemplate: typeof o.defaultTemplate === 'string' ? o.defaultTemplate.trim() : ''
	};
}

export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const result = await getFileContent(CONTENT_DEFAULTS_PATH);
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
			CONTENT_DEFAULTS_PATH,
			JSON.stringify(config, null, 2),
			'Update content defaults from Studio'
		);
		if (result.success) return json({ success: true, config });
		return json({ success: false, message: result.error || 'Failed to save' }, { status: 500 });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
