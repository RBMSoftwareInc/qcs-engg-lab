<script lang="ts">
	// IMPORTANT: Load JSON patch FIRST before anything else
	import '$lib/studio/json-patch';
	
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import StudioAntigravity from '$lib/components/StudioAntigravity.svelte';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';

	let { children } = $props();
	let isAuthenticated = $state(false);
	let userEmail = $state<string | null>(null);
	let userRole = $state<string | null>(null);

	let isStaticBuild = $state(false); // Will be set after check
	let inIframe = $state(false); // Hide header/footer when embedded in settings modal

	// Global error handler to catch ANY JSON parse errors
	if (typeof window !== 'undefined') {
		window.addEventListener('unhandledrejection', (event) => {
			if (event.reason instanceof SyntaxError && event.reason.message.includes('Unexpected token')) {
				console.warn('Studio: Caught JSON parse error - static build detected');
				isStaticBuild = true;
				event.preventDefault(); // Prevent error from showing in console
				if ($page.url.pathname !== '/studio/login') {
					goto('/studio/login');
				}
			}
		});
	}

	onMount(async () => {
		inIframe = typeof window !== 'undefined' && window.self !== window.top;

		// IMMEDIATELY assume static build to prevent ANY API calls
		// Only check if we're NOT on login page (login page handles its own check)
		if ($page.url.pathname === '/studio/login') {
			// Let login page handle the check
			return;
		}

		// For all other Studio pages, assume static build immediately
		// This prevents any API calls that could cause JSON parse errors
		isStaticBuild = true;
		
		// Optionally, do a silent check in background (but don't wait for it)
		checkApiAvailable().then((available) => {
			if (available) {
				// Only if API is available, try to authenticate
				fetch('/studio/api/auth/check', {
					method: 'GET',
					headers: { 'Accept': 'application/json' }
				})
					.then((response) => safeJsonParse<{ authenticated: boolean; email: string | null; role?: string }>(response))
					.then(({ data, isHtml }) => {
						if (!isHtml && data) {
							isStaticBuild = false;
							isAuthenticated = data.authenticated || false;
							userEmail = data.email || null;
							userRole = data.role ?? null;
						}
					})
					.catch(() => {
						// Silently fail - already set to static build
					});
			}
		}).catch(() => {
			// Already set to static build, ignore
		});
	});

	async function handleLogout() {
		try {
			const response = await fetch('/studio/api/auth/logout', { method: 'POST' });
			// Don't parse response, just redirect
			isAuthenticated = false;
			goto('/studio/login');
		} catch {
			// Even if logout fails, redirect to login
			isAuthenticated = false;
			goto('/studio/login');
		}
	}
</script>

{#if isAuthenticated || $page.url.pathname === '/studio/login' || isStaticBuild}
	<div class="studio-layout" class:studio-embed={inIframe}>
		{#if !inIframe}
			<div class="studio-antigravity-wrap" aria-hidden="true">
				<StudioAntigravity />
			</div>
		{/if}
		{#if isAuthenticated && $page.url.pathname !== '/studio/login' && !isStaticBuild && !inIframe}
			<!-- Studio Header with Logo and Navigation -->
			<nav class="studio-header">
				<div class="studio-header-container">
					<div class="studio-header-left">
						<a href="/" class="studio-logo-link" aria-label="QuantumCore Solutions – Home">
							<Logo size={36} variant="full" showText={false} />
						</a>
						<div class="studio-brand">
							<span class="studio-brand-text">QCS Studio</span>
						</div>
						<div class="studio-nav-links">
							<a href="/studio" class:active={$page.url.pathname === '/studio' || $page.url.pathname.startsWith('/studio/edit')}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
									<polyline points="14 2 14 8 20 8"></polyline>
									<line x1="16" y1="13" x2="8" y2="13"></line>
									<line x1="16" y1="17" x2="8" y2="17"></line>
								</svg>
								<span>Content</span>
							</a>
							<a href="/studio/builder" class:active={$page.url.pathname === '/studio/builder' || $page.url.pathname.startsWith('/studio/builder/')}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="3" width="7" height="7"></rect>
									<rect x="14" y="3" width="7" height="7"></rect>
									<rect x="3" y="14" width="7" height="7"></rect>
									<rect x="14" y="14" width="7" height="7"></rect>
								</svg>
								<span>Builder</span>
							</a>
							<a href="/studio/design-skins" class:active={$page.url.pathname === '/studio/design-skins'}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
									<circle cx="8.5" cy="8.5" r="1.5"></circle>
									<polyline points="21 15 16 10 5 21"></polyline>
								</svg>
								<span>Design Skins</span>
							</a>
							<a href="/studio/templates" class:active={$page.url.pathname === '/studio/templates'}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="4" width="18" height="5" rx="1"></rect>
									<rect x="3" y="11" width="18" height="5" rx="1"></rect>
									<rect x="3" y="18" width="18" height="4" rx="1"></rect>
								</svg>
								<span>Templates</span>
							</a>
							<a href="/studio/media" class:active={$page.url.pathname === '/studio/media'}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
									<circle cx="8.5" cy="8.5" r="1.5"></circle>
									<polyline points="21 15 16 10 5 21"></polyline>
								</svg>
								<span>Media</span>
							</a>
							<a href="/studio/requests" class:active={$page.url.pathname === '/studio/requests' || $page.url.pathname.startsWith('/studio/requests/')}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
									<polyline points="14 2 14 8 20 8"></polyline>
									<line x1="16" y1="13" x2="8" y2="13"></line>
									<line x1="16" y1="17" x2="8" y2="17"></line>
									<polyline points="10 9 9 9 8 9"></polyline>
								</svg>
								<span>Reviews</span>
							</a>
							{#if userRole && userRole !== 'viewer'}
							<a href="/studio/settings" class:active={$page.url.pathname === '/studio/settings' || $page.url.pathname.startsWith('/studio/settings/')}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="12" cy="12" r="3"></circle>
									<path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
								</svg>
								<span>Settings</span>
							</a>
							{/if}
						</div>
					</div>
					<div class="studio-header-right">
						<span class="studio-user-email">{userEmail}</span>
						<button class="studio-logout-btn" onclick={handleLogout} title="Logout">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
								<polyline points="16 17 21 12 16 7"></polyline>
								<line x1="21" y1="12" x2="9" y2="12"></line>
							</svg>
						</button>
					</div>
				</div>
			</nav>
		{/if}

		<main class="studio-main">
			{@render children()}
		</main>

		{#if isAuthenticated && $page.url.pathname !== '/studio/login' && !isStaticBuild && !inIframe}
			<footer class="studio-footer">
				<div class="studio-footer-inner">
					<a href="/" class="studio-footer-home">← Back to site</a>
					<span class="studio-footer-brand">QCS Studio</span>
					<span class="studio-footer-tagline">Content &amp; design · Git-native</span>
					<span class="studio-footer-labs">
						<a href="/playground" class="studio-footer-lab">Neural</a>
						<span class="studio-footer-lab-sep">·</span>
						<a href="/forge" class="studio-footer-lab">Forge</a>
					</span>
					<span class="studio-footer-copy">© {new Date().getFullYear()} QuantumCore Solutions</span>
				</div>
			</footer>
		{/if}
	</div>
{/if}

<style>
	.studio-layout {
		min-height: 100vh;
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
		padding-top: 0;
		position: relative;
	}

	.studio-antigravity-wrap {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		transform: translateZ(0);
	}

	/* Studio Header - Single unified header */
	.studio-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--border-subtle);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		height: 64px;
	}

	.studio-header-container {
		max-width: 1600px;
		margin: 0 auto;
		padding: 0 2rem;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.studio-header-left {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex: 1;
	}

	.studio-logo-link {
		display: flex;
		align-items: center;
		text-decoration: none;
		flex-shrink: 0;
	}

	.studio-brand {
		display: flex;
		align-items: center;
	}

	.studio-brand-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	.studio-nav-links {
		display: flex;
		gap: 0.5rem;
		margin-left: 2rem;
	}

	.studio-nav-links a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9rem;
		border-radius: 6px;
		transition: all 0.2s ease;
		position: relative;
	}

	.studio-nav-links a svg {
		flex-shrink: 0;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.studio-nav-links a:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.studio-nav-links a:hover svg {
		opacity: 1;
	}

	.studio-nav-links a.active {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.studio-nav-links a.active svg {
		opacity: 1;
	}

	.studio-header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.studio-user-email {
		font-size: 0.875rem;
		color: var(--text-secondary);
		padding: 0.5rem 0;
	}

	.studio-logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		background: transparent;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
		color: var(--text-secondary);
		transition: all 0.2s ease;
	}

	.studio-logout-btn:hover {
		background: var(--bg-secondary);
		border-color: var(--border-subtle);
		color: var(--text-primary);
		transform: translateY(-1px);
	}

	.studio-layout.studio-embed .studio-main {
		margin-top: 0;
		min-height: 100vh;
		padding: 1.5rem 2rem !important;
		box-sizing: border-box;
	}

	.studio-layout.studio-embed .studio-main :global(.menus-settings-page),
	.studio-layout.studio-embed .studio-main :global(.seo-settings-page),
	.studio-layout.studio-embed .studio-main :global(.publishing-page),
	.studio-layout.studio-embed .studio-main :global(.settings-page) {
		max-width: 100%;
		padding-left: 0;
		padding-right: 0;
	}

	.studio-main {
		position: relative;
		z-index: 0;
		flex: 1;
		padding: 0;
		max-width: 1600px;
		width: 100%;
		margin: 0 auto;
		margin-top: 64px;
		min-height: calc(100vh - 64px);
		background: transparent;
		padding-top: 0;
	}

	.studio-main :global(.studio-page),
	.studio-main :global(.editor-page),
	.studio-main :global(.new-content-page),
	.studio-main :global(.settings-page),
	.studio-main :global(.media-page) {
		padding: 2rem 2rem 0 2rem;
	}

	@media (min-width: 768px) {
		.studio-header-container {
			padding: 0 3rem;
		}
		
		.studio-main :global(.studio-page),
		.studio-main :global(.editor-page),
		.studio-main :global(.new-content-page),
		.studio-main :global(.settings-page),
		.studio-main :global(.media-page) {
			padding: 0 3rem;
		}
	}

	@media (min-width: 1024px) {
		.studio-header-container {
			padding: 0 4rem;
		}
		
		.studio-main :global(.studio-page),
		.studio-main :global(.editor-page),
		.studio-main :global(.new-content-page),
		.studio-main :global(.settings-page),
		.studio-main :global(.media-page) {
			padding: 0 4rem;
		}
	}

	@media (min-width: 1440px) {
		.studio-header-container {
			padding: 0 5rem;
		}
		
		.studio-main :global(.studio-page),
		.studio-main :global(.editor-page),
		.studio-main :global(.new-content-page),
		.studio-main :global(.settings-page),
		.studio-main :global(.media-page) {
			padding: 0 5rem;
		}
	}

	.studio-footer {
		margin-top: auto;
		padding: 1.25rem 2rem;
		border-top: 1px solid var(--border-subtle);
		background: rgba(255, 253, 247, 0.8);
	}

	.studio-footer-inner {
		max-width: 1600px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem 1.5rem;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.studio-footer-home {
		color: var(--text-primary);
		text-decoration: none;
		font-weight: 500;
	}

	.studio-footer-home:hover {
		color: var(--highlight);
	}

	.studio-footer-brand {
		font-weight: 600;
		color: var(--text-primary);
	}

	.studio-footer-tagline {
		color: var(--text-muted);
	}

	.studio-footer-labs {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.studio-footer-lab {
		color: var(--text-primary);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.studio-footer-lab:hover {
		color: var(--highlight);
	}

	.studio-footer-lab-sep {
		color: var(--text-muted);
		font-size: 0.75rem;
	}

	.studio-footer-copy {
		color: var(--text-muted);
	}

	@media (min-width: 768px) {
		.studio-footer-inner {
			justify-content: space-between;
		}
	}

	.static-build-notice-full {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: linear-gradient(to bottom, var(--bg-primary) 0%, var(--bg-secondary) 100%);
	}

	.notice-content {
		max-width: 700px;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		padding: 3rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.notice-content h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.notice-content > p {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.notice-options {
		text-align: left;
		margin: 2rem 0;
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 8px;
	}

	.notice-options h3 {
		font-size: 1.1rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.notice-options ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.notice-options li {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
		position: relative;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.notice-options li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: var(--highlight);
		font-weight: 600;
	}

	.notice-options code {
		background: var(--bg-primary);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9em;
	}

	.notice-content .back-link {
		display: inline-block;
		margin-top: 2rem;
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-color: var(--highlight);
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.studio-header-container {
			padding: 0 1.5rem;
		}

		.studio-nav-links {
			margin-left: 1rem;
			gap: 0.25rem;
		}

		.studio-nav-links a span {
			display: none;
		}

		.studio-nav-links a {
			padding: 0.5rem;
		}

		.studio-user-email {
			display: none;
		}

		.studio-main {
			margin-top: 64px;
		}

		.studio-main :global(.studio-page),
		.studio-main :global(.editor-page) {
			padding: 0 1.5rem;
		}
	}
</style>

