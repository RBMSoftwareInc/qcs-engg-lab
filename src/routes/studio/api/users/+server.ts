import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	parseSession,
	requireAdmin,
	listUsersSafe,
	createOrUpdateUser,
	deleteUser,
	loadUsersConfig
} from '$lib/studio/auth';
import type { StudioRole } from '$lib/studio/auth';

function getSession(cookies: { get: (name: string) => string | undefined }) {
	return parseSession(cookies.get('studio_session'));
}

/** GET: list users (admin only). Returns { users: { email, role }[], configExists: boolean } */
export const GET: RequestHandler = async ({ cookies }) => {
	const session = getSession(cookies);
	if (!requireAdmin(session)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}
	const users = listUsersSafe();
	const configExists = loadUsersConfig() !== null;
	return json({ users, configExists });
};

/** POST: create or update user. Admin required, except when no config exists (bootstrap first admin). Body: { email, password, role } */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = getSession(cookies);
	const configExists = loadUsersConfig() !== null;
	const allowBootstrap = !configExists; // first-time: allow creating first admin without session
	if (!allowBootstrap && !requireAdmin(session)) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}
	try {
		const body = await request.json();
		const email = typeof body.email === 'string' ? body.email.trim() : '';
		const password = typeof body.password === 'string' ? body.password : '';
		const role = ['admin', 'editor', 'viewer'].includes(body.role) ? (body.role as StudioRole) : (allowBootstrap ? 'admin' : 'editor');
		if (!email) return json({ success: false, message: 'Email required' }, { status: 400 });
		if (!password) return json({ success: false, message: 'Password required' }, { status: 400 });
		if (allowBootstrap && role !== 'admin') {
			return json({ success: false, message: 'First user must be admin' }, { status: 400 });
		}
		const result = createOrUpdateUser(email, password, role);
		return json(result);
	} catch {
		return json({ success: false, message: 'Server error' }, { status: 500 });
	}
};

/** DELETE: remove user (admin only). Query: email= */
export const DELETE: RequestHandler = async ({ url, cookies }) => {
	const session = getSession(cookies);
	if (!requireAdmin(session)) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}
	const email = url.searchParams.get('email')?.trim();
	if (!email) return json({ success: false, message: 'Email required' }, { status: 400 });
	const result = deleteUser(email, session!.email);
	return json(result);
};
