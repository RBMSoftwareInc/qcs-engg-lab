<script lang="ts">
	import { onMount } from 'svelte';
	import { safeJsonParse } from '$lib/studio/api-utils';

	let currentEmail = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/studio/api/auth/check');
			const { data } = await safeJsonParse<{ email?: string }>(res);
			currentEmail = data?.email ?? '';
		} finally {
			loading = false;
		}
	});

	async function changeMyPassword(e: Event) {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			error = 'New password and confirmation do not match.';
			return;
		}
		if (newPassword.length < 8) {
			error = 'New password must be at least 8 characters.';
			return;
		}
		saving = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/users/change-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentPassword,
					newPassword
				})
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Password updated. Use your new password next time you log in.';
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
				if (typeof window !== 'undefined' && window.self !== window.top) {
					window.parent.postMessage({ type: 'studio-form-result', success: true, message: success }, '*');
				}
			} else {
				error = data?.message ?? 'Failed to update password';
				if (typeof window !== 'undefined' && window.self !== window.top) {
					window.parent.postMessage({ type: 'studio-form-result', success: false, message: error }, '*');
				}
			}
		} catch {
			error = 'Request failed';
			if (typeof window !== 'undefined' && window.self !== window.top) {
				window.parent.postMessage({ type: 'studio-form-result', success: false, message: error }, '*');
			}
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Credentials | QCS Studio</title>
</svelte:head>

<div class="settings-page">
	<div class="page-header">
		<h1>Credentials</h1>
		<p class="page-description">Change your login password. User management is in Users &amp; access (admin only).</p>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}
	{#if success}
		<div class="alert alert-success">{success}</div>
	{/if}

	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="settings-section">
			<h2>Change password</h2>
			<p class="signed-in-as">Signed in as <strong>{currentEmail}</strong></p>
			<form onsubmit={changeMyPassword} class="user-form">
				<div class="form-row">
					<label for="current">Current password</label>
					<input id="current" type="password" bind:value={currentPassword} required placeholder="Current password" />
				</div>
				<div class="form-row">
					<label for="new">New password</label>
					<input id="new" type="password" bind:value={newPassword} required minlength="8" placeholder="Min 8 characters" />
				</div>
				<div class="form-row">
					<label for="confirm">Confirm new password</label>
					<input id="confirm" type="password" bind:value={confirmPassword} required minlength="8" placeholder="Repeat new password" />
				</div>
				<button type="submit" class="btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update password'}</button>
			</form>
		</div>

		<div class="settings-section">
			<h2>Where credentials are stored</h2>
			<p>When using <strong>Users &amp; access</strong>, credentials are stored in <code>config/studio-users.json</code> (passwords are hashed). Only admins can add or remove users. Set <code>STUDIO_PASSWORD_SALT</code> in your server environment for production.</p>
			<a href="/studio/settings/users" class="settings-link">Users &amp; access →</a>
		</div>
	{/if}
</div>

<style>
	.settings-page { max-width: 900px; }
	.page-header { padding: 2rem 0; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); }
	.page-header h1 { font-size: 1.75rem; margin: 0 0 0.5rem 0; }
	.page-description { font-size: 0.95rem; color: var(--text-secondary); margin: 0; }
	.settings-section { margin-bottom: 2rem; }
	.settings-section h2 { font-size: 1.15rem; margin-bottom: 1rem; }
	.signed-in-as { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1rem; }
	.user-form { max-width: 400px; display: flex; flex-direction: column; gap: 1rem; }
	.form-row { display: flex; flex-direction: column; gap: 0.35rem; }
	.form-row label { font-size: 0.9rem; font-weight: 500; }
	.form-row input { padding: 0.5rem 0.75rem; border: 1px solid var(--border-subtle); border-radius: 6px; }
	.btn-primary { padding: 0.6rem 1.25rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
	.settings-link { display: inline-block; margin-top: 0.5rem; color: var(--text-primary); font-weight: 500; border-bottom: 1px solid var(--highlight); }
	.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
	.alert-error { background: #fef2f2; color: #b91c1c; }
	.alert-success { background: #f0fdf4; color: #166534; }
</style>
