import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, requireEditor } from '$lib/studio/auth';
import {
	getFileContentAtRef,
	createOrUpdateFile,
	validateContentPath
} from '$lib/studio/github-api';

/** POST /studio/api/content/restore – restore content from a previous commit (body: { path, sha }) */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireEditor(session)) {
		return json({ success: false, message: 'Editor or Admin role required to restore' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { path: filePath, sha: commitSha } = body as { path?: string; sha?: string };

		if (!filePath || !commitSha || typeof filePath !== 'string' || typeof commitSha !== 'string') {
			return json({ success: false, message: 'Body must include path and sha' }, { status: 400 });
		}

		const trimmedPath = filePath.trim();
		if (!validateContentPath(trimmedPath, ['content'])) {
			return json({ success: false, message: 'Invalid path: only content/*.md allowed' }, { status: 400 });
		}
		if (!trimmedPath.endsWith('.md')) {
			return json({ success: false, message: 'Only .md content files can be restored' }, { status: 400 });
		}

		const contentResult = await getFileContentAtRef(trimmedPath, commitSha);
		if (!contentResult.success || !contentResult.data) {
			return json({
				success: false,
				message: contentResult.error || 'Failed to get file content at that commit'
			}, { status: 400 });
		}

		const result = await createOrUpdateFile(
			trimmedPath,
			contentResult.data.content,
			`Restore from history (${commitSha.slice(0, 7)})`
		);

		if (result.success) {
			return json({
				success: true,
				message: 'Content restored',
				commit: result.data
			});
		}

		return json({
			success: false,
			message: result.error || 'Failed to save restored content'
		}, { status: 500 });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
