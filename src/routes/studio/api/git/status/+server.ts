import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { gitStatus } from '$lib/studio/git';

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

	try {
		const result = await gitStatus(process.cwd());
		return json({ status: result.output || result.message });
	} catch (error: any) {
		return json({ status: 'Error: ' + error.message }, { status: 500 });
	}
};

