import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireAdmin } from '$lib/studio/auth';
import { createOrUpdateFile, getFileContent } from '$lib/studio/github-api';

const STUDIO_CONFIG_PATH = 'config/studio.json';

export type StudioConfig = {
	publishWebhookUrl?: string;
	defaultNewContentStatus?: 'draft' | 'live';
};

const DEFAULTS: StudioConfig = {
	publishWebhookUrl: '',
	defaultNewContentStatus: 'draft'
};

function normalize(raw: unknown): StudioConfig {
	if (!raw || typeof raw !== 'object') return DEFAULTS;
	const o = raw as Record<string, unknown>;
	return {
		publishWebhookUrl: typeof o.publishWebhookUrl === 'string' ? o.publishWebhookUrl.trim() : '',
		defaultNewContentStatus: o.defaultNewContentStatus === 'live' ? 'live' : 'draft'
	};
}

function loadLocal(): StudioConfig {
	try {
		const path = join(process.cwd(), STUDIO_CONFIG_PATH);
		if (!existsSync(path)) return DEFAULTS;
		const raw = readFileSync(path, 'utf-8');
		return normalize(JSON.parse(raw));
	} catch {
		return DEFAULTS;
	}
}

/** GET: return current studio config */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const config = loadLocal();
	return json({ config });
};

/** POST: save studio config (Admin only) */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireAdmin(session)) {
		return json({ error: 'Admin only' }, { status: 403 });
	}
	try {
		const body = await request.json();
		const config = normalize(body);
		const content = JSON.stringify(config, null, 2);
		try {
			await createOrUpdateFile(STUDIO_CONFIG_PATH, content, 'Update Studio config');
		} catch {
			// GitHub not configured
		}
		writeFileSync(join(process.cwd(), STUDIO_CONFIG_PATH), content, 'utf-8');
		return json({ success: true, config });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
