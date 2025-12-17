import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { gitPull } from '$lib/studio/git';

export const POST: RequestHandler = async ({ cookies }) => {
	// Check authentication
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
		const result = await gitPull(process.cwd());
		return json({ success: result.success, message: result.message, output: result.output });
	} catch (error: any) {
		return json({ success: false, message: error.message || 'Pull failed' }, { status: 500 });
	}
};

