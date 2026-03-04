import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';

/** GET: return repo clone URL and owner/repo for display (no secrets). */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) return json({ error: 'Unauthorized' }, { status: 401 });
	const owner = process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER || '';
	const repo = process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO || '';
	const branch = process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH || 'main';
	const cloneUrl = owner && repo ? `https://github.com/${owner}/${repo}.git` : '';
	return json({ owner, repo, branch, cloneUrl });
};
