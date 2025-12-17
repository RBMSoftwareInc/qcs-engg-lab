import { loadContentByDirectory } from '$lib/content/loader';

export async function entries() {
	const services = loadContentByDirectory('services');
	return services.map((service) => ({
		slug: service.slug
	}));
}

export const prerender = true;

