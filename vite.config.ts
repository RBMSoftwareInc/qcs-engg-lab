import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '');
	
	return {
		plugins: [sveltekit()],
		server: {
			port: 5173,
			strictPort: false
		},
		// Make all env variables available to server-side code
		define: {
			// This makes env vars available at build time
			// Runtime access still uses process.env
		}
	};
});

