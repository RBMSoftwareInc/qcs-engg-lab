import { getPageBySlug, getPageSlugs } from '$lib/content/pages';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const page = getPageBySlug(slug);
	if (!page) {
		throw error(404, 'Page not found');
	}
	return { page };
};

// Prerender all known page slugs when using static adapter
export function entries() {
	const slugs = getPageSlugs();
	return slugs.map((slug) => ({ slug }));
}

export const prerender = true;
