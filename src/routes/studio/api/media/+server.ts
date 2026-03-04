import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, requireEditor } from '$lib/studio/auth';
import { readdir, unlink, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

const MEDIA_DIR = path.join(process.cwd(), 'static', 'assets', 'images');

const MEDIA_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|ogv|pdf|doc|docx)$/i;

type MediaNode =
	| { type: 'folder'; name: string; path: string; children: MediaNode[] }
	| { type: 'file'; name: string; path: string; size?: number };

async function buildTree(dir: string, base = ''): Promise<MediaNode[]> {
	const nodes: MediaNode[] = [];
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		// Folders first, then files, both sorted by name
		const sorted = entries.sort((a, b) => {
			if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
			return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
		});
		for (const e of sorted) {
			const rel = base ? `${base}/${e.name}` : e.name;
			if (e.isDirectory()) {
				const children = await buildTree(path.join(dir, e.name), rel);
				nodes.push({ type: 'folder', name: e.name, path: rel, children });
			} else if (MEDIA_EXTS.test(e.name)) {
				let size: number | undefined;
				try {
					const st = await stat(path.join(dir, e.name));
					size = st.size;
				} catch {
					// ignore
				}
				nodes.push({ type: 'file', name: e.name, path: rel, size });
			}
		}
	} catch {
		// dir missing or not readable
	}
	return nodes;
}

async function listAllFilesRecursive(dir: string, base = ''): Promise<string[]> {
	const out: string[] = [];
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const e of entries) {
			const rel = base ? `${base}/${e.name}` : e.name;
			if (e.isDirectory()) {
				out.push(...(await listAllFilesRecursive(path.join(dir, e.name), rel)));
			} else if (MEDIA_EXTS.test(e.name)) {
				out.push(rel);
			}
		}
	} catch {
		// ignore
	}
	return out;
}

function safeRelativePath(input: string): string {
	const normalized = path.normalize(input).replace(/^(\.\.(\/|\\))+/, '').replace(/^\/+/, '');
	return normalized.split(path.sep).join('/');
}

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		if (!existsSync(MEDIA_DIR)) {
			return json({ tree: [], files: [] });
		}
		const tree = await buildTree(MEDIA_DIR);
		const files = await listAllFilesRecursive(MEDIA_DIR);
		return json({ tree, files });
	} catch {
		return json({ tree: [], files: [] });
	}
};

/** POST: create a folder (Editor or Admin) */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireEditor(session)) {
		return json({ error: 'Editor or Admin role required' }, { status: 403 });
	}
	try {
		const body = await request.json().catch(() => ({}));
		const raw = (body && typeof body === 'object' && body.path) ? String(body.path).trim() : '';
		if (!raw) {
			return json({ error: 'Path required' }, { status: 400 });
		}
		const relativePath = safeRelativePath(raw);
		if (!relativePath || relativePath.includes('..')) {
			return json({ error: 'Invalid path' }, { status: 400 });
		}
		const fullPath = path.join(MEDIA_DIR, relativePath);
		if (!fullPath.startsWith(MEDIA_DIR) || fullPath === MEDIA_DIR) {
			return json({ error: 'Invalid path' }, { status: 400 });
		}
		const { mkdir } = await import('node:fs/promises');
		await mkdir(fullPath, { recursive: true });
		return json({ success: true, path: relativePath });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};

/** DELETE: remove a file or folder (Editor or Admin) */
export const DELETE: RequestHandler = async ({ cookies, url }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireEditor(session)) {
		return json({ error: 'Editor or Admin role required' }, { status: 403 });
	}
	const relativePath = url.searchParams.get('path');
	if (!relativePath || relativePath.includes('..') || path.isAbsolute(relativePath)) {
		return json({ error: 'Invalid path' }, { status: 400 });
	}
	const fullPath = path.join(MEDIA_DIR, relativePath);
	if (!fullPath.startsWith(MEDIA_DIR) || fullPath === MEDIA_DIR) {
		return json({ error: 'Invalid path' }, { status: 400 });
	}
	try {
		if (!existsSync(fullPath)) {
			return json({ error: 'Not found' }, { status: 404 });
		}
		const st = await stat(fullPath);
		if (st.isDirectory()) {
			await rm(fullPath, { recursive: true });
		} else {
			await unlink(fullPath);
		}
		return json({ success: true });
	} catch (err: unknown) {
		return json({ success: false, message: String(err) }, { status: 500 });
	}
};
