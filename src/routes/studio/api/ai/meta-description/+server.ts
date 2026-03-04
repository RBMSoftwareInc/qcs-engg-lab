import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession } from '$lib/studio/auth';
import { complete } from '$lib/studio/ai-provider';

/** POST: generate a short meta description from page content. */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: { content?: string; title?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	const content = typeof body?.content === 'string' ? body.content.trim() : '';
	const title = typeof body?.title === 'string' ? body.title.trim() : '';

	const system = `You are an SEO copywriter. Generate a single sentence meta description (under 160 characters) for a web page. Output only the sentence—no quotes, no "Description:" label.`;
	const user = title
		? `Title: ${title}\n\nBody:\n${content.slice(0, 2000)}\n\nMeta description:`
		: `Body:\n${content.slice(0, 2000)}\n\nMeta description:`;

	const result = await complete(
		[{ role: 'system', content: system }, { role: 'user', content: user }],
		{ maxTokens: 200, temperature: 0.3 }
	);

	if (!result.success) {
		return json({ error: result.error || 'AI unavailable' }, { status: 502 });
	}
	const text = (result.text || '').slice(0, 160);
	return json({ description: text });