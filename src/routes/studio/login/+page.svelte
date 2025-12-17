<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { safeJsonParse, checkApiAvailable } from '$lib/studio/api-utils';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let isStaticBuild = $state(false);

	onMount(async () => {
		// Check if we're in a static build
		const apiAvailable = await checkApiAvailable();
		if (!apiAvailable) {
			isStaticBuild = true;
		}
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		
		if (isStaticBuild) {
			error = 'Studio requires server-side deployment. See notice below.';
			return;
		}
		
		error = '';
		loading = true;

		try {
			const response = await fetch('/studio/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const { data, isHtml } = await safeJsonParse<{ success: boolean; message?: string }>(response);
			
			if (isHtml || !data) {
				error = 'Studio API not available. Studio requires server-side deployment (Node.js).';
				loading = false;
				return;
			}

			if (data.success) {
				goto('/studio');
			} else {
				error = data.message || 'Authentication failed';
			}
		} catch (err) {
			// Check if it's a JSON parse error (HTML response)
			if (err instanceof SyntaxError) {
				error = 'Studio API not available. Studio requires server-side deployment (Node.js/VPS).';
			} else {
				error = 'Failed to connect to server';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login | QCS Studio</title>
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="login-header">
			<h1>QCS Studio</h1>
			<p class="login-subtitle">Content Management</p>
		</div>

		<form onsubmit={handleLogin} class="login-form">
			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					autocomplete="email"
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					autocomplete="current-password"
					disabled={loading}
				/>
			</div>

			<button type="submit" class="login-button" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
		</form>

		<div class="login-footer">
			<a href="/">← Back to Site</a>
		</div>

		{#if isStaticBuild}
			<div class="deployment-notice">
				<p class="notice-title">⚠️ Studio Not Available on Static Hosting</p>
				<p class="notice-text">
					QCS Studio requires server-side capabilities (Node.js) to function. 
					It cannot run on static hosting like Hostinger shared hosting.
				</p>
				<p class="notice-text">
					<strong>Solutions:</strong>
				</p>
				<ul class="notice-list">
					<li><strong>Hostinger VPS:</strong> Upgrade to VPS hosting (supports Node.js)</li>
					<li><strong>Separate Backend:</strong> Deploy Studio API to Vercel/Railway/Render</li>
					<li><strong>Local Development:</strong> Run Studio locally, deploy static site only</li>
				</ul>
				<p class="notice-text" style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
					The public website works perfectly on static hosting. Only Studio requires server-side capabilities.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom, var(--bg-primary) 0%, var(--bg-secondary) 100%);
		background-attachment: fixed;
		padding: 2rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 12px;
		padding: 3rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.login-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.login-header h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.login-subtitle {
		color: var(--text-secondary);
		font-size: 0.95rem;
		margin: 0;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.form-group input {
		padding: 0.75rem;
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--highlight);
	}

	.form-group input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		color: #dc2626;
		font-size: 0.9rem;
	}

	.login-button {
		padding: 0.875rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 0.5rem;
	}

	.login-button:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.login-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login-footer {
		margin-top: 2rem;
		text-align: center;
		padding-top: 2rem;
		border-top: 1px solid var(--border-subtle);
	}

	.login-footer a {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s ease;
	}

	.login-footer a:hover {
		color: var(--text-primary);
	}

	.deployment-notice {
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(244, 196, 48, 0.1);
		border: 1px solid rgba(244, 196, 48, 0.3);
		border-radius: 8px;
	}

	.notice-title {
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.75rem;
		font-size: 0.95rem;
	}

	.notice-text {
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 0.5rem;
	}

	.notice-list {
		margin-top: 0.75rem;
		margin-left: 1.5rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.8;
	}

	.notice-list li {
		margin-bottom: 0.25rem;
	}
</style>

