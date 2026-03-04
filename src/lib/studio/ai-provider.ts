/**
 * AI provider abstraction for Studio: OpenAI and Anthropic.
 * Set AI_PROVIDER=openai|anthropic and the corresponding API key in env.
 * Used by /studio/api/ai/* routes only; never exposed to client.
 */

export type AIProvider = 'openai' | 'anthropic';

export interface AIMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface AICompletionOptions {
	maxTokens?: number;
	temperature?: number;
}

export interface AICompletionResult {
	success: boolean;
	text?: string;
	error?: string;
}

function getProvider(): AIProvider | null {
	const p = (process.env.AI_PROVIDER || process.env.VITE_AI_PROVIDER || '').toLowerCase();
	if (p === 'openai' || p === 'anthropic') return p as AIProvider;
	// Default to openai if key is set
	if (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY) return 'openai';
	if (process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY) return 'anthropic';
	return null;
}

function getOpenAIKey(): string | null {
	return process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || null;
}

function getAnthropicKey(): string | null {
	return process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || null;
}

/** Call OpenAI chat completions (no SDK). */
async function completeOpenAI(
	messages: AIMessage[],
	opts: AICompletionOptions = {}
): Promise<AICompletionResult> {
	const key = getOpenAIKey();
	if (!key) return { success: false, error: 'OPENAI_API_KEY not set' };

	const body = {
		model: process.env.AI_MODEL || 'gpt-4o-mini',
		messages: messages.map((m) => ({ role: m.role, content: m.content })),
		max_tokens: opts.maxTokens ?? 1024,
		temperature: opts.temperature ?? 0.5
	};

	try {
		const res = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${key}`
			},
			body: JSON.stringify(body)
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			const err = data?.error?.message || data?.message || res.statusText;
			return { success: false, error: String(err) };
		}
		const text = data?.choices?.[0]?.message?.content?.trim();
		return text ? { success: true, text } : { success: false, error: 'Empty response' };
	} catch (e) {
		return { success: false, error: e instanceof Error ? e.message : 'OpenAI request failed' };
	}
}

/** Call Anthropic messages API (no SDK). */
async function completeAnthropic(
	messages: AIMessage[],
	opts: AICompletionOptions = {}
): Promise<AICompletionResult> {
	const key = getAnthropicKey();
	if (!key) return { success: false, error: 'ANTHROPIC_API_KEY not set' };

	// Anthropic: system is separate; user/assistant alternate
	const system = messages.find((m) => m.role === 'system')?.content ?? '';
	const rest = messages.filter((m) => m.role !== 'system');
	const body = {
		model: process.env.AI_MODEL || 'claude-3-5-haiku-20241022',
		max_tokens: opts.maxTokens ?? 1024,
		temperature: opts.temperature ?? 0.5,
		system: system || undefined,
		messages: rest.map((m) => ({ role: m.role, content: m.content }))
	};

	try {
		const res = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': key,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify(body)
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			const err = data?.error?.message || data?.message || res.statusText;
			return { success: false, error: String(err) };
		}
		const text = data?.content?.[0]?.text?.trim();
		return text ? { success: true, text } : { success: false, error: 'Empty response' };
	} catch (e) {
		return { success: false, error: e instanceof Error ? e.message : 'Anthropic request failed' };
	}
}

/** Single completion entry: uses env AI_PROVIDER and the matching key. */
export async function complete(
	messages: AIMessage[],
	opts: AICompletionOptions = {}
): Promise<AICompletionResult> {
	const provider = getProvider();
	if (!provider) return { success: false, error: 'No AI provider configured. Set AI_PROVIDER and API key.' };
	if (provider === 'openai') return completeOpenAI(messages, opts);
	return completeAnthropic(messages, opts);
}

/** Check if AI is available (provider + key). */
export function isAIAvailable(): boolean {
	const provider = getProvider();
	if (!provider) return false;
	if (provider === 'openai') return !!getOpenAIKey();
	return !!getAnthropicKey();
}

export function getConfiguredProvider(): AIProvider | null {
	return getProvider();
}
