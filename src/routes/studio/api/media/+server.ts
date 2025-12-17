import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

export const GET: RequestHandler = async ({ cookies }) => {
	// Check authentication
	const sessionCookie = cookies.get('studio_session');
	if (!sessionCookie) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const session = JSON.parse(sessionCookie);
		if (!validateSession(session)) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	} catch (e) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const mediaDir = path.join(process.cwd(), 'static', 'assets', 'images');
		const files = await readdir(mediaDir);
		const imageFiles = files.filter(f => 
			/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
		);
		return json({ files: imageFiles });
	} catch (error: any) {
		// Directory might not exist
		return json({ files: [] });
	}
};

