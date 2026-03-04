import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { complete } from '$lib/studio/ai-provider';

const OPERATIONS = ['shorten', 'expand', 'formal', 'casual'] as const;
type Operation = (typeof OPERATIONS)[number];

/** POST: transform selected text (shorten, expand, formal, casual). */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: { content?: string; operation?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	const content = typeof body?.content === 'string' ? body.content.trim() : '';
	const operation = OPERATIONS.includes(body?.operation as Operation) ? (body.operation as Operation) : 'shorten';

	if (!content) {
		return json({ error: 'content is required' }, { status: 400 });
	}

	const instructions: Record<Operation, string> = {
		shorten: 'Rewrite the following text in fewer words, keeping the main points. Output only the rewritten text.',
		expand: 'Expand the following text with a bit more detail and clarity. Output only the expanded text.',
		formal: 'Rewrite the following text in a more formal, professional tone. Output only the rewritten text.',
		casual: 'Rewrite the following text in a more casual, friendly tone. Output only the rewritten text.'
	};

	const result = await complete(
		[
			{ role: 'system', content: 'You are an editorial assistant. Follow the instruction exactly. Output only the requested text, no preamble.' },
			{ role: 'user', content: `${instructions[operation]}\n\n---\n${content}` }
		],
		{ maxTokens: 1024, temperature: 0.4 }
	);

	if (!result.success) {
		return json({ error: result.error || 'AI unavailable' }, { status: 502 });
	}
	return json({ text: result.text });