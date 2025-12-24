import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';

/**
 * Debug endpoint to check environment variables
 * Only accessible when authenticated
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

	// Check environment variables (without exposing sensitive values)
	const envCheck = {
		github: {
			token: !!(process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN),
			owner: !!(process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER),
			repo: !!(process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO),
			branch: !!(process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH),
			// Show partial values for debugging (first 10 chars)
			tokenPrefix: process.env.GITHUB_TOKEN?.substring(0, 10) || process.env.VITE_GITHUB_TOKEN?.substring(0, 10) || 'not found',
			ownerValue: process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER || 'not found',
			repoValue: process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO || 'not found',
			branchValue: process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH || 'main (default)'
		},
		figma: {
			token: !!(process.env.FIGMA_TOKEN || process.env.VITE_FIGMA_TOKEN)
		},
		studio: {
			email: !!(process.env.VITE_STUDIO_EMAIL),
			password: !!(process.env.VITE_STUDIO_PASSWORD)
		},
		allGitHubKeys: typeof process !== 'undefined' && process.env
			? Object.keys(process.env).filter(k => k.toUpperCase().includes('GITHUB'))
			: []
	};

	return json(envCheck);
};
