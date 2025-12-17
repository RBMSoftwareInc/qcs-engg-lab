import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/studio/auth';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { writeAndCommit } from '$lib/studio/git';

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
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		if (files.length === 0) {
			return json({ success: false, message: 'No files provided' }, { status: 400 });
		}

		const mediaDir = path.join(process.cwd(), 'static', 'assets', 'images');
		
		// Ensure directory exists
		if (!existsSync(mediaDir)) {
			await mkdir(mediaDir, { recursive: true });
		}

		const uploaded: string[] = [];
		const errors: string[] = [];

		for (const file of files) {
			try {
				// Validate file type
				if (!file.type.startsWith('image/')) {
					errors.push(`${file.name}: Not an image file`);
					continue;
				}

				// Generate safe filename
				const timestamp = Date.now();
				const safeName = file.name
					.toLowerCase()
					.replace(/[^a-z0-9.-]/g, '-')
					.replace(/-+/g, '-');
				const fileName = `${timestamp}-${safeName}`;
				const filePath = path.join(mediaDir, fileName);

				// Convert File to Buffer
				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				// Write file
				await writeFile(filePath, buffer);

				// Stage and commit to Git
				const { gitAdd, gitCommit, gitPush } = await import('$lib/studio/git');
				const addResult = await gitAdd(filePath, process.cwd());
				
				if (addResult.success) {
					const commitResult = await gitCommit(`Add media: ${fileName}`, process.cwd());
					if (commitResult.success) {
						await gitPush(process.cwd());
						uploaded.push(fileName);
					} else {
						errors.push(`${file.name}: Commit failed`);
					}
				} else {
					errors.push(`${file.name}: Git add failed`);
				}
			} catch (error: any) {
				errors.push(`${file.name}: ${error.message}`);
			}
		}

		if (uploaded.length > 0) {
			return json({
				success: true,
				uploaded,
				errors: errors.length > 0 ? errors : undefined
			});
		} else {
			return json({
				success: false,
				message: 'Failed to upload files',
				errors
			}, { status: 500 });
		}
	} catch (error: any) {
		return json({ success: false, message: error.message || 'Upload failed' }, { status: 500 });
	}
};

