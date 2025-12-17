import { loadContentByDirectory } from '$lib/content/loader';

export async function entries() {
	const signals = loadContentByDirectory('signals');
	return signals.map((signal) => ({
		slug: signal.slug
	}));
}

export const prerender = true;

