import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Redirect /studio/builder/home → /studio/builder?page=home so the builder loads that page */
export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	if (slug) {
		throw redirect(302, `/studio/builder?page=${encodeURIComponent(slug)}`);
	}
	return { slug: '' };
};
