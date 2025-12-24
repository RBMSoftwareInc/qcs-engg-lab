import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { createOrUpdateFile, getFileContent, validateContentPath, getSafeContentPath } from '$lib/studio/github-api';
import { tokensToCSS, validateTokens } from '$lib/studio/design-tokens';

/**
 * POST /studio/api/design-skins/create
 * Create a new design skin from tokens
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
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
		const { name, tokens } = await request.json();

		if (!name || !tokens) {
			return json({ success: false, message: 'Name and tokens required' }, { status: 400 });
		}

		// Validate tokens
		const validation = validateTokens(tokens);
		if (!validation.valid) {
			return json({ 
				success: false, 
				message: 'Invalid tokens',
				errors: validation.errors
			}, { status: 400 });
		}

		// Sanitize skin name
		const skinName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
		const jsonPath = `design/skins/${skinName}.json`;
		const cssPath = `design/skins/${skinName}.css`;

		// Validate paths
		if (!validateContentPath(jsonPath, ['design']) || !validateContentPath(cssPath, ['design'])) {
			return json({ success: false, message: 'Invalid path' }, { status: 400 });
		}

		// Check if skin already exists
		const existing = await getFileContent(jsonPath);
		let jsonSha = undefined;
		if (existing.success && existing.data) {
			jsonSha = existing.data.sha;
		}

		// Generate CSS from tokens
		const css = tokensToCSS(tokens, skinName);

		// Save JSON file
		const jsonContent = JSON.stringify(tokens, null, 2);
		const jsonResult = await createOrUpdateFile(
			jsonPath,
			jsonContent,
			`Create design skin: ${skinName}`,
			jsonSha
		);

		if (!jsonResult.success) {
			return json({ 
				success: false, 
				message: jsonResult.error || 'Failed to save skin JSON' 
			}, { status: 500 });
		}

		// Save CSS file
		const cssExisting = await getFileContent(cssPath);
		let cssSha = undefined;
		if (cssExisting.success && cssExisting.data) {
			cssSha = cssExisting.data.sha;
		}

		const cssResult = await createOrUpdateFile(
			cssPath,
			css,
			`Generate CSS for design skin: ${skinName}`,
			cssSha
		);

		if (!cssResult.success) {
			return json({ 
				success: false, 
				message: cssResult.error || 'Failed to save skin CSS' 
			}, { status: 500 });
		}

		return json({ 
			success: true, 
			message: 'Design skin created successfully',
			skin: {
				name: skinName,
				path: jsonPath
			}
		});
	} catch (error: any) {
		return json({ success: false, message: error.message || 'Server error' }, { status: 500 });
	}
};
