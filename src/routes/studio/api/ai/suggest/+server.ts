import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { complete } from '$lib/studio/ai-provider';

/** POST: suggest next paragraph from current content (and optional cursor context). */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: { content?: string; cursorContext?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	const content = typeof body?.content === 'string' ? body.content.trim() : '';
	const cursorContext = typeof body?.cursorContext === 'string' ? body.cursorContext.trim() : '';

	const system = `You are a concise editorial assistant. Given the current text (and optionally the sentence/paragraph before the cursor), suggest the next paragraph only. Output nothing but the new paragraph—no quotes, no explanation. Match the tone and style.`;
	const user = cursorContext
		? `Text so far:\n${content}\n\nContext around cursor:\n${cursorContext}\n\nSuggest the next paragraph:`
		: `Text so far:\n${content}\n\nSuggest the next paragraph:`;

	const result = await complete(
		[{ role: 'system', content: system }, { role: 'user', content: user }],
		{ maxTokens: 400, temperature: 0.6 }
	);

	if (!result.success) {
		return json({ error: result.error || 'AI unavailable' }, { status: 502 });
	}
	return json({ suggestion: result.text });