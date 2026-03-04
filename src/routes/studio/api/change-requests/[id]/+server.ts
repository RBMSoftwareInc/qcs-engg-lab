import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { getChangeRequest } from '$lib/studio/change-requests';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) return json({ error: 'Unauthorized' }, { status: 401 });

	const id = params.id;
	const cr = getChangeRequest(id);
	if (!cr) return json({ error: 'Change request not found' }, { status: 404 });
	return json({ changeRequest: cr });
};
