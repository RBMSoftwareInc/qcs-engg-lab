/**
 * QCS Studio Authentication
 * Supports: (1) config/studio-users.json with hashed passwords and roles,
 *           (2) fallback to single user from env (VITE_STUDIO_EMAIL / VITE_STUDIO_PASSWORD) as admin.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { scryptSync, timingSafeEqual } from 'crypto';

export type StudioRole = 'admin' | 'editor' | 'viewer';

export interface StudioUser {
	email: string;
	passwordHash: string;
	role: StudioRole;
}

export interface UsersConfig {
	users: StudioUser[];
}

export interface AuthSession {
	email: string;
	authenticated: boolean;
	expiresAt: number;
	role: StudioRole;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const USERS_CONFIG_PATH = join(process.cwd(), 'config', 'studio-users.json');
const SALT_ENV = 'STUDIO_PASSWORD_SALT';
const DEFAULT_DEV_SALT = 'qcs-studio-dev-salt-change-in-production';

function getSalt(): string {
	return process.env[SALT_ENV] || DEFAULT_DEV_SALT;
}

function hashPassword(password: string): string {
	const salt = getSalt();
	return scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
	const hash = hashPassword(password);
	if (hash.length !== storedHash.length) return false;
	return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

export function loadUsersConfig(): UsersConfig | null {
	try {
		if (!existsSync(USERS_CONFIG_PATH)) return null;
		const raw = readFileSync(USERS_CONFIG_PATH, 'utf-8');
		const data = JSON.parse(raw) as unknown;
		if (!data || typeof data !== 'object' || !Array.isArray((data as UsersConfig).users)) return null;
		return data as UsersConfig;
	} catch {
		return null;
	}
}

function saveUsersConfig(config: UsersConfig): void {
	writeFileSync(USERS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function getRoleForEmail(email: string): StudioRole | null {
	const config = loadUsersConfig();
	if (config) {
		const user = config.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
		return user ? user.role : null;
	}
	const envEmail = process.env.VITE_STUDIO_EMAIL;
	if (envEmail && envEmail.toLowerCase() === email.toLowerCase()) return 'admin';
	return null;
}

export function validateCredentials(email: string, password: string): boolean {
	const config = loadUsersConfig();
	if (config) {
		const user = config.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
		if (!user) return false;
		return verifyPassword(password, user.passwordHash);
	}
	const validEmail = process.env.VITE_STUDIO_EMAIL || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STUDIO_EMAIL);
	const validPassword = process.env.VITE_STUDIO_PASSWORD || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STUDIO_PASSWORD);
	if (!validEmail || !validPassword) {
		console.warn('Studio: no users config and env credentials not set');
		return false;
	}
	return email === validEmail && password === validPassword;
}

export function createSession(email: string, role: StudioRole = 'admin'): AuthSession {
	return {
		email,
		authenticated: true,
		expiresAt: Date.now() + SESSION_DURATION,
		role
	};
}

export function validateSession(session: AuthSession | null): boolean {
	if (!session) return false;
	if (!session.authenticated) return false;
	if (Date.now() > session.expiresAt) return false;
	return true;
}

export function requireAdmin(session: AuthSession | null): boolean {
	return validateSession(session) && session.role === 'admin';
}

/** Admin or editor can write content/media; viewer is read-only. */
export function requireEditor(session: AuthSession | null): boolean {
	return validateSession(session) && (session.role === 'admin' || session.role === 'editor');
}

/** Create or update users config. Ensures at least one admin. */
export function createOrUpdateUser(email: string, password: string, role: StudioRole): { success: boolean; message?: string } {
	let config = loadUsersConfig();
	if (!config) {
		config = { users: [] };
	}
	const lower = email.toLowerCase().trim();
	const existing = config.users.findIndex((u) => u.email.toLowerCase() === lower);
	const newHash = hashPassword(password);
	if (existing >= 0) {
		config.users[existing] = { email: lower, passwordHash: newHash, role };
	} else {
		config.users.push({ email: lower, passwordHash: newHash, role });
	}
	const adminCount = config.users.filter((u) => u.role === 'admin').length;
	if (adminCount === 0) return { success: false, message: 'At least one admin user is required' };
	saveUsersConfig(config);
	return { success: true };
}

export function deleteUser(email: string, currentUserEmail: string): { success: boolean; message?: string } {
	if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
		return { success: false, message: 'You cannot delete your own account' };
	}
	const config = loadUsersConfig();
	if (!config) return { success: false, message: 'No users config' };
	const before = config.users.length;
	config.users = config.users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
	if (config.users.length === before) return { success: false, message: 'User not found' };
	const adminCount = config.users.filter((u) => u.role === 'admin').length;
	if (adminCount === 0) return { success: false, message: 'Cannot remove the last admin' };
	saveUsersConfig(config);
	return { success: true };
}

export function listUsersSafe(): { email: string; role: StudioRole }[] {
	const config = loadUsersConfig();
	if (!config) return [];
	return config.users.map((u) => ({ email: u.email, role: u.role }));
}

/** Parse session from cookie string. Use in API routes. */
export function parseSession(cookieValue: string | undefined): AuthSession | null {
	if (!cookieValue) return null;
	try {
		const session = JSON.parse(cookieValue) as AuthSession;
		return validateSession(session) ? session : null;
	} catch {
		return null;
	}
}
