import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, requireEditor } from '$lib/studio/auth';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const MEDIA_DIR = path.join(process.cwd(), 'static', 'assets', 'images');

// Allowed extensions and max size in bytes
const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const VIDEO_EXTS = /\.(mp4|webm|mov|ogv)$/i;
const PDF_EXT = /\.pdf$/i;
const DOC_EXTS = /\.(doc|docx)$/i;

const MAX_IMAGE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO = 50 * 1024 * 1024; // 50MB
const MAX_PDF = 10 * 1024 * 1024;   // 10MB
const MAX_DOC = 10 * 1024 * 1024;   // 10MB

function getMaxSize(filename: string): number {
	const lower = filename.toLowerCase();
	if (IMAGE_EXTS.test(lower)) return MAX_IMAGE;
	if (VIDEO_EXTS.test(lower)) return MAX_VIDEO;
	if (PDF_EXT.test(lower)) return MAX_PDF;
	if (DOC_EXTS.test(lower)) return MAX_DOC;
	return 0;
}

function isAllowedType(filename: string): boolean {
	return IMAGE_EXTS.test(filename) || VIDEO_EXTS.test(filename) || PDF_EXT.test(filename) || DOC_EXTS.test(filename);
}

function safeRelativePath(input: string): string {
	const normalized = path.normalize(input).replace(/^(\.\.(\/|\\))+/, '').replace(/^\/+/, '');
	return normalized.split(path.sep).join('/');
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireEditor(session)) {
		return json({ success: false, message: 'Editor or Admin role required to upload media' }, { status: 403 });
	}

	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];
		const folderRaw = (formData.get('folder') as string) || '';
		const folder = safeRelativePath(folderRaw);

		if (files.length === 0) {
			return json({ success: false, message: 'No files provided' }, { status: 400 });
		}

		const targetDir = folder ? path.join(MEDIA_DIR, folder) : MEDIA_DIR;
		if (!targetDir.startsWith(MEDIA_DIR)) {
			return json({ success: false, message: 'Invalid folder path' }, { status: 400 });
		}

		if (!existsSync(MEDIA_DIR)) {
			await mkdir(MEDIA_DIR, { recursive: true });
		}
		if (!existsSync(targetDir)) {
			await mkdir(targetDir, { recursive: true });
		}

		const uploaded: string[] = [];
		const errors: string[] = [];

		for (const file of files) {
			try {
				if (!file.name || typeof file.name !== 'string') continue;
				if (!isAllowedType(file.name)) {
					errors.push(`${file.name}: Type not allowed. Use images, video (mp4/webm/mov/ogv), GIF, PDF, or DOC/DOCX.`);
					continue;
				}
				const maxSize = getMaxSize(file.name);
				if (file.size > maxSize) {
					const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
					errors.push(`${file.name}: Max size ${maxMB}MB`);
					continue;
				}

				const safeName = file.name
					.toLowerCase()
					.replace(/[^a-z0-9._-]/g, '-')
					.replace(/-+/g, '-');
				const relativePath = folder ? `${folder}/${safeName}` : safeName;
				const filePath = path.join(MEDIA_DIR, relativePath);

				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				await writeFile(filePath, buffer);
				uploaded.push(relativePath);

				try {
					const { gitAdd, gitCommit, gitPush } = await import('$lib/studio/git');
					const addResult = await gitAdd(filePath, process.cwd());
					if (addResult.success) {
						const commitResult = await gitCommit(`Add media: ${relativePath}`, process.cwd());
						if (commitResult.success) await gitPush(process.cwd());
					}
				} catch {
					// Git optional
				}
			} catch (err: any) {
				errors.push(`${file.name}: ${err.message}`);
			}
		}

		if (uploaded.length > 0) {
			return json({
				success: true,
				uploaded,
				errors: errors.length > 0 ? errors : undefined
			});
		}
		return json({
			success: false,
			message: errors[0] || 'Upload failed',
			errors
		}, { status: 400 });
	} catch (err: any) {
		return json({ success: false, message: err.message || 'Upload failed' }, { status: 500 });
	}
};
