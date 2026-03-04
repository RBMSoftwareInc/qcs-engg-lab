import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireAdmin } from '$lib/studio/auth';
import { getFileContent, createOrUpdateFile } from '$lib/studio/github-api';

const ACCESSIBILITY_CONFIG_PATH = 'config/accessibility.json';

type AccessibilityConfig = {
	skipLinkLabel?: string;
	a11yStatementUrl?: string;
};

function normalize(raw: unknown): AccessibilityConfig {
	if (!raw || typeof raw !== 'object') return {};
	const o = raw as Record<string, unknown>;
	return {
		skipLinkLabel: typeof o.skipLinkLabel === 'string' ? o.skipLinkLabel.trim() : 'Skip to main content',
		a11yStatementUrl: typeof o.a11yStatementUrl === 'string' ? o.a11yStatementUrl.trim() : ''
	};
}

export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const result = await getFileContent(ACCESSIBILITY_CONFIG_PATH);
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
			ACCESSIBILITY_CONFIG_PATH,
			JSON.stringify(config, null, 2),
			'Update accessibility config from Studio'
		);
		if (result.success) return json({ success: true, config });
		return json({ success: false, message: result.error || 'Failed to save' }, { status: 500 });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
