import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { getFileContent } from '$lib/studio/github-api';
import { LAYOUT_REGISTRY } from '$lib/studio/layout-contracts';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const BLOCK_REGISTRY_PATH = 'config/block-registry.json';

export interface BlockEntry {
	id: string;
	name: string;
	description: string;
	slots?: { name: string; type: string; required?: boolean; description?: string }[];
	component?: string;
}

/** GET /studio/api/blocks – list available blocks (from config or layout registry). Extensibility: add config/block-registry.json to override/extend. */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const defaultBlocks: BlockEntry[] = Object.entries(LAYOUT_REGISTRY).map(([id, layout]) => ({
		id,
		name: layout.name,
		description: layout.description,
		slots: layout.slots,
		component: layout.component
	}));

	try {
		// Prefer local config (e.g. in repo or created by Studio)
		const localPath = join(process.cwd(), BLOCK_REGISTRY_PATH);
		if (existsSync(localPath)) {
			const raw = readFileSync(localPath, 'utf-8');
			const data = JSON.parse(raw) as { blocks?: BlockEntry[] };
			if (Array.isArray(data.blocks) && data.blocks.length > 0) {
				return json({ blocks: data.blocks });
			}
		}
		// Fallback: GitHub
		const result = await getFileContent(BLOCK_REGISTRY_PATH);
		if (result.success && result.data?.content) {
			const data = JSON.parse(result.data.content) as { blocks?: BlockEntry[] };
			if (Array.isArray(data.blocks) && data.blocks.length > 0) {
				return json({ blocks: data.blocks });
			}
		}
	} catch {
		// ignore
	}

	return json({ blocks: defaultBlocks });
};
