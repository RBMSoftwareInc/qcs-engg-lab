import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { createOrUpdateFile, getFileContent } from '$lib/studio/github-api';

/**
 * GET /studio/api/design-skins/active
 * Get the currently active design skin
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const sessionCookie = cookies.get('studio_session');
	if (!sessionCookie) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const session = JSON.parse(sessionCookie);
		if (!validateSession(session)) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	} catch (e) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await getFileContent('design/active-skin.json');
		
		if (!result.success || !result.data) {
			return json({ activeSkin: null });
		}

		try {
			const active = JSON.parse(result.data.content);
			return json({ activeSkin: active.skin || null });
		} catch (e) {
			return json({ activeSkin: null });
		}
	} catch (error: any) {
		return json({ error: error.message || 'Failed to get active skin' }, { status: 500 });
	}
};

/**
 * POST /studio/api/design-skins/active
 * Set the active design skin
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const sessionCookie = cookies.get('studio_session');
	if (!sessionCookie) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const session = JSON.parse(sessionCookie);
		if (!validateSession(session)) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	} catch (e) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { skin } = await request.json();

		if (!skin) {
			return json({ success: false, message: 'Skin name required' }, { status: 400 });
		}

		// Get existing file SHA if it exists
		const existing = await getFileContent('design/active-skin.json');
		let sha = undefined;
		if (existing.success && existing.data) {
			sha = existing.data.sha;
		}

		// Create or update active skin file
		const content = JSON.stringify({ skin }, null, 2);
		const result = await createOrUpdateFile(
			'design/active-skin.json',
			content,
			`Set active design skin: ${skin}`,
			sha
		);

		if (!result.success) {
			return json({ 
				success: false, 
				message: result.error || 'Failed to set active skin' 
			}, { status: 500 });
		}

		return json({ 
			success: true, 
			message: 'Active skin updated',
			activeSkin: skin
		});
	} catch (error: any) {
		return json({ success: false, message: error.message || 'Server error' }, { status: 500 });
	}
};
