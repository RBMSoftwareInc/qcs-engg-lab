import { json } from '@sveltejs/kit';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireAdmin } from '$lib/studio/auth';
import { createOrUpdateFile, getFileContent } from '$lib/studio/github-api';
import { normalizeMenus, type MenusConfig } from '$lib/menus';

const MENUS_CONFIG_PATH = 'config/menus.json';

/** GET: return current menus (from repo or local file) */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Prefer local file so Studio shows what the site actually uses
		const localPath = join(process.cwd(), MENUS_CONFIG_PATH);
		if (existsSync(localPath)) {
			const { readFileSync } = await import('fs');
			const raw = readFileSync(localPath, 'utf-8');
			const parsed = JSON.parse(raw) as unknown;
			return json({ menus: normalizeMenus(parsed) });
		}
		// Fallback: try GitHub
		const result = await getFileContent(MENUS_CONFIG_PATH);
		if (result.success && result.data?.content) {
			try {
				const parsed = JSON.parse(result.data.content) as unknown;
				return json({ menus: normalizeMenus(parsed) });
			} catch {
				return json({ menus: normalizeMenus(null) });
			}
		}
		return json({ menus: normalizeMenus(null) });
	} catch {
		return json({ menus: normalizeMenus(null) });
	}
};

/** POST: save menus (Admin only) */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireAdmin(session)) {
		return json({ error: 'Admin only' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const menus = normalizeMenus(body) as MenusConfig;
		const content = JSON.stringify(menus, null, 2);

		// Write to GitHub if configured (so repo is updated)
		try {
			await createOrUpdateFile(MENUS_CONFIG_PATH, content, 'Update site menus from Studio');
		} catch {
			// GitHub not configured or failed; continue to write local
		}

		// Always write to local file so the running app sees changes immediately
		const localPath = join(process.cwd(), MENUS_CONFIG_PATH);
		writeFileSync(localPath, content, 'utf-8');

		return json({ success: true, menus });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
