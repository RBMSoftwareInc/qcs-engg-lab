import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const sessionCookie = cookies.get('studio_session');
	
	if (sessionCookie) {
		try {
			const session = JSON.parse(sessionCookie);
			const now = Date.now();
			
			if (session.authenticated && session.expiresAt > now) {
				return {
					authenticated: true,
					email: session.email
				};
			}
		} catch (e) {
			// Invalid session
		}
	}

	return {
		authenticated: false,
		email: null
	};
};

