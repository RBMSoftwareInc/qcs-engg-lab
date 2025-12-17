<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await fetch('/studio/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (data.success) {
				goto('/studio');
			} else {
				error = data.message || 'Authentication failed';
			}
		} catch (err) {
			error = 'Failed to connect to server';
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
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
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
</style>

