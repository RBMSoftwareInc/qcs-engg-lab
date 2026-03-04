import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { join } from 'path';
import { existsSync } from 'fs';
import { parseSession, validateSession } from '$lib/studio/auth';
import { indexContent } from '$lib/studio/content-indexer';
import { listFiles, getFileContent } from '$lib/studio/github-api';
import fm from 'front-matter';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const contentDir = join(process.cwd(), 'content');

	// Prefer local filesystem when content directory exists (dev / VPS with cloned repo)
	if (existsSync(contentDir)) {
		try {
			const files = await indexContent(contentDir);
			const mdFiles = files.map((f) => ({
				path: `content/${f.relativePath}`,
				relativePath: f.relativePath,
				slug: f.slug,
				title: f.title,
				status: f.status ?? 'draft',
				content: f.content,
				metadata: f.metadata ?? {},
				sha: '' // Save API will fetch SHA from GitHub when updating
			}));
			return json({ files: mdFiles });
		} catch (err: unknown) {
			// Fall through to GitHub API
			console.warn('Local content index failed, trying GitHub API:', err);
		}
	}

	// Fallback: list content from GitHub API
	try {
		const result = await listFiles('content');

		if (!result.success) {
			return json({ error: result.error || 'Failed to list content' }, { status: 500 });
		}

		const mdFiles: any[] = [];

		async function processFiles(files: any[], basePath: string = 'content') {
			for (const file of files) {
				if (file.type === 'file' && file.path.endsWith('.md')) {
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

