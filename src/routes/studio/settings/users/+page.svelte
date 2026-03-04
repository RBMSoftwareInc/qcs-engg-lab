<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { safeJsonParse } from '$lib/studio/api-utils';

	type UserRow = { email: string; role: string };

	let users = $state<UserRow[]>([]);
	let configExists = $state(false);
	let loading = $state(true);
	let error = $state('');
	let success = $state('');
	let isAdmin = $state(false);
	let currentEmail = $state('');

	let addEmail = $state('');
	let addPassword = $state('');
	let addRole = $state<'admin' | 'editor' | 'viewer'>('editor');
	let adding = $state(false);

	let changePasswordFor = $state<string | null>(null);
	let changePasswordNew = $state('');
	let changePasswordCurrent = $state('');
	let changingPassword = $state(false);

	function notifyParent(msg: string, isSuccess: boolean) {
		if (typeof window !== 'undefined' && window.self !== window.top) {
			window.parent.postMessage({ type: 'studio-form-result', success: isSuccess, message: msg }, '*');
		}
	}

	onMount(async () => {
		await loadUsers();
	});

	async function loadUsers() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/studio/api/users');
			const { data, isHtml } = await safeJsonParse<{ users?: UserRow[]; configExists?: boolean; error?: string }>(res);
			if (isHtml || !data) {
				loading = false;
				return;
			}
			if (data.error) {
				error = data.error;
				isAdmin = false;
				users = [];
			} else {
				users = data.users ?? [];
				configExists = data.configExists ?? false;
				isAdmin = true;
			}
			const checkRes = await fetch('/studio/api/auth/check');
			const { data: checkData } = await safeJsonParse<{ email?: string }>(checkRes);
			currentEmail = checkData?.email ?? '';
		} catch {
			error = 'Failed to load users';
		} finally {
			loading = false;
		}
	}

	async function bootstrapFirstAdmin(e: Event) {
		e.preventDefault();
		adding = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: addEmail, password: addPassword, role: 'admin' })
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'First admin created. Please log in with these credentials.';
				notifyParent(success, true);
				setTimeout(() => goto('/studio/login'), 1500);
			} else {
				error = data?.message ?? 'Failed to create admin';
				notifyParent(error, false);
			}
		} catch {
			error = 'Request failed';
			notifyParent(error, false);
		} finally {
			adding = false;
		}
	}

	async function addUser(e: Event) {
		e.preventDefault();
		adding = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/studio/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: addEmail, password: addPassword, role: addRole })
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'User saved.';
				notifyParent(success, true);
				addEmail = '';
				addPassword = '';
				await loadUsers();
			} else {
				error = data?.message ?? 'Failed to save user';
				notifyParent(error, false);
			}
		} catch {
			error = 'Request failed';
			notifyParent(error, false);
		} finally {
			adding = false;
		}
	}

	async function deleteUser(email: string) {
		if (!confirm(`Remove user ${email}?`)) return;
		error = '';
		success = '';
		try {
			const res = await fetch(`/studio/api/users?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'User removed.';
				notifyParent(success, true);
				await loadUsers();
			} else {
				error = data?.message ?? 'Failed to remove user';
				notifyParent(error, false);
			}
		} catch {
			error = 'Request failed';
			notifyParent(error, false);
		}
	}

	async function submitChangePassword() {
		if (!changePasswordFor) return;
		changingPassword = true;
		error = '';
		success = '';
		try {
			const body: { newPassword: string; email?: string; currentPassword?: string } = { newPassword: changePasswordNew };
			if (changePasswordFor !== currentEmail) body.email = changePasswordFor;
			else body.currentPassword = changePasswordCurrent;
			const res = await fetch('/studio/api/users/change-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const { data, isHtml } = await safeJsonParse<{ success?: boolean; message?: string }>(res);
			if (!isHtml && data?.success) {
				success = 'Password updated.';
				notifyParent(success, true);
				changePasswordFor = null;
				changePasswordNew = '';
				changePasswordCurrent = '';
			} else {
				error = data?.message ?? 'Failed to update password';
				notifyParent(error, false);
			}
		} catch {
			error = 'Request failed';
			notifyParent(error, false);
		} finally {
			changingPassword = false;
		}
	}

	function openChangePassword(email: string) {
		changePasswordFor = email;
		changePasswordNew = '';
		error = '';
	}
</script>

<svelte:head>
	<title>Users &amp; Access | QCS Studio</title>
</svelte:head>

<div class="settings-page">
	<div class="page-header">
		<h1>Users &amp; access</h1>
		<p class="page-description">Manage Studio users and roles. Only admins can add or remove users.</p>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}
	{#if success}
		<div class="alert alert-success">{success}</div>
	{/if}

	{#if loading}
		<p>Loading...</p>
	{:else if !configExists}
		<div class="settings-section">
			<h2>Create first admin</h2>
			<p>No user config found. Create the first admin user. Credentials are stored in <code>config/studio-users.json</code> (passwords are hashed).</p>
			<form onsubmit={bootstrapFirstAdmin} class="user-form">
				<div class="form-row">
					<label for="bootstrap-email">Email</label>
					<input id="bootstrap-email" type="email" bind:value={addEmail} required placeholder="admin@example.com" />
				</div>
				<div class="form-row">
					<label for="bootstrap-password">Password</label>
					<input id="bootstrap-password" type="password" bind:value={addPassword} required minlength="8" placeholder="Min 8 characters" />
				</div>
				<button type="submit" class="btn-primary" disabled={adding}>{adding ? 'Creating...' : 'Create admin & log in'}</button>
			</form>
		</div>
	{:else if !isAdmin}
		<div class="settings-section">
			<p class="forbidden">You need admin rights to manage users.</p>
		</div>
	{:else}
		<div class="settings-section">
			<h2>Users</h2>
			<table class="users-table">
				<thead>
					<tr>
						<th>Email</th>
						<th>Role</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
						<tr>
							<td>{user.email}</td>
							<td><span class="role-badge" class:admin={user.role === 'admin'}>{user.role}</span></td>
							<td class="actions">
								<button type="button" class="btn-sm" onclick={() => openChangePassword(user.email)}>Change password</button>
								{#if user.email !== currentEmail}
									<button type="button" class="btn-sm btn-danger" onclick={() => deleteUser(user.email)}>Remove</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="settings-section">
			<h2>Add user</h2>
			<form onsubmit={addUser} class="user-form">
				<div class="form-row">
					<label for="add-email">Email</label>
					<input id="add-email" type="email" bind:value={addEmail} required placeholder="user@example.com" />
				</div>
				<div class="form-row">
					<label for="add-password">Password</label>
					<input id="add-password" type="password" bind:value={addPassword} required minlength="8" placeholder="Min 8 characters" />
				</div>
				<div class="form-row">
					<label for="add-role">Role</label>
					<select id="add-role" bind:value={addRole}>
						<option value="viewer">Viewer</option>
						<option value="editor">Editor</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<button type="submit" class="btn-primary" disabled={adding}>{adding ? 'Saving...' : 'Add user'}</button>
			</form>
		</div>

		{#if changePasswordFor}
			<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Change password">
				<div class="modal">
					<h3>Change password {changePasswordFor !== currentEmail ? `for ${changePasswordFor}` : ''}</h3>
					{#if changePasswordFor === currentEmail}
						<p class="hint">Enter your current password and a new password.</p>
						<form onsubmit={(e) => { e.preventDefault(); submitChangePassword(); }}>
							<div class="form-row">
								<label for="current-pw">Current password</label>
								<input id="current-pw" type="password" bind:value={changePasswordCurrent} placeholder="Current password" />
							</div>
							<div class="form-row">
								<label for="new-pw">New password</label>
								<input id="new-pw" type="password" bind:value={changePasswordNew} minlength="8" placeholder="Min 8 characters" />
							</div>
							<div class="modal-actions">
								<button type="button" class="btn-secondary" onclick={() => { changePasswordFor = null; changePasswordCurrent = ''; }}>Cancel</button>
								<button type="submit" class="btn-primary" disabled={changingPassword}>Update</button>
							</div>
						</form>
					{:else}
						<div class="form-row">
							<label for="new-pw-other">New password</label>
							<input id="new-pw-other" type="password" bind:value={changePasswordNew} minlength="8" placeholder="Min 8 characters" />
						</div>
						<div class="modal-actions">
							<button type="button" class="btn-secondary" onclick={() => { changePasswordFor = null; }}>Cancel</button>
							<button type="button" class="btn-primary" disabled={changingPassword} onclick={submitChangePassword}>Update</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.settings-page { max-width: 900px; }
	.page-header { padding: 2rem 0; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); }
	.page-header h1 { font-size: 1.75rem; margin: 0 0 0.5rem 0; }
	.page-description { font-size: 0.95rem; color: var(--text-secondary); margin: 0; }
	.settings-section { margin-bottom: 2rem; }
	.settings-section h2 { font-size: 1.15rem; margin-bottom: 1rem; }
	.user-form { max-width: 400px; display: flex; flex-direction: column; gap: 1rem; }
	.form-row { display: flex; flex-direction: column; gap: 0.35rem; }
	.form-row label { font-size: 0.9rem; font-weight: 500; }
	.form-row input, .form-row select { padding: 0.5rem 0.75rem; border: 1px solid var(--border-subtle); border-radius: 6px; }
	.btn-primary { padding: 0.6rem 1.25rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
	.btn-secondary { padding: 0.6rem 1.25rem; background: transparent; border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer; }
	.users-table { width: 100%; border-collapse: collapse; }
	.users-table th, .users-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-subtle); }
	.users-table th { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
	.role-badge { font-size: 0.8rem; padding: 0.25rem 0.5rem; border-radius: 4px; background: var(--bg-secondary); }
	.role-badge.admin { background: color-mix(in srgb, var(--highlight) 30%, transparent); }
	.actions { display: flex; gap: 0.5rem; }
	.btn-sm { padding: 0.35rem 0.6rem; font-size: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 4px; background: transparent; cursor: pointer; }
	.btn-danger { color: #b91c1c; border-color: #fecaca; }
	.forbidden { color: var(--text-muted); }
	.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
	.alert-error { background: #fef2f2; color: #b91c1c; }
	.alert-success { background: #f0fdf4; color: #166534; }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 2000; }
	.modal { background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; max-width: 400px; width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
	.modal h3 { margin: 0 0 1rem 0; font-size: 1.1rem; }
	.modal .hint { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem; }
	.modal-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
</style>
