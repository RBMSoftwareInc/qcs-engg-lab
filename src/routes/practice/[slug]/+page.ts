import { loadContentByDirectory } from '$lib/content/loader';

export async function entries() {
	const domains = loadContentByDirectory('domains');
	const services = loadContentByDirectory('services');
	const allItems = [...domains, ...services];
	
	return allItems.map((item) => ({
		slug: item.slug
	}));
}

export const prerender = true;

