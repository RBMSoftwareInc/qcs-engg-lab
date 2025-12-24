import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { listLayouts, getLayout, validateLayoutContent } from '$lib/studio/layout-contracts';

/**
 * GET /studio/api/layouts
 * List all available layout contracts
 */
export const GET: RequestHandler = async ({ cookies, url }) => {
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
		const layoutName = url.searchParams.get('name');
		
		if (layoutName) {
			// Get specific layout
			const layout = getLayout(layoutName);
			if (!layout) {
				return json({ error: `Layout "${layoutName}" not found` }, { status: 404 });
			}
			return json({ layout });
		}

		// List all layouts
		const layouts = listLayouts();
		return json({ layouts });
	} catch (error: any) {
		return json({ error: error.message || 'Failed to get layouts' }, { status: 500 });
	}
};

/**
 * POST /studio/api/layouts/validate
 * Validate content against a layout contract
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
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
		const { layoutName, content } = await request.json();

		if (!layoutName || !content) {
			return json({ error: 'Layout name and content required' }, { status: 400 });
		}

		const validation = validateLayoutContent(layoutName, content);
		return json(validation);
	} catch (error: any) {
		return json({ error: error.message || 'Failed to validate layout' }, { status: 500 });
	}
};
