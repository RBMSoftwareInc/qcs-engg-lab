import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { indexContent } from '$lib/studio/content-indexer';
import { validateSession } from '$lib/studio/auth';
import path from 'path';

export const GET: RequestHandler = async ({ cookies }) => {
	// Check authentication
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

	// Index content
	try {
		const contentDir = path.join(process.cwd(), 'content');
		const files = await indexContent(contentDir);
		return json({ files });
	} catch (error: any) {
		return json({ error: error.message || 'Failed to index content' }, { status: 500 });
	}
};

