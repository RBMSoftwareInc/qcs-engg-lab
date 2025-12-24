import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { listFiles, getFileContent, createOrUpdateFile } from '$lib/studio/github-api';

/**
 * GET /studio/api/design-skins
 * List all available design skins
 */
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
	} catch (e) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// List files in design/skins directory
		const result = await listFiles('design/skins');

		if (!result.success) {
			// Directory might not exist yet
			return json({ skins: [] });
		}

		const skins: any[] = [];

		if (result.data) {
			for (const file of result.data) {
				if (file.type === 'file' && file.path.endsWith('.json')) {
					const skinName = file.name.replace('.json', '');
					
					// Get file content
					const contentResult = await getFileContent(file.path);
					if (contentResult.success && contentResult.data) {
						try {
							const tokens = JSON.parse(contentResult.data.content);
							skins.push({
								name: skinName,
								path: file.path,
								tokens,
								sha: contentResult.data.sha
							});
						} catch (e) {
							console.warn(`Failed to parse skin ${skinName}:`, e);
						}
					}
				}
			}
		}

		// Get active skin
		const activeSkinResult = await getFileContent('design/active-skin.json');
		let activeSkin = null;
		if (activeSkinResult.success && activeSkinResult.data) {
			try {
				const active = JSON.parse(activeSkinResult.data.content);
				activeSkin = active.skin;
			} catch (e) {
				// Ignore parse errors
			}
		}

		return json({ skins, activeSkin });
	} catch (error: any) {
		return json({ error: error.message || 'Failed to list skins' }, { status: 500 });
	}
};
