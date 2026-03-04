import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOrUpdateFile, validateContentPath, getSafeContentPath, getFileContent } from '$lib/studio/github-api';
import { checkRateLimit, checkFormRateLimit } from '$lib/studio/rate-limiter';
import { loadDataFormsConfigFromRepo } from '$lib/studio/data-forms-config';

const MAX_PAGE = 500;
const MAX_COMMENT = 5000;

function sanitize(str: string, maxLen: number): string {
	return String(str).trim().slice(0, maxLen);
}

function safeFilename(): string {
	const now = new Date();
	const date = now.toISOString().slice(0, 10);
	const id = Math.random().toString(36).slice(2, 8);
	return `${date}-${id}.json`;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const config = await loadDataFormsConfigFromRepo(getFileContent);
	if (!config.feedback.enabled) {
		return json(
			{ success: false, message: 'Feedback form is not currently accepting submissions.' },
			{ status: 503 }
		);
	}

	const ip = getClientAddress();
	const formLimit = checkFormRateLimit(`feedback:${ip}`);
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
	const page = typeof raw?.page === 'string' ? sanitize(raw.page, MAX_PAGE) : '';
	const comment = typeof raw?.comment === 'string' ? sanitize(raw.comment, MAX_COMMENT) : '';
	const rating = typeof raw?.rating === 'number' && raw.rating >= 1 && raw.rating <= 5
		? Math.floor(raw.rating)
		: undefined;

	if (!comment) {
		return json({ success: false, message: 'Comment is required.' }, { status: 400 });
	}

	const dataDir = config.feedback.path || 'data/feedback';
	const filePath = getSafeContentPath(`${dataDir}/${safeFilename()}`, 'data');
	if (!validateContentPath(filePath, ['data'])) {
		return json({ success: false, message: 'Invalid path.' }, { status: 400 });
	}

	const payload = {
		page: page || undefined,
		rating,
		comment,
		submittedAt: new Date().toISOString()
	};
	const content = JSON.stringify(payload, null, 2);
	const result = await createOrUpdateFile(filePath, content, 'feedback submission');

	if (result.success) {
		return json({ success: true, message: 'Thank you for your feedback.' });
	}
	return json({ success: false, message: result.error ?? 'Submission failed.' }, { status: 500 });
};
