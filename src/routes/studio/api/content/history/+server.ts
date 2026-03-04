import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { listCommitsForFile, validateContentPath } from '$lib/studio/github-api';

/** GET /studio/api/content/history?path=content/foo.md – list commits for a content file (revision history) */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const pathParam = url.searchParams.get('path');
	if (!pathParam || !pathParam.trim()) {
		return json({ error: 'Query param path is required' }, { status: 400 });
	}

	const filePath = pathParam.trim();
	if (!validateContentPath(filePath, ['content'])) {
		return json({ error: 'Invalid path: only content/*.md allowed' }, { status: 400 });
	}
	if (!filePath.endsWith('.md')) {
		return json({ error: 'Only .md content files have history' }, { status: 400 });
	}

	const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('per_page') || '30', 10) || 30));
	const result = await listCommitsForFile(filePath, perPage);

	if (!result.success) {
		return json({ error: result.error || 'Failed to load history' }, { status: 500 });
	}

	return json({ commits: result.data ?? [] });
};
