/**
 * Change requests (PR-style) storage.
 * Persists to config/change-requests.json.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

export type ChangeRequestStatus = 'open' | 'merged' | 'rejected';

export interface ChangeRequestFile {
	path: string;
	content: string;
}

export interface ChangeRequest {
	id: string;
	authorEmail: string;
	status: ChangeRequestStatus;
	createdAt: string;
	updatedAt?: string;
	title: string;
	description?: string;
	files: ChangeRequestFile[];
	mergedBy?: string;
	rejectedBy?: string;
}

const CONFIG_PATH = join(process.cwd(), 'config', 'change-requests.json');

function loadAll(): ChangeRequest[] {
	try {
		if (!existsSync(CONFIG_PATH)) return [];
		const raw = readFileSync(CONFIG_PATH, 'utf-8');
		const data = JSON.parse(raw);
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

function saveAll(requests: ChangeRequest[]): void {
	const dir = join(process.cwd(), 'config');
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	writeFileSync(CONFIG_PATH, JSON.stringify(requests, null, 2), 'utf-8');
}

function generateId(): string {
	return 'cr-' + randomBytes(8).toString('hex');
}

export function listChangeRequests(status?: ChangeRequestStatus): ChangeRequest[] {
	const all = loadAll();
	if (status) return all.filter((r) => r.status === status);
	return all;
}

export function getChangeRequest(id: string): ChangeRequest | null {
	return loadAll().find((r) => r.id === id) ?? null;
}

export function createChangeRequest(params: {
	authorEmail: string;
	title: string;
	description?: string;
	files: ChangeRequestFile[];
}): ChangeRequest {
	const all = loadAll();
	const cr: ChangeRequest = {
		id: generateId(),
		authorEmail: params.authorEmail,
		status: 'open',
		createdAt: new Date().toISOString(),
		title: params.title,
		description: params.description,
		files: params.files
	};
	all.unshift(cr);
	saveAll(all);
	return cr;
}

export function setChangeRequestStatus(
	id: string,
	status: 'merged' | 'rejected',
	actedBy: string
): ChangeRequest | null {
	const all = loadAll();
	const idx = all.findIndex((r) => r.id === id);
	if (idx === -1) return null;
	const cr = all[idx];
	if (cr.status !== 'open') return null;
	all[idx] = {
		...cr,
		status,
		updatedAt: new Date().toISOString(),
		...(status === 'merged' ? { mergedBy: actedBy } : { rejectedBy: actedBy })
	};
	saveAll(all);
	return all[idx];
}
