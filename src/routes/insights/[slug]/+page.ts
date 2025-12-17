import { loadContentByDirectory } from '$lib/content/loader';

export async function entries() {
	const articles = loadContentByDirectory('insights');
	return articles.map((article) => ({
		slug: article.slug
	}));
}

export const prerender = true;

