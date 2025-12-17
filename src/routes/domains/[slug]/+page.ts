import { loadContentByDirectory } from '$lib/content/loader';

export async function entries() {
	const domains = loadContentByDirectory('domains');
	return domains.map((domain) => ({
		slug: domain.slug
	}));
}

export const prerender = true;

