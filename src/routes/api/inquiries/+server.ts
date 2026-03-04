/**
 * Public API: persist "Let's Get Started" (inquiry) form data to the repo as JSON files.
 * No DB: each submission becomes a file under data/inquiries/ and is committed via GitHub API.
 * Respects Studio Data Forms config: when inquiries are disabled, returns 503.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOrUpdateFile, validateContentPath, getSafeContentPath, getFileContent } from '$lib/studio/github-api';
import { checkRateLimit, checkFormRateLimit } from '$lib/studio/rate-limiter';
import { loadDataFormsConfigFromRepo } from '$lib/studio/data-forms-config';
const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_INTENT = 5000;

function sanitize(str: string, maxLen: number): string {
	return String(str).trim().slice(0, maxLen);
}

function safeFilename(): string {
	const now = new Date();
	const date = now.toISOString().slice(0, 10);
	const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
	const id = Math.random().toString(36).slice(2, 8);
	return `${date}-${time}-${id}.json`;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const config = await loadDataFormsConfigFromRepo(getFileContent);
	if (!config.inquiries.enabled) {
		return json(
			{ success: false, message: 'This form is not currently accepting submissions.' },
			{ status: 503 }
		);
	}

	// Per-IP rate limit for public form
	const ip = getClientAddress();
	const formLimit = checkFormRateLimit(`inquiry:${ip}`);
	if (!formLimit.allowed) {
		return json(
			{ success: false, message: 'Too many submissions. Try again later.' },
			{ status: 429 }
		);
	}

	// Global GitHub API rate limit
	const rateLimit = checkRateLimit('github');
	if (!rateLimit.allowed) {
		return json(
			{ success: false, message: 'Service temporarily busy. Please try again later.' },
			{ status: 503 }
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, message: 'Invalid JSON' }, { status: 400 });
	}

	const raw = body as Record<string, unknown>;
	const name = typeof raw?.name === 'string' ? sanitize(raw.name, MAX_NAME) : '';
	const email = typeof raw?.email === 'string' ? sanitize(raw.email, MAX_EMAIL) : '';
	const intent = typeof raw?.intent === 'string' ? sanitize(raw.intent, MAX_INTENT) : '';

	if (!name || !email || !intent) {
		return json(
			{ success: false, message: 'Name, email, and intent are required.' },
			{ status: 400 }
		);
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ success: false, message: 'Invalid email address.' }, { status: 400 });
	}

	const dataDir = config.inquiries.path || 'data/inquiries';
	const filePath = getSafeContentPath(`${dataDir}/${safeFilename()}`, 'data');
	if (!validateContentPath(filePath, ['data'])) {
		return json({ success: false, message: 'Invalid path.' }, { status: 400 });
	}

	const payload = {
		name,
		email,
		intent,
		submittedAt: new Date().toISOString()
	};
	const content = JSON.stringify(payload, null, 2);
	const commitMessage = `inquiry: ${name} (${email})`;

	const result = await createOrUpdateFile(
		filePath,
		content,
		commitMessage
	);

	if (result.success) {
		return json({ success: true, message: 'Thank you. We\'ll get back to you soon.' });
	}

	return json(
		{ success: false, message: result.error ?? 'Submission failed. Please try again.' },
		{ status: 500 }
	);
};
