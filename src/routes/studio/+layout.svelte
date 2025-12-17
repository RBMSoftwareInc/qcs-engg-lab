<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { children } = $props();
	let isAuthenticated = $state(false);
	let userEmail = $state<string | null>(null);

	onMount(async () => {
		// Check authentication status
		try {
			const response = await fetch('/studio/api/auth/check');
			const data = await response.json();
			isAuthenticated = data.authenticated || false;
			userEmail = data.email || null;

			// Redirect to login if not authenticated and not on login page
			if (!isAuthenticated && $page.url.pathname !== '/studio/login') {
				goto('/studio/login');
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			if ($page.url.pathname !== '/studio/login') {
				goto('/studio/login');
			}
		}
	});

	function handleLogout() {
		fetch('/studio/api/auth/logout', { method: 'POST' })
			.then(() => {
				isAuthenticated = false;
				goto('/studio/login');
			});
	}
</script>

{#if isAuthenticated || $page.url.pathname === '/studio/login'}
	<div class="studio-layout">
		{#if isAuthenticated && $page.url.pathname !== '/studio/login'}
			<nav class="studio-nav">
				<div class="nav-brand">
					<a href="/studio">
						<strong>QCS Studio</strong>
					</a>
				</div>
				<div class="nav-links">
					<a href="/studio" class:active={$page.url.pathname === '/studio'}>Content</a>
					<a href="/studio/media" class:active={$page.url.pathname === '/studio/media'}>Media</a>
					<a href="/studio/settings" class:active={$page.url.pathname === '/studio/settings'}>Settings</a>
				</div>
				<div class="nav-user">
					<span class="user-email">{userEmail}</span>
					<button class="logout-btn" onclick={handleLogout}>Logout</button>
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
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
	}

	.studio-nav {
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border-subtle);
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
		background: rgba(255, 253, 247, 0.95);
	}

	.nav-brand {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.nav-brand a {
		color: var(--text-primary);
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		flex: 1;
		margin-left: 3rem;
	}

	.nav-links a {
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		padding: 0.5rem 0;
		border-bottom: 2px solid transparent;
		transition: all 0.2s ease;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--text-primary);
		border-bottom-color: var(--highlight);
	}

	.nav-user {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-email {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.logout-btn {
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--text-primary);
		transition: all 0.2s ease;
	}

	.logout-btn:hover {
		background: var(--bg-accent);
		border-color: var(--highlight);
	}

	.studio-main {
		flex: 1;
		padding: 2rem;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
	}
</style>

