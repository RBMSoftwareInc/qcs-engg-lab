import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { getFileContent } from '$lib/studio/github-api';

/**
 * GET /studio/api/design-skins/[name]/css
 * Get CSS file for a design skin
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
	const sessionCookie = cookies.get('studio_session');
	if (!sessionCookie) {
		return text('Unauthorized', { status: 401 });
	}

	try {
		const session = JSON.parse(sessionCookie);
		if (!validateSession(session)) {
			return text('Unauthorized', { status: 401 });
		}
	} catch (e) {
		return text('Unauthorized', { status: 401 });
	}

	try {
		const skinName = params.name;
		if (!skinName) {
			return text('Skin name required', { status: 400 });
		}

		const cssPath = `design/skins/${skinName}.css`;
		const result = await getFileContent(cssPath);

		if (!result.success || !result.data) {
			return text('Skin CSS not found', { status: 404 });
		}

		return text(result.data.content, {
			headers: {
				'Content-Type': 'text/css'
			}
		});
	} catch (error: any) {
		return text(error.message || 'Failed to get skin CSS', { status: 500 });
	}
};
