import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { 
	createOrUpdateFile, 
	getFileContent,
	getSafeContentPath, 
	validateContentPath 
} from '$lib/studio/github-api';
import { validateMarkdown, validateFilePath, validateCommitMessage } from '$lib/studio/validators';

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
		const { path: filePath, content, commitMessage, sha } = await request.json();

		if (!filePath || !content) {
			return json({ success: false, message: 'Path and content required' }, { status: 400 });
		}

		// Validate commit message
		const commitValidation = validateCommitMessage(commitMessage || `Update ${filePath}`);
		if (!commitValidation.valid) {
			return json({ 
				success: false, 
				message: 'Invalid commit message',
				errors: commitValidation.errors
			}, { status: 400 });
		}

		// Validate file path
		const pathValidation = validateFilePath(filePath, ['.md']);
		if (!pathValidation.valid) {
			return json({ 
				success: false, 
				message: 'Invalid file path',
				errors: pathValidation.errors
			}, { status: 400 });
		}

		// Validate markdown content
		const contentValidation = validateMarkdown(content);
		if (!contentValidation.valid) {
			return json({ 
				success: false, 
				message: 'Invalid markdown content',
				errors: contentValidation.errors
			}, { status: 400 });
		}

		// Validate and get safe path
		const safePath = getSafeContentPath(filePath, 'content');

		// Validate path is within allowed directories
		if (!validateContentPath(safePath, ['content'])) {
			return json({ success: false, message: 'Invalid file path' }, { status: 400 });
		}

		// Ensure .md extension
		const finalPath = safePath.endsWith('.md') ? safePath : `${safePath}.md`;

		// If SHA not provided, try to get it (for updates)
		let fileSha = sha;
		if (!fileSha) {
			const existingFile = await getFileContent(finalPath);
			if (existingFile.success && existingFile.data) {
				fileSha = existingFile.data.sha;
			}
		}

		// Create or update file via GitHub API
		const result = await createOrUpdateFile(
			finalPath,
			content,
			commitMessage || `Update ${filePath}`,
			fileSha
		);

		if (result.success) {
			return json({ 
				success: true, 
				message: 'Content saved and committed to GitHub',
				commit: result.data
			});
		} else {
			return json({ 
				success: false, 
				message: result.error || 'Failed to save' 
			}, { status: 500 });
		}
	} catch (error: any) {
		return json({ success: false, message: error.message || 'Server error' }, { status: 500 });
	}
};

