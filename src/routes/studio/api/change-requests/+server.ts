import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireEditor } from '$lib/studio/auth';
import {
	listChangeRequests,
	createChangeRequest,
	type ChangeRequestFile
} from '$lib/studio/change-requests';
import { validateFilePath } from '$lib/studio/validators';
import { getSafeContentPath, validateContentPath } from '$lib/studio/github-api';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) return json({ error: 'Unauthorized' }, { status: 401 });

	const status = url.searchParams.get('status') as 'open' | 'merged' | 'rejected' | null;
	const list = listChangeRequests(status ?? undefined);
	return json({ changeRequests: list });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireEditor(session)) return json({ error: 'Editor or Admin role required' }, { status: 403 });

	try {
		const body = await request.json();
		const { title, description, files } = body as {
			title?: string;
			description?: string;
			files?: { path: string; content: string }[];
		};

		if (!title || typeof title !== 'string' || !title.trim()) {
			return json({ success: false, message: 'Title is required' }, { status: 400 });
		}
		if (!Array.isArray(files) || files.length === 0) {
			return json({ success: false, message: 'At least one file is required' }, { status: 400 });
		}

		const safeFiles: ChangeRequestFile[] = [];
		for (const f of files) {
			if (!f.path || typeof f.content !== 'string') continue;
			const pathValidation = validateFilePath(f.path, ['.md']);
			if (!pathValidation.valid) continue;
			const safePath = getSafeContentPath(f.path, 'content');
			const finalPath = safePath.endsWith('.md') ? safePath : `${safePath}.md`;
			if (!validateContentPath(finalPath, ['content'])) continue;
			safeFiles.push({ path: finalPath, content: f.content });
		}
		if (safeFiles.length === 0) {
			return json({ success: false, message: 'No valid content files' }, { status: 400 });
		}

		const cr = createChangeRequest({
			authorEmail: session.email,
			title: title.trim(),
			description: typeof description === 'string' ? description.trim() : undefined,
			files: safeFiles
		});
		return json({ success: true, changeRequest: cr });
	} catch (e: any) {
		return json({ success: false, message: e.message || 'Failed to create change request' }, { status: 500 });
	}
};
