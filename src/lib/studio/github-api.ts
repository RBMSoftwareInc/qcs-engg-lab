/**
 * GitHub REST API Service Layer
 * Server-side only - handles all GitHub operations via REST API
 * 
 * This replaces local Git commands with GitHub API calls.
 * All tokens must be stored server-side and never exposed to browser.
 */

import { checkRateLimit } from './rate-limiter';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually if variables aren't in process.env
// SvelteKit/Vite only auto-loads VITE_ prefixed variables
function loadEnvFile(): void {
	if (typeof process === 'undefined' || !process.env) return;
	
	// Check if variables are already loaded
	if (process.env.GITHUB_TOKEN) return;
	
	try {
		const envPath = resolve(process.cwd(), '.env');
		const envContent = readFileSync(envPath, 'utf-8');
		
		// Parse .env file manually
		envContent.split('\n').forEach(line => {
			line = line.trim();
			if (!line || line.startsWith('#')) return;
			
			const match = line.match(/^([^=]+)=(.*)$/);
			if (match) {
				const key = match[1].trim();
				let value = match[2].trim();
				
				// Remove quotes if present
				if ((value.startsWith('"') && value.endsWith('"')) || 
				    (value.startsWith("'") && value.endsWith("'"))) {
					value = value.slice(1, -1);
				}
				
				// Only set if not already in process.env
				if (!process.env[key]) {
					process.env[key] = value;
				}
			}
		});
	} catch (error) {
		// .env file might not exist or be unreadable
		// That's okay - variables might be set via system environment
	}
}

// Load env file on module import
if (typeof process !== 'undefined') {
	loadEnvFile();
}

export interface GitHubFile {
	path: string;
	mode: string;
	type: string;
	sha: string;
	size: number;
	url: string;
	content?: string; // Base64 encoded
	encoding?: string;
}

export interface GitHubCommit {
	sha: string;
	message: string;
	author: {
		name: string;
		email: string;
		date: string;
	};
}

export interface GitHubApiResult<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

/**
 * Get GitHub API configuration from environment
 * In SvelteKit, server-side code uses process.env
 * Note: .env file must be in project root and dev server must be restarted after changes
 */
function getGitHubConfig(): {
	token: string;
	owner: string;
	repo: string;
	branch: string;
} {
	// In SvelteKit server-side code, use process.env directly
	// Variables from .env are automatically loaded by Vite/SvelteKit
	const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
	const owner = process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER;
	const repo = process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO;
	const branch = process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH || 'main';

	if (!token || !owner || !repo) {
		// Debug: Log what we found (but don't expose sensitive values)
		const hasToken = !!(process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN);
		const hasOwner = !!(process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER);
		const hasRepo = !!(process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO);
		
		// List all GITHUB-related env vars for debugging
		const githubEnvVars = typeof process !== 'undefined' && process.env
			? Object.keys(process.env)
				.filter(k => k.toUpperCase().includes('GITHUB'))
				.map(k => `${k}=${k.includes('TOKEN') ? '***' : process.env[k]?.substring(0, 20) + '...'}`)
			: [];
		
		const errorMsg = [
			'GitHub configuration missing. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.',
			'',
			'Debug info:',
			`  Token found: ${hasToken ? 'yes' : 'no'}`,
			`  Owner found: ${hasOwner ? 'yes' : 'no'}`,
			`  Repo found: ${hasRepo ? 'yes' : 'no'}`,
			`  GitHub env vars: ${githubEnvVars.length > 0 ? githubEnvVars.join(', ') : 'none found'}`,
			'',
			'Make sure:',
			'  1. .env file exists in project root',
			'  2. Variables are set: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO',
			'  3. Dev server was restarted after adding .env variables',
			'  4. Variables are not prefixed with VITE_ (they should be: GITHUB_TOKEN, not VITE_GITHUB_TOKEN)'
		].join('\n');
		
		throw new Error(errorMsg);
	}

	return { token, owner, repo, branch };
}

/**
 * Make authenticated GitHub API request
 */
async function githubRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<GitHubApiResult<T>> {
	// Check rate limit (client-side protection)
	const rateLimit = checkRateLimit('github');
	if (!rateLimit.allowed) {
		const resetTime = rateLimit.resetAt ? new Date(rateLimit.resetAt).toISOString() : 'unknown';
		return {
			success: false,
			error: `Application rate limit reached (4,000 requests/hour). Resets at ${resetTime}. GitHub allows 5,000 requests/hour with authenticated tokens.`
		};
	}

	try {
		const config = getGitHubConfig();
		const url = `https://api.github.com/repos/${config.owner}/${config.repo}${endpoint}`;

		const response = await fetch(url, {
			...options,
			headers: {
				'Authorization': `Bearer ${config.token}`,
				'Accept': 'application/vnd.github.v3+json',
				'User-Agent': 'QCS-Studio',
				'Content-Type': 'application/json',
				...options.headers
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
			
			try {
				const errorJson = JSON.parse(errorText);
				errorMessage = errorJson.message || errorMessage;
			} catch {
				errorMessage = errorText || errorMessage;
			}

			// Handle GitHub's actual rate limiting
			const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
			const rateLimitReset = response.headers.get('x-ratelimit-reset');
			
			if (response.status === 403 && rateLimitRemaining === '0') {
				const resetTime = rateLimitReset 
					? new Date(parseInt(rateLimitReset) * 1000).toISOString()
					: 'unknown';
				errorMessage = `GitHub API rate limit exceeded (5,000 requests/hour). Resets at ${resetTime}.`;
			} else if (response.status === 403 && rateLimitRemaining) {
				// Approaching limit but not exceeded
				const remaining = parseInt(rateLimitRemaining);
				if (remaining < 100) {
					errorMessage = `Approaching GitHub API rate limit. ${remaining} requests remaining. ${errorMessage}`;
				}
			}

			return {
				success: false,
				error: errorMessage
			};
		}

		const data = await response.json();
		return {
			success: true,
			data
		};
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'GitHub API request failed'
		};
	}
}

/**
 * Get latest commit SHA for a branch
 */
export async function getLatestCommitSha(): Promise<GitHubApiResult<string>> {
	const config = getGitHubConfig();
	const result = await githubRequest<{ sha: string }>(`/git/ref/heads/${config.branch}`);

	if (!result.success || !result.data) {
		return result as GitHubApiResult<string>;
	}

	// Follow the ref to get the commit SHA
	const commitResult = await githubRequest<{ sha: string }>(`/git/commits/${result.data.object.sha}`);

	if (!commitResult.success || !commitResult.data) {
		return commitResult as GitHubApiResult<string>;
	}

	return {
		success: true,
		data: commitResult.data.sha
	};
}

/**
 * Get file tree SHA for latest commit
 */
async function getTreeSha(commitSha: string): Promise<GitHubApiResult<string>> {
	const result = await githubRequest<{ tree: { sha: string } }>(`/git/commits/${commitSha}`);

	if (!result.success || !result.data) {
		return result as GitHubApiResult<string>;
	}

	return {
		success: true,
		data: result.data.tree.sha
	};
}

/**
 * List files in a directory (recursive)
 */
export async function listFiles(path: string = ''): Promise<GitHubApiResult<GitHubFile[]>> {
	const config = getGitHubConfig();
	const encodedPath = encodeURIComponent(path);
	
	// Use contents API for directory listing
	const result = await githubRequest<GitHubFile[]>(`/contents/${encodedPath}?ref=${config.branch}`);

	if (!result.success) {
		return result;
	}

	// If it's a single file, return as array
	if (!Array.isArray(result.data)) {
		return {
			success: true,
			data: [result.data]
		};
	}

	return result;
}

/**
 * Get file content from GitHub
 */
export async function getFileContent(filePath: string): Promise<GitHubApiResult<{ content: string; sha: string }>> {
	const config = getGitHubConfig();
	const encodedPath = encodeURIComponent(filePath);
	
	const result = await githubRequest<GitHubFile>(`/contents/${encodedPath}?ref=${config.branch}`);

	if (!result.success || !result.data) {
		return result as GitHubApiResult<{ content: string; sha: string }>;
	}

	// Decode Base64 content
	let content = '';
	if (result.data.content) {
		try {
			content = Buffer.from(result.data.content, 'base64').toString('utf-8');
		} catch (error: any) {
			return {
				success: false,
				error: `Failed to decode file content: ${error.message}`
			};
		}
	}

	return {
		success: true,
		data: {
			content,
			sha: result.data.sha
		}
	};
}

/**
 * Create or update a file via GitHub API
 * This is an atomic operation - it fetches latest SHA, updates content, and commits
 */
export async function createOrUpdateFile(
	filePath: string,
	content: string,
	commitMessage: string,
	sha?: string // If provided, updates existing file; otherwise creates new
): Promise<GitHubApiResult<GitHubCommit>> {
	const config = getGitHubConfig();
	
	// Encode content to Base64
	const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

	// If SHA not provided, try to get it (for updates)
	let fileSha = sha;
	if (!fileSha) {
		const existingFile = await getFileContent(filePath);
		if (existingFile.success && existingFile.data) {
			fileSha = existingFile.data.sha;
		}
	}

	// Create or update file
	// GitHub uses PUT for both create and update
	// If sha is provided, it's an update; otherwise it's a create
	const result = await githubRequest<{ commit: GitHubCommit }>(
		`/contents/${encodeURIComponent(filePath)}`,
		{
			method: 'PUT',
			body: JSON.stringify({
				message: commitMessage,
				content: encodedContent,
				sha: fileSha, // Required for updates, undefined for creates
				branch: config.branch
			})
		}
	);

	if (!result.success || !result.data) {
		return result as GitHubApiResult<GitHubCommit>;
	}

	return {
		success: true,
		data: result.data.commit
	};
}

/**
 * Delete a file via GitHub API
 */
export async function deleteFile(
	filePath: string,
	commitMessage: string
): Promise<GitHubApiResult<GitHubCommit>> {
	const config = getGitHubConfig();
	
	// First, get the file's SHA
	const fileResult = await getFileContent(filePath);
	if (!fileResult.success || !fileResult.data) {
		return {
			success: false,
			error: `File not found: ${filePath}`
		};
	}

	// Get latest commit SHA
	const commitResult = await getLatestCommitSha();
	if (!commitResult.success || !commitResult.data) {
		return commitResult as GitHubApiResult<GitHubCommit>;
	}

	// Delete file
	const result = await githubRequest<{ commit: GitHubCommit }>(
		`/contents/${encodeURIComponent(filePath)}`,
		{
			method: 'DELETE',
			body: JSON.stringify({
				message: commitMessage,
				sha: fileResult.data.sha,
				branch: config.branch
			})
		}
	);

	if (!result.success || !result.data) {
		return result as GitHubApiResult<GitHubCommit>;
	}

	return {
		success: true,
		data: result.data.commit
	};
}

/**
 * Validate file path is safe for content operations
 */
export function validateContentPath(filePath: string, allowedPrefixes: string[] = ['content', 'design']): boolean {
	// Remove leading slashes
	const normalized = filePath.replace(/^\/+/, '');
	
	// Check if path starts with allowed prefix
	const hasAllowedPrefix = allowedPrefixes.some(prefix => normalized.startsWith(prefix));
	
	// Prevent path traversal
	const hasPathTraversal = normalized.includes('..') || normalized.includes('~');
	
	// Prevent absolute paths
	const isAbsolute = normalized.startsWith('/');
	
	return hasAllowedPrefix && !hasPathTraversal && !isAbsolute;
}

/**
 * Get safe file path within allowed directories
 */
export function getSafeContentPath(relativePath: string, allowedPrefix: string = 'content'): string {
	// Remove path traversal attempts
	let safePath = relativePath.replace(/\.\./g, '').replace(/^\//, '');
	
	// Ensure it starts with allowed prefix
	if (!safePath.startsWith(allowedPrefix)) {
		safePath = `${allowedPrefix}/${safePath}`;
	}
	
	return safePath;
}
