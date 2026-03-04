import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { getFileContent, createOrUpdateFile } from '$lib/studio/github-api';
import { validateContentPath } from '$lib/studio/github-api';
import { getPageBySlug, savePageToLocal } from '$lib/content/pages';
import type { PageModel } from '$lib/blocks/types';

const PAGES_PREFIX = 'content/pages';

function safeSlug(slug: string): string {
	return slug.replace(/[^a-z0-9-_]/gi, '') || 'page';
}

/** GET: return page JSON for slug */
export const GET: RequestHandler = async ({ cookies, params }) => {
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

	const slug = safeSlug(params.slug ?? '');
	const filePath = `${PAGES_PREFIX}/${slug}.json`;
	if (!validateContentPath(filePath, ['content'])) {
		return json({ error: 'Invalid slug' }, { status: 400 });
	}

	try {
		const result = await getFileContent(filePath);
		if (result.success && result.data?.content) {
			const page = JSON.parse(result.data.content) as PageModel;
			return json({ page });
		}
		// Fallback: read from local content/pages/ (dev or when not yet in GitHub)
		const localPage = getPageBySlug(slug);
		if (localPage) {
			return json({ page: localPage });
		}
		// Empty page so builder can create
		return json({
			page: {
				title: slug.charAt(0).toUpperCase() + slug.slice(1),
				slug,
				blocks: []
			}
		});
	} catch {
		const localPage = getPageBySlug(slug);
		if (localPage) return json({ page: localPage });
		return json({
			page: {
				title: slug.charAt(0).toUpperCase() + slug.slice(1),
				slug,
				blocks: []
			}
		});
	}
};

/** POST: save page JSON */
export const POST: RequestHandler = async ({ cookies, params, request }) => {
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

	const slug = safeSlug(params.slug ?? '');
	const filePath = `${PAGES_PREFIX}/${slug}.json`;
	if (!validateContentPath(filePath, ['content'])) {
		return json({ error: 'Invalid slug' }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const page = body as PageModel;
	if (!page || typeof page.title !== 'string' || !Array.isArray(page.blocks)) {
		return json({ error: 'Invalid page: need title and blocks array' }, { status: 400 });
	}

	const content = JSON.stringify(
		{
			title: page.title,
			slug: page.slug ?? slug,
			description: page.description,
			blocks: page.blocks
		},
		null,
		2
	);

	try {
		const result = await createOrUpdateFile(
			filePath,
			content,
			`Block builder: update ${slug}`
		);
		if (result.success) {
			return json({ success: true, page: { ...page, slug: page.slug ?? slug } });
		}
		// GitHub failed (e.g. not configured, network, or repo error): save locally so builder still works
		savePageToLocal(slug, { ...page, slug: page.slug ?? slug });
		return json({ success: true, page: { ...page, slug: page.slug ?? slug } });
	} catch (_err) {
		// createOrUpdateFile threw (e.g. missing GITHUB_TOKEN): save locally
		try {
			savePageToLocal(slug, { ...page, slug: page.slug ?? slug });
			return json({ success: true, page: { ...page, slug: page.slug ?? slug } });
		} catch (e) {
			return json({ error: String(e) }, { status: 500 });
		}
	}
};
