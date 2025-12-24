import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { listFiles, getFileContent } from '$lib/studio/github-api';
import fm from 'front-matter';

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

	// List content files from GitHub
	try {
		const result = await listFiles('content');
		
		if (!result.success) {
			return json({ error: result.error || 'Failed to list content' }, { status: 500 });
		}

		// Recursively get all .md files
		const mdFiles: any[] = [];
		
		async function processFiles(files: any[], basePath: string = 'content') {
			for (const file of files) {
				if (file.type === 'file' && file.path.endsWith('.md')) {
					// Get file content
					const contentResult = await getFileContent(file.path);
					if (contentResult.success && contentResult.data) {
						const parsed = fm<any>(contentResult.data.content);
						const relativePath = file.path.replace(/^content\//, '');
						const slug = relativePath.replace(/\.md$/, '').replace(/\//g, '-');
						
						mdFiles.push({
							path: file.path,
							relativePath,
							slug,
							title: parsed.attributes.title || file.name.replace(/\.md$/, ''),
							status: parsed.attributes.status || 'draft',
							content: parsed.body,
							metadata: parsed.attributes,
							sha: contentResult.data.sha
						});
					}
				} else if (file.type === 'dir') {
					// Recursively process directory
					const dirResult = await listFiles(file.path);
					if (dirResult.success && dirResult.data) {
						await processFiles(dirResult.data, file.path);
					}
				}
			}
		}

		if (result.data) {
			await processFiles(result.data);
		}

		// Sort files
		mdFiles.sort((a, b) => {
			const aDir = a.relativePath.split('/')[0];
			const bDir = b.relativePath.split('/')[0];
			if (aDir !== bDir) return aDir.localeCompare(bDir);
			return a.title.localeCompare(b.title);
		});

		return json({ files: mdFiles });
	} catch (error: any) {
		return json({ error: error.message || 'Failed to index content' }, { status: 500 });
	}
};

