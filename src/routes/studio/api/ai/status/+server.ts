import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { isAIAvailable, getConfiguredProvider } from '$lib/studio/ai-provider';

/** GET: whether AI is configured (provider + key). Used by editor to show/hide AI actions. */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const available = isAIAvailable();
	const provider = getConfiguredProvider();
	return json({ available: !!available, provider: provider ?? null });
};