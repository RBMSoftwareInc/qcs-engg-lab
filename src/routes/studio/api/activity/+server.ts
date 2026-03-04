import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { gitLog } from '$lib/studio/git';

const DEFAULT_LIMIT = 20;

/** GET: recent activity (commit log) for dashboard */
export const GET: RequestHandler = async ({ cookies, url }) => {
	if (!cookies.get('studio_session')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const session = JSON.parse(cookies.get('studio_session')!);
		if (!validateSession(session)) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	} catch {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || DEFAULT_LIMIT));
	const entries = await gitLog(process.cwd(), limit);
	return json({ entries });
};
