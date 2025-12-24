// Configuration for Netlify deployment (supports server-side Studio)
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Netlify adapter automatically converts API routes to Netlify Functions
			// This allows Studio to work fully on Netlify
			edge: false, // Use Node.js runtime (not Edge Functions)
			split: false // Single function for all routes
		}),
		prerender: {
			handleHttpError: 'warn',
			handleUnseenRoutes: 'warn',
			entries: ['*']
		}
	}
};

export default config;
