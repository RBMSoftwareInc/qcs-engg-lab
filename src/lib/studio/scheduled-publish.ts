/**
 * Scheduled publish: flip draft content with publishAt <= now to status: live.
 * Used by: POST /studio/api/publish/run-schedule (Studio UI) and scripts/run-scheduled-publish.ts (CLI/cron).
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import fm from 'front-matter';

export interface RunScheduledPublishResult {
	published: string[];
	errors: { path: string; message: string }[];
}

function getGitHubConfig(): { token: string; owner: string; repo: string; branch: string } {
	const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
	const owner = process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER;
	const repo = process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO;
	const branch = process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH || 'main';
	if (!token || !owner || !repo) {
		throw new Error('Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
	}
	return { token, owner, repo, branch };
}

async function scanMdFiles(dir: string, base: string): Promise<{ relativePath: string; fullPath: string }[]> {
	const out: { relativePath: string; fullPath: string }[] = [];
	const entries = await readdir(dir, { withFileTypes: true });
	for (const e of entries) {
		const full = join(dir, e.name);
		if (e.isDirectory()) {
			out.push(...(await scanMdFiles(full, base)));
		} else if (e.isFile() && e.name.endsWith('.md')) {
			out.push({ relativePath: relative(base, full), fullPath: full });
		}
	}
	return out;
}

async function getFileSha(
	owner: string,
	repo: string,
	path: string,
	branch: string,
	token: string
): Promise<string | null> {
	const res = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
		{ headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
	);
	if (!res.ok) return null;
	const data = (await res.json()) as { sha?: string };
	return data.sha ?? null;
}

async function updateFile(
	owner: string,
	repo: string,
	path: string,
	content: string,
	message: string,
	sha: string | null,
	branch: string,
	token: string
): Promise<boolean> {
	const body: { message: string; content: string; branch: string; sha?: string } = {
		message,
		content: Buffer.from(content, 'utf-8').toString('base64'),
		branch
	};
	if (sha) body.sha = sha;
	const res = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		}
	);
	return res.ok;
}

interface Attrs {
	status?: string;
	publishAt?: string;
	[key: string]: unknown;
}

function buildNewContent(fullContent: string, attrs: Attrs, body: string): string {
	const { publishAt: _removed, ...rest } = attrs;
	const newAttrs = { ...rest, status: 'live' };
	const lines = Object.entries(newAttrs).map(([k, v]) => {
		if (v === undefined || v === null) return '';
		if (typeof v === 'string' && v.includes('\n')) return `${k}: |\n  ${v.split('\n').join('\n  ')}`;
		return `${k}: ${JSON.stringify(v)}`;
	});
	return `---\n${lines.filter(Boolean).join('\n')}\n---\n\n${body}`;
}

/**
 * Run scheduled publish: find draft content with publishAt <= now, set status to live, commit via GitHub API.
 * Call from API (Studio UI) or CLI script.
 */
export async function runScheduledPublish(): Promise<RunScheduledPublishResult> {
	const result: RunScheduledPublishResult = { published: [], errors: [] };
	const contentDir = join(process.cwd(), 'content');
	const now = new Date();

	let config: ReturnType<typeof getGitHubConfig>;
	try {
		config = getGitHubConfig();
	} catch (e) {
		result.errors.push({ path: '', message: e instanceof Error ? e.message : 'GitHub config missing' });
		return result;
	}

	try {
		await stat(contentDir);
	} catch {
		result.errors.push({ path: '', message: 'content/ directory not found' });
		return result;
	}

	const files = await scanMdFiles(contentDir, contentDir);
	const toPublish: { contentPath: string; content: string }[] = [];

	for (const { relativePath, fullPath } of files) {
		const raw = await readFile(fullPath, 'utf-8');
		const parsed = fm<Attrs>(raw);
		const status = parsed.attributes?.status ?? 'draft';
		const publishAt = parsed.attributes?.publishAt;
		if (status !== 'draft' || !publishAt) continue;
		const at = new Date(publishAt);
		if (isNaN(at.getTime()) || at > now) continue;
		const newContent = buildNewContent(raw, parsed.attributes, parsed.body);
		toPublish.push({ contentPath: `content/${relativePath}`, content: newContent });
	}

	for (const { contentPath, content } of toPublish) {
		try {
			const sha = await getFileSha(config.owner, config.repo, contentPath, config.branch, config.token);
			const ok = await updateFile(
				config.owner,
				config.repo,
				contentPath,
				content,
				`Scheduled publish: ${contentPath}`,
				sha,
				config.branch,
				config.token
			);
			if (ok) result.published.push(contentPath);
			else result.errors.push({ path: contentPath, message: 'GitHub API update failed' });
		} catch (e) {
			result.errors.push({
				path: contentPath,
				message: e instanceof Error ? e.message : String(e)
			});
		}
	}

	return result;
}
