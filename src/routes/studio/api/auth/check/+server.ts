import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionCookie = cookies.get('studio_session');
	
	if (sessionCookie) {
		try {
			const session = JSON.parse(sessionCookie);
			if (validateSession(session)) {
				return json({ authenticated: true, email: session.email });
			}
		} catch (e) {
			// Invalid session
		}
	}

	return json({ authenticated: false, email: null });
};

