import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { getFileContent } from '$lib/studio/github-api';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const TEMPLATES_CONFIG_PATH = 'config/templates.json';

export interface TemplateEntry {
	id: string;
	name: string;
	description: string;
	previewPath: string | null;
	isCurrent: boolean;
}

const DEFAULT_TEMPLATES: { currentTemplateId: string; templates: TemplateEntry[] } = {
	currentTemplateId: 'qcs',
	templates: [
		{ id: 'qcs', name: 'QCS (Current)', description: 'Engineering lab / consulting: hero, domains, services, insights, signals, research, philosophy, practice. Design skins, block builder.', previewPath: '/', isCurrent: true },
		{ id: 'minimal', name: 'Minimal', description: 'Single-page or few pages: hero, about, contact. Light content structure.', previewPath: null, isCurrent: false },
		{ id: 'blog', name: 'Blog', description: 'Posts, categories, authors, featured images. Timeline and article layouts.', previewPath: null, isCurrent: false },
		{ id: 'marketing', name: 'Marketing', description: 'Landing pages, features, pricing, testimonials, CTAs. High-conversion sections.', previewPath: null, isCurrent: false },
		{ id: 'docs', name: 'Docs', description: 'Documentation: sidebar nav, sections, code blocks. Versioned docs.', previewPath: null, isCurrent: false }
	]
};

/** GET /studio/api/templates – list site templates (current + possible). */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const localPath = join(process.cwd(), TEMPLATES_CONFIG_PATH);
		if (existsSync(localPath)) {
			const raw = readFileSync(localPath, 'utf-8');
			const data = JSON.parse(raw) as { currentTemplateId?: string; templates?: TemplateEntry[] };
			if (Array.isArray(data.templates) && data.templates.length > 0) {
				const currentId = data.currentTemplateId ?? data.templates[0]?.id;
				const templates = data.templates.map((t) => ({ ...t, isCurrent: t.id === currentId }));
				return json({ currentTemplateId: currentId, templates });
			}
		}
		const result = await getFileContent(TEMPLATES_CONFIG_PATH);
		if (result.success && result.data?.content) {
			const data = JSON.parse(result.data.content) as { currentTemplateId?: string; templates?: TemplateEntry[] };
			if (Array.isArray(data.templates) && data.templates.length > 0) {
				const currentId = data.currentTemplateId ?? data.templates[0]?.id;
				const templates = data.templates.map((t) => ({ ...t, isCurrent: t.id === currentId }));
				return json({ currentTemplateId: currentId, templates });
			}
		}
	} catch {
		// ignore
	}
	return json(DEFAULT_TEMPLATES);
};
