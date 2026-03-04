import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOrUpdateFile, validateContentPath, getSafeContentPath, getFileContent } from '$lib/studio/github-api';
import { checkRateLimit, checkFormRateLimit } from '$lib/studio/rate-limiter';
import { loadDataFormsConfigFromRepo } from '$lib/studio/data-forms-config';

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_MESSAGE = 5000;

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
	if (!config.contact.enabled) {
		return json(
			{ success: false, message: 'Contact form is not currently accepting submissions.' },
			{ status: 503 }
		);
	}

	const ip = getClientAddress();
	const formLimit = checkFormRateLimit(`contact:${ip}`);
	if (!formLimit.allowed) {
		return json({ success: false, message: 'Too many requests. Try again later.' }, { status: 429 });
	}

	const rateLimit = checkRateLimit('github');
	if (!rateLimit.allowed) {
		return json({ success: false, message: 'Service temporarily busy.' }, { status: 503 });
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
	const message = typeof raw?.message === 'string' ? sanitize(raw.message, MAX_MESSAGE) : '';

	if (!name || !email || !message) {
		return json({ success: false, message: 'Name, email, and message are required.' }, { status: 400 });
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ success: false, message: 'Invalid email address.' }, { status: 400 });
	}

	const dataDir = config.contact.path || 'data/contact';
	const filePath = getSafeContentPath(`${dataDir}/${safeFilename()}`, 'data');
	if (!validateContentPath(filePath, ['data'])) {
		return json({ success: false, message: 'Invalid path.' }, { status: 400 });
	}

	const payload = { name, email, message, submittedAt: new Date().toISOString() };
	const content = JSON.stringify(payload, null, 2);
	const result = await createOrUpdateFile(filePath, content, `contact: ${name} (${email})`);

	if (result.success) {
		return json({ success: true, message: 'Thank you. We\'ll get back to you soon.' });
	}
	return json({ success: false, message: result.error ?? 'Submission failed.' }, { status: 500 });
};
