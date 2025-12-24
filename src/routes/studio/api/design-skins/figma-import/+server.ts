import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { importFigmaTokens } from '$lib/studio/figma-api';
import { validateTokens } from '$lib/studio/design-tokens';
import { createOrUpdateFile, getFileContent } from '$lib/studio/github-api';
import { tokensToCSS } from '$lib/studio/design-tokens';

/**
 * POST /studio/api/design-skins/figma-import
 * Import design tokens from Figma and create a skin
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
		const { fileId, name } = await request.json();

		if (!fileId) {
			return json({ success: false, message: 'Figma file ID required' }, { status: 400 });
		}

		// Import tokens from Figma
		const importResult = await importFigmaTokens(fileId);

		if (!importResult.success || !importResult.tokens) {
			return json({ 
				success: false, 
				message: importResult.error || 'Failed to import tokens from Figma' 
			}, { status: 500 });
		}

		// Validate imported tokens
		const validation = validateTokens(importResult.tokens);
		if (!validation.valid) {
			return json({ 
				success: false, 
				message: 'Imported tokens are invalid',
				errors: validation.errors
			}, { status: 400 });
		}

		// Generate skin name
		const skinName = name 
			? name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
			: `figma-${fileId.substring(0, 8)}`;

		const jsonPath = `design/skins/${skinName}.json`;
		const cssPath = `design/skins/${skinName}.css`;

		// Check if skin already exists
		const existing = await getFileContent(jsonPath);
		let jsonSha = undefined;
		if (existing.success && existing.data) {
			jsonSha = existing.data.sha;
		}

		// Save JSON file
		const jsonContent = JSON.stringify(importResult.tokens, null, 2);
		const jsonResult = await createOrUpdateFile(
			jsonPath,
			jsonContent,
			`Import design skin from Figma: ${skinName}`,
			jsonSha
		);

		if (!jsonResult.success) {
			return json({ 
				success: false, 
				message: jsonResult.error || 'Failed to save skin JSON' 
			}, { status: 500 });
		}

		// Generate and save CSS
		const css = tokensToCSS(importResult.tokens, skinName);
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
			message: 'Design skin imported from Figma successfully',
			skin: {
				name: skinName,
				path: jsonPath,
				tokens: importResult.tokens
			}
		});
	} catch (error: any) {
		return json({ success: false, message: error.message || 'Server error' }, { status: 500 });
	}
};
