import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, requireAdmin } from '$lib/studio/auth';
import { gitPull } from '$lib/studio/git';

export const POST: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireAdmin(session)) {
		return json({ success: false, message: 'Admin only' }, { status: 403 });
	}

	try {
		const result = await gitPull(process.cwd());
		return json({
			success: result.success,
			message: result.message,
			output: result.output,
			error: result.error
		});
	} catch (error: any) {
		return json({
			success: false,
			message: error.message || 'Pull failed',
			error: String(error)
		}, { status: 500 });
	}
};

