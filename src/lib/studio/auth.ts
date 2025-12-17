/**
 * QCS Studio Authentication
 * Simple server-side authentication using environment variables
 */

export interface AuthSession {
	email: string;
	authenticated: boolean;
	expiresAt: number;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function validateCredentials(email: string, password: string): boolean {
	const validEmail = import.meta.env.VITE_STUDIO_EMAIL || process.env.VITE_STUDIO_EMAIL;
	const validPassword = import.meta.env.VITE_STUDIO_PASSWORD || process.env.VITE_STUDIO_PASSWORD;

	if (!validEmail || !validPassword) {
		console.warn('Studio credentials not configured in environment variables');
		return false;
	}

	return email === validEmail && password === validPassword;
}

export function createSession(email: string): AuthSession {
	return {
		email,
		authenticated: true,
		expiresAt: Date.now() + SESSION_DURATION
	};
}

export function validateSession(session: AuthSession | null): boolean {
	if (!session) return false;
	if (!session.authenticated) return false;
	if (Date.now() > session.expiresAt) return false;
	return true;
}

