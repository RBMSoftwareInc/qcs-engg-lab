#!/usr/bin/env npx tsx
/**
 * MCP server: exposes Studio content operations as MCP tools (list_content, get_file, save_content, list_media).
 * Run from project root with same env as Studio: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH.
 *
 * Usage: npx tsx scripts/mcp-server.ts
 * Configure in Cursor/Claude Desktop to spawn this process via stdio.
 *
 * Protocol: JSON-RPC 2.0 over stdio with Content-Length header (MCP style).
 */

import { createInterface } from 'readline';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

// Load .env into process.env
function loadEnv(): void {
	try {
		const envPath = resolve(process.cwd(), '.env');
		if (!existsSync(envPath)) return;
		const content = readFileSync(envPath, 'utf-8');
		content.split('\n').forEach((line) => {
			line = line.trim();
			if (!line || line.startsWith('#')) return;
			const match = line.match(/^([^=]+)=(.*)$/);
			if (match) {
				const key = match[1].trim();
				let value = match[2].trim();
				if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
					value = value.slice(1, -1);
				if (!process.env[key]) process.env[key] = value;
			}
		});
	} catch {
		// ignore
	}
}
loadEnv();

function getConfig(): { token: string; owner: string; repo: string; branch: string } {
	const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
	const owner = process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER;
	const repo = process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO;
	const branch = process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH || 'main';
	if (!token || !owner || !repo) {
		throw new Error('Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO (e.g. in .env)');
	}
	return { token, owner, repo, branch };
}

async function githubRequest<T>(path: string, opts: { method?: string; body?: string } = {}): Promise<T> {
	const config = getConfig();
	const url = `https://api.github.com/repos/${config.owner}/${config.repo}${path}`;
	const res = await fetch(url, {
		method: opts.method || 'GET',
		headers: {
			Authorization: `Bearer ${config.token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'QCS-MCP-Server',
			'Content-Type': 'application/json',
			...((opts.body && { body: opts.body }) || {})
		}
	});
	if (!res.ok) {
		const t = await res.text();
		throw new Error(`GitHub ${res.status}: ${t || res.statusText}`);
	}
	return res.json() as Promise<T>;
}

async function listFiles(dir: string): Promise<{ path: string; type: string }[]> {
	const enc = encodeURIComponent(dir || '');
	const data = await githubRequest<{ path?: string; type?: string } | { path?: string; type?: string }[]>(
		`/contents/${enc}?ref=${getConfig().branch}`
	);
	const list = Array.isArray(data) ? data : [data];
	return list.map((f) => ({ path: f.path!, type: f.type || 'file' }));
}

async function getFile(path: string): Promise<{ content: string; sha?: string }> {
	const enc = encodeURIComponent(path);
	const data = await githubRequest<{ content?: string; sha?: string }>(
		`/contents/${enc}?ref=${getConfig().branch}`
	);
	const content = data.content
		? Buffer.from(data.content, 'base64').toString('utf-8')
		: '';
	return { content, sha: data.sha };
}

async function saveFile(path: string, content: string, message: string): Promise<{ success: boolean }> {
	let sha: string | undefined;
	try {
		const existing = await getFile(path);
		sha = existing.sha;
	} catch {
		// new file
	}
	const body = JSON.stringify({
		message,
		content: Buffer.from(content, 'utf-8').toString('base64'),
		branch: getConfig().branch,
		...(sha && { sha })
	});
	await githubRequest(`/contents/${encodeURIComponent(path)}`, { method: 'PUT', body });
	return { success: true };
}

// --- MCP stdio transport (Content-Length framed JSON-RPC) ---
function send(obj: object): void {
	const msg = JSON.stringify(obj);
	const out = `Content-Length: ${Buffer.byteLength(msg, 'utf-8')}\r\n\r\n${msg}`;
	process.stdout.write(out);
}

function parseBuffer(buf: string): { messages: object[]; remainder: string } {
	const messages: object[] = [];
	let remainder = buf;
	while (remainder.length > 0) {
		const match = remainder.match(/Content-Length:\s*(\d+)\r\n\r\n/);
		if (!match) break;
		const len = parseInt(match[1], 10);
		const start = match[0].length;
		if (start + len > remainder.length) break;
		const body = remainder.slice(start, start + len);
		remainder = remainder.slice(start + len);
		try {
			messages.push(JSON.parse(body));
		} catch {
			// skip bad JSON
		}
	}
	return { messages, remainder };
}

const TOOLS = [
	{
		name: 'list_content',
		description: 'List content files (markdown) in the site. Optionally pass a subpath e.g. "content/insights".',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string', description: 'Directory path, e.g. content or content/insights', default: 'content' } },
			required: []
		}
	},
	{
		name: 'get_file',
		description: 'Read a file from the repo by path (e.g. content/about.md, config/menus.json).',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string', description: 'File path in the repo' } },
			required: ['path']
		}
	},
	{
		name: 'save_content',
		description: 'Write or update a file in the repo. Use with path and content and an optional commit message.',
		inputSchema: {
			type: 'object',
			properties: {
				path: { type: 'string' },
				content: { type: 'string' },
				message: { type: 'string', default: 'Update from MCP' }
			},
			required: ['path', 'content']
		}
	},
	{
		name: 'list_media',
		description: 'List files in static/assets (or another path under static/).',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string', default: 'static/assets' } },
			required: []
		}
	}
];

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<{ content: { type: 'text'; text: string }[] }> {
	try {
		if (name === 'list_content') {
			const path = (args.path as string) || 'content';
			const files = await listFiles(path);
			const text = files.map((f) => `${f.type === 'dir' ? '📁' : '📄'} ${f.path}`).join('\n');
			return { content: [{ type: 'text', text: text || '(empty)' }] };
		}
		if (name === 'get_file') {
			const path = args.path as string;
			if (!path) throw new Error('path is required');
			const { content } = await getFile(path);
			return { content: [{ type: 'text', text: content }] };
		}
		if (name === 'save_content') {
			const path = args.path as string;
			const content = args.content as string;
			const message = (args.message as string) || 'Update from MCP';
			if (!path || content === undefined) throw new Error('path and content are required');
			await saveFile(path, content, message);
			return { content: [{ type: 'text', text: `Saved ${path}` }] };
		}
		if (name === 'list_media') {
			const path = (args.path as string) || 'static/assets';
			const files = await listFiles(path);
			const text = files.map((f) => `${f.type === 'dir' ? '📁' : '📄'} ${f.path}`).join('\n');
			return { content: [{ type: 'text', text: text || '(empty)' }] };
		}
		return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		return { content: [{ type: 'text', text: `Error: ${err}` }] };
	}
}

async function handleRequest(req: { id?: number; method?: string; params?: Record<string, unknown> }): Promise<void> {
	const id = req.id;
	if (req.method === 'initialize') {
		send({
			jsonrpc: '2.0',
			id,
			result: {
				protocolVersion: '2024-11-05',
				serverInfo: { name: 'qcs-studio-mcp', version: '1.0.0' },
				capabilities: { tools: {} }
			}
		});
		return;
	}
	if (req.method === 'tools/list') {
		send({
			jsonrpc: '2.0',
			id,
			result: { tools: TOOLS }
		});
		return;
	}
	if (req.method === 'tools/call') {
		const name = (req.params?.name as string) || '';
		const args = (req.params?.arguments as Record<string, unknown>) || {};
		const result = await handleToolCall(name, args);
		send({ jsonrpc: '2.0', id, result });
		return;
	}
	if (id !== undefined) {
		send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
	}
}

let buffer = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk: string) => {
	buffer += chunk;
	const { messages, remainder } = parseBuffer(buffer);
	buffer = remainder;
	for (const msg of messages) {
		handleRequest(msg as { id?: number; method?: string; params?: Record<string, unknown> }).catch((e) => {
			send({
				jsonrpc: '2.0',
				id: (msg as { id?: number }).id,
				error: { code: -32603, message: e instanceof Error ? e.message : String(e) }
			});
		});
	}
});
