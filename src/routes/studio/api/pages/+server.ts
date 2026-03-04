import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { listFiles } from '$lib/studio/github-api';
import { getPageSlugs } from '$lib/content/pages';

/** GET: list block-built pages (content/pages/*.json) - from GitHub or local fallback */
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

	let pages: Array<{ slug: string }> = [];

	try {
		const result = await listFiles('content/pages');
		if (result.success && result.data && Array.isArray(result.data)) {
			const fromGitHub = (result.data as Array<{ path?: string; name?: string }>)
				.filter((f) => (f.path ?? f.name ?? '').endsWith('.json'))
				.map((f) => ({ slug: (f.path ?? f.name ?? '').replace(/^content\/pages\//, '').replace(/\.json$/, '') }));
			if (fromGitHub.length > 0) pages = fromGitHub;
		}
	} catch {
		// GitHub failed, use local fallback
	}

	// Fallback: read from local content/pages/ (dev or when repo not synced)
	if (pages.length === 0) {
		const slugs = getPageSlugs();
		pages = slugs.map((slug) => ({ slug }));
	}

	return json({ pages });
};
