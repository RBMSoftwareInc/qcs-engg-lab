import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { gitStatus, parseStatusPorcelain } from '$lib/studio/git';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionCookie = cookies.get('studio_session');
	if (!sessionCookie) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const session = JSON.parse(sessionCookie);
		if (!validateSession(session)) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	} catch {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await gitStatus(process.cwd());
		const raw = result.output ?? result.message ?? '';
		const files = result.success && raw ? parseStatusPorcelain(raw) : [];
		const byLabel = files.reduce((acc, e) => {
			acc[e.label] = (acc[e.label] ?? 0) + 1;
			return acc;
		}, {} as Record<string, number>);
		const summaryParts = Object.entries(byLabel).map(([label, n]) => `${n} ${label.toLowerCase()}`);
		const summary = !result.success
			? (result.message || result.error || 'Unavailable').split('\n')[0]
			: summaryParts.length
				? summaryParts.join(', ')
				: 'Up to date';
		return json({
			success: result.success,
			status: raw,
			message: result.message,
			error: result.error,
			summary,
			files
		});
	} catch (err: unknown) {
		return json({
			success: false,
			status: '',
			message: err instanceof Error ? err.message : String(err),
			error: String(err),
			summary: 'Error',
			files: []
		}, { status: 500 });
	}
};

