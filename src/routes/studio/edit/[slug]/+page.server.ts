import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { indexContent } from '$lib/studio/content-indexer';
import { validateSession } from '$lib/studio/auth';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const load: PageServerLoad = async ({ params, cookies }) => {
	// Check authentication
	const sessionCookie = cookies.get('studio_session');
	if (!sessionCookie) {
		throw error(401, 'Unauthorized');
	}

	try {
		const session = JSON.parse(sessionCookie);
		if (!validateSession(session)) {
			throw error(401, 'Unauthorized');
		}
	} catch (e) {
		throw error(401, 'Unauthorized');
	}

	// Load content file
	try {
		const contentDir = path.join(process.cwd(), 'content');
		const files = await indexContent(contentDir);
		const file = files.find(f => f.slug === params.slug || f.relativePath === params.slug);

		if (!file) {
			throw error(404, 'Content not found');
		}

		// Read full file content
		const fullContent = await readFile(file.path, 'utf-8');

		return {
			file: {
				...file,
				fullContent
			}
		};
	} catch (e: any) {
		if (e.status) throw e;
		throw error(500, 'Failed to load content');
	}
};

