import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { writeAndCommit, getSafeContentPath, validateContentPath } from '$lib/studio/git';
import path from 'node:path';

export const POST: RequestHandler = async ({ request, cookies }) => {
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
		const { path: filePath, content, commitMessage } = await request.json();

		if (!filePath || !content) {
			return json({ success: false, message: 'Path and content required' }, { status: 400 });
		}

		const contentDir = path.join(process.cwd(), 'content');
		const fullPath = getSafeContentPath(filePath, contentDir);

		// Validate path is within content directory
		if (!validateContentPath(fullPath, contentDir)) {
			return json({ success: false, message: 'Invalid file path' }, { status: 400 });
		}

		// Ensure .md extension
		const finalPath = fullPath.endsWith('.md') ? fullPath : `${fullPath}.md`;

		// Write and commit
		const result = await writeAndCommit(
			finalPath,
			content,
			commitMessage || `Update ${filePath}`,
			process.cwd()
		);

		if (result.success) {
			return json({ success: true, message: 'Content saved and committed' });
		} else {
			return json({ success: false, message: result.message || 'Failed to save' }, { status: 500 });
		}
	} catch (error: any) {
		return json({ success: false, message: error.message || 'Server error' }, { status: 500 });
	}
};

