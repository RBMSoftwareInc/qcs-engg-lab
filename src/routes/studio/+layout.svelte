<script lang="ts">
	// IMPORTANT: Load JSON patch FIRST before anything else
	import '$lib/studio/json-patch';
	
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';

	let { children } = $props();
	let isAuthenticated = $state(false);
	let userEmail = $state<string | null>(null);

	let isStaticBuild = $state(true); // Start as true to prevent any API calls

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
					.then((response) => safeJsonParse<{ authenticated: boolean; email: string | null }>(response))
					.then(({ data, isHtml }) => {
						if (!isHtml && data) {
							isStaticBuild = false;
							isAuthenticated = data.authenticated || false;
							userEmail = data.email || null;
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
	<div class="studio-layout">
		{#if isAuthenticated && $page.url.pathname !== '/studio/login' && !isStaticBuild}
			<!-- Main Site Header (aligned with public site) -->
			<nav class="main-site-header">
				<div class="container">
					<a href="/" class="nav-logo" aria-label="QuantumCore Solutions">
						<Logo size={36} variant="full" showText={true} />
					</a>
					
					<div class="main-nav-links">
						<a href="/practice">Practice</a>
						<a href="/philosophy">Philosophy</a>
						<a href="/insights">Insights</a>
						<a href="/signals">Signals</a>
						<a href="/about">About</a>
					</div>
					
					<div class="main-nav-actions">
						<span class="studio-user-email">{userEmail}</span>
						<button class="studio-logout-btn" onclick={handleLogout}>Logout</button>
					</div>
				</div>
			</nav>

			<!-- Studio Sub-Navigation -->
			<nav class="studio-sub-nav">
				<div class="container">
					<div class="studio-nav-brand">
						<strong>QCS Studio</strong>
					</div>
					<div class="studio-nav-links">
						<a href="/studio" class:active={$page.url.pathname === '/studio' || $page.url.pathname.startsWith('/studio/edit')}>Content</a>
						<a href="/studio/media" class:active={$page.url.pathname === '/studio/media'}>Media</a>
						<a href="/studio/settings" class:active={$page.url.pathname === '/studio/settings'}>Settings</a>
					</div>
				</div>
			</nav>
		{/if}

		<main class="studio-main">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	.studio-layout {
		min-height: 100vh;
		background: linear-gradient(to bottom, var(--bg-primary) 0%, var(--bg-secondary) 100%);
		background-attachment: fixed;
		display: flex;
		flex-direction: column;
		padding-top: 0;
	}

	/* Main Site Header - Matches public site header */
	.main-site-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(255, 253, 247, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border-subtle);
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
	}

	.main-site-header .container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	@media (min-width: 768px) {
		.main-site-header .container {
			padding: 1rem 4rem;
		}
	}

	@media (min-width: 1024px) {
		.main-site-header .container {
			padding: 1rem 6rem;
		}
	}

	.nav-logo {
		display: flex;
		align-items: center;
		text-decoration: none;
		flex-shrink: 0;
	}

	.main-nav-links {
		display: flex;
		gap: 1.5rem;
		flex: 1;
		margin-left: 2rem;
	}

	.main-nav-links a {
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		position: relative;
		padding-bottom: 2px;
		border-bottom: none;
		transition: all 0.2s ease;
	}

	.main-nav-links a::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 2px;
		background: var(--highlight);
		transition: width 0.3s ease;
	}

	.main-nav-links a:hover::after {
		width: 100%;
	}

	.main-nav-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.studio-user-email {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.studio-logout-btn {
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--text-primary);
		transition: all 0.2s ease;
		font-weight: 500;
	}

	.studio-logout-btn:hover {
		background: var(--bg-accent);
		border-color: var(--highlight);
		transform: translateY(-1px);
	}

	/* Studio Sub-Navigation */
	.studio-sub-nav {
		position: fixed;
		top: 70px; /* Below main header */
		left: 0;
		right: 0;
		z-index: 999;
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border-subtle);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
	}

	.studio-sub-nav .container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.75rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	@media (min-width: 768px) {
		.studio-sub-nav .container {
			padding: 0.75rem 4rem;
		}
	}

	@media (min-width: 1024px) {
		.studio-sub-nav .container {
			padding: 0.75rem 6rem;
		}
	}

	.studio-nav-brand {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		flex-shrink: 0;
	}

	.studio-nav-links {
		display: flex;
		gap: 2rem;
		flex: 1;
		margin-left: 2rem;
	}

	.studio-nav-links a {
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.95rem;
		padding: 0.5rem 0;
		border-bottom: 2px solid transparent;
		transition: all 0.2s ease;
		position: relative;
	}

	.studio-nav-links a:hover,
	.studio-nav-links a.active {
		color: var(--text-primary);
		border-bottom-color: var(--highlight);
	}

	.studio-main {
		flex: 1;
		padding: 0;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		margin-top: 130px; /* Space for both headers */
		min-height: calc(100vh - 130px);
		background: transparent;
	}

	.studio-main :global(.studio-page),
	.studio-main :global(.editor-page),
	.studio-main :global(.new-content-page),
	.studio-main :global(.settings-page),
	.studio-main :global(.media-page) {
		padding: 0 2rem;
	}

	@media (min-width: 768px) {
		.studio-main :global(.studio-page),
		.studio-main :global(.editor-page),
		.studio-main :global(.new-content-page),
		.studio-main :global(.settings-page),
		.studio-main :global(.media-page) {
			padding: 0 4rem;
		}
	}

	@media (min-width: 1024px) {
		.studio-main :global(.studio-page),
		.studio-main :global(.editor-page),
		.studio-main :global(.new-content-page),
		.studio-main :global(.settings-page),
		.studio-main :global(.media-page) {
			padding: 0 6rem;
		}
	}

	@media (max-width: 768px) {
		.main-site-header .container,
		.studio-sub-nav .container {
			padding: 1rem 2rem;
		}

		.main-nav-links {
			display: none; /* Hide on mobile */
		}

		.studio-nav-links {
			margin-left: 0;
			gap: 1rem;
		}

		.studio-main {
			margin-top: 120px;
			padding: 1.5rem;
		}
	}
</style>

