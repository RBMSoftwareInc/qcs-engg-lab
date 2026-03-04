// Configuration for Netlify (default) or static build (Hostinger)
// Set BUILD_STATIC=1 for static-only output to build/ (e.g. Hostinger upload)
import adapterNetlify from '@sveltejs/adapter-netlify';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const useStatic = process.env.BUILD_STATIC === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: useStatic
			? adapterStatic({ strict: false }) // strict: false so API routes are skipped without failing
			: adapterNetlify({
					edge: false,
					split: false
				}),
		prerender: {
			handleHttpError: 'warn',
			handleUnseenRoutes: 'warn',
			entries: ['*']
		}
	}
};

export default config;
