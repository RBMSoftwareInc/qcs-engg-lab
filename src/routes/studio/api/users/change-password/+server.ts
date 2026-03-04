import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, validateSession, createOrUpdateUser, loadUsersConfig } from '$lib/studio/auth';

/** POST: change password for current user or for target user (admin only). Body: { email?, currentPassword?, newPassword } */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!validateSession(session)) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}
	try {
		const body = await request.json();
		const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
		if (!newPassword || newPassword.length < 8) {
			return json({ success: false, message: 'New password must be at least 8 characters' }, { status: 400 });
		}
		const targetEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null;
		const isAdmin = session.role === 'admin';
		if (targetEmail && targetEmail !== session.email) {
			if (!isAdmin) return json({ success: false, message: 'Forbidden' }, { status: 403 });
			const config = loadUsersConfig();
			if (!config) return json({ success: false, message: 'No users config' }, { status: 400 });
			const user = config.users.find((u) => u.email.toLowerCase() === targetEmail);
			if (!user) return json({ success: false, message: 'User not found' }, { status: 404 });
			const result = createOrUpdateUser(targetEmail, newPassword, user.role);
			return json(result);
		}
		const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
		if (!currentPassword) return json({ success: false, message: 'Current password required to change your own' }, { status: 400 });
		const { validateCredentials } = await import('$lib/studio/auth');
		if (!validateCredentials(session.email, currentPassword)) {
			return json({ success: false, message: 'Current password is incorrect' }, { status: 401 });
		}
		const result = createOrUpdateUser(session.email, newPassword, session.role);
		return json(result);
	} catch {
		return json({ success: false, message: 'Server error' }, { status: 500 });
	}
};
