import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireAdmin } from '$lib/studio/auth';
import { getFileContent, createOrUpdateFile } from '$lib/studio/github-api';
import {
	DATA_FORMS_CONFIG_PATH,
	normalizeDataFormsConfig,
	getDefaultDataFormsConfig
} from '$lib/studio/data-forms-config';

/** GET: return current data forms config (from repo or defaults) */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await getFileContent(DATA_FORMS_CONFIG_PATH);
		if (result.success && result.data?.content) {
			let parsed: unknown;
			try {
				parsed = JSON.parse(result.data.content);
			} catch {
				return json({ config: getDefaultDataFormsConfig() });
			}
			return json({ config: normalizeDataFormsConfig(parsed) });
		}
		return json({ config: getDefaultDataFormsConfig() });
	} catch {
		return json({ config: getDefaultDataFormsConfig() });
	}
};

/** POST: save data forms config (Admin only) */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireAdmin(session)) {
		return json({ error: 'Admin only' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const config = normalizeDataFormsConfig(body);
		const content = JSON.stringify(config, null, 2);
		const result = await createOrUpdateFile(
			DATA_FORMS_CONFIG_PATH,
			content,
			'Update Data Forms config from Studio'
		);
		if (result.success) {
			return json({ success: true, config });
		}
		return json({ success: false, message: result.error || 'Failed to save' }, { status: 500 });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
