import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateCredentials, createSession } from '$lib/studio/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ success: false, message: 'Email and password required' }, { status: 400 });
		}

		if (validateCredentials(email, password)) {
			const session = createSession(email);
			cookies.set('studio_session', JSON.stringify(session), {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 // 24 hours
			});

			return json({ success: true, email });
		}

		return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
	} catch (error) {
		return json({ success: false, message: 'Server error' }, { status: 500 });
	}
};

