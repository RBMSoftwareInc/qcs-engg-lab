import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, requireAdmin } from '$lib/studio/auth';
import { getChangeRequest, setChangeRequestStatus } from '$lib/studio/change-requests';

export const POST: RequestHandler = async ({ params, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
	if (!requireAdmin(session)) return json({ error: 'Admin only' }, { status: 403 });

	const id = params.id;
	const cr = getChangeRequest(id);
	if (!cr) return json({ success: false, message: 'Change request not found' }, { status: 404 });
	if (cr.status !== 'open') {
		return json({ success: false, message: 'Change request is no longer open' }, { status: 400 });
	}

	const updated = setChangeRequestStatus(id, 'rejected', session.email);
	return json({ success: true, changeRequest: updated });
};
