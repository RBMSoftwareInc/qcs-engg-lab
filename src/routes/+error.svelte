<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$lib/components/Logo.svelte';

	const status = $derived($page.status ?? 500);
	const message = $derived(
		$page.error && typeof $page.error === 'object' && 'message' in $page.error
			? String(($page.error as { message: string }).message)
			: status === 404
				? 'This page could not be found.'
				: 'Something went wrong.'
	);
	const is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{is404 ? 'Page not found' : 'Error'} | QuantumCore Solutions</title>
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<a href="/" class="error-logo" aria-label="QuantumCore Solutions home">
			<Logo size={48} variant="full" showText={true} />
		</a>
		<p class="error-status" aria-hidden="true">{status}</p>
		<h1 class="error-title">
			{is404 ? 'Page not found' : 'Something went wrong'}
		</h1>
		<p class="error-message">{message}</p>
		<a href="/" class="error-link">Return home</a>
	</div>
</div>

<style>
	.error-page {
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
	}

	.error-content {
		max-width: 420px;
	}

	.error-logo {
		display: inline-flex;
		margin-bottom: 2rem;
		text-decoration: none;
	}

	.error-status {
		font-size: 4rem;
		font-weight: 700;
		line-height: 1;
		color: var(--border-subtle);
		margin-bottom: 0.5rem;
	}

	.error-title {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.75rem;
	}

	.error-message {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.error-link {
		display: inline-block;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-primary);
		border-bottom: 2px solid var(--highlight);
		padding-bottom: 2px;
		text-decoration: none;
		transition: border-color 0.2s ease, opacity 0.2s ease;
	}

	.error-link:hover {
		border-bottom-color: var(--text-primary);
		opacity: 0.9;
	}
</style>
