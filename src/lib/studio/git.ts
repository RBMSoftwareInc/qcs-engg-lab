/**
 * QCS Studio Git Utilities
 * Server-side Git operations for content management
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const execAsync = promisify(exec);

export interface GitResult {
	success: boolean;
	message: string;
	output?: string;
	error?: string;
}

/**
 * Check if the given path is a Git repository (has .git)
 */
export function isGitRepo(repoPath: string): boolean {
	const gitDir = path.join(repoPath, '.git');
	return existsSync(gitDir);
}

/**
 * Get current branch name (main, master, or fallback to main)
 */
export async function getCurrentBranch(repoPath: string): Promise<string> {
	const result = await execAsync('git rev-parse --abbrev-ref HEAD', {
		cwd: repoPath,
		env: { ...process.env },
		timeout: 5000
	}).catch(() => ({ stdout: 'main' }));
	const branch = (result as { stdout?: string }).stdout?.trim() || 'main';
	return branch === 'HEAD' ? 'main' : branch;
}

/**
 * Execute Git command safely
 */
async function gitCommand(command: string, cwd: string): Promise<GitResult> {
	try {
		const { stdout } = await execAsync(`git ${command}`, {
			cwd,
			env: {
				...process.env,
				GIT_SSH_COMMAND: 'ssh -o StrictHostKeyChecking=no'
			},
			timeout: 30000
		});

		return {
			success: true,
			message: 'Command executed successfully',
			output: stdout.trim()
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || 'Git command failed',
			error: error.stderr || error.stdout || String(error)
		};
	}
}

/**
 * Pull latest changes from remote (uses current branch)
 */
export async function gitPull(repoPath: string): Promise<GitResult> {
	if (!isGitRepo(repoPath)) {
		return {
			success: false,
			message: 'Not a Git repository',
			error: 'Git is not available in this environment (e.g. serverless). Content is versioned via GitHub API when you save.'
		};
	}
	const branch = await getCurrentBranch(repoPath);
	return gitCommand(`pull origin ${branch}`, repoPath);
}

/**
 * Stage a file for commit
 */
export async function gitAdd(filePath: string, repoPath: string): Promise<GitResult> {
	const relativePath = path.relative(repoPath, filePath);
	return gitCommand(`add "${relativePath}"`, repoPath);
}

/**
 * Commit changes with message
 */
export async function gitCommit(message: string, repoPath: string): Promise<GitResult> {
	return gitCommand(`commit -m "${message.replace(/"/g, '\\"')}"`, repoPath);
}

/**
 * Push changes to remote (uses current branch)
 */
export async function gitPush(repoPath: string): Promise<GitResult> {
	if (!isGitRepo(repoPath)) {
		return { success: false, message: 'Not a Git repository', error: 'Git not available in this environment.' };
	}
	const branch = await getCurrentBranch(repoPath);
	return gitCommand(`push origin ${branch}`, repoPath);
}

/** Parsed status for one file (neutral wording for UI) */
export interface StatusEntry {
	path: string;
	code: string; // e.g. "M", "??", "A", "D"
	label: string; // "Modified", "New", "Added", "Deleted", "Renamed", "Unmerged"
}

/**
 * Parse `git status --porcelain` output into structured entries.
 * Uses neutral labels (Modified, New, etc.) for UI; code keeps short form (M, ??, A, D).
 */
export function parseStatusPorcelain(output: string): StatusEntry[] {
	const lines = (output || '').trim().split('\n').filter(Boolean);
	const entries: StatusEntry[] = [];
	const codeToLabel: Record<string, string> = {
		'M ': 'Modified',
		' M': 'Modified',
		'MM': 'Modified',
		'AM': 'Modified',
		'??': 'New',
		'A ': 'Added',
		'D ': 'Deleted',
		' D': 'Deleted',
		'R ': 'Renamed',
		'RM': 'Renamed',
		'C ': 'Copied',
		'U ': 'Unmerged',
		'UU': 'Unmerged'
	};
	for (const line of lines) {
		const code = line.slice(0, 2);
		let pathPart = line.slice(3).trim();
		// Rename: "from -> to" → show "from → to"
		if (pathPart.includes(' -> ')) {
			pathPart = pathPart.replace(' -> ', ' → ');
		}
		const path = pathPart;
		const label = codeToLabel[code] ?? (code.trim() || 'Changed');
		entries.push({ path, code: code.trim() || ' ', label });
	}
	return entries;
}

/**
 * Get current Git status (raw porcelain output)
 */
export async function gitStatus(repoPath: string): Promise<GitResult> {
	if (!isGitRepo(repoPath)) {
		return {
			success: false,
			message: 'Not a Git repository',
			output: 'Git is not available in this environment (e.g. serverless build). Content versioning works via GitHub API when you save from Studio.',
			error: 'No .git directory'
		};
	}
	return gitCommand('status --porcelain', repoPath);
}

/**
 * Write content to file and commit to Git
 */
export async function writeAndCommit(
	filePath: string,
	content: string,
	commitMessage: string,
	repoPath: string
): Promise<GitResult> {
	try {
		// Ensure directory exists
		const dir = path.dirname(filePath);
		if (!existsSync(dir)) {
			await mkdir(dir, { recursive: true });
		}

		// Write file
		await writeFile(filePath, content, 'utf-8');

		// Stage file
		const addResult = await gitAdd(filePath, repoPath);
		if (!addResult.success) {
			return addResult;
		}

		// Commit
		const commitResult = await gitCommit(commitMessage, repoPath);
		if (!commitResult.success) {
			return commitResult;
		}

		// Push
		const pushResult = await gitPush(repoPath);
		return pushResult;
	} catch (error: any) {
		return {
			success: false,
			message: 'Failed to write and commit file',
			error: error.message || String(error)
		};
	}
}

/**
 * One commit entry for activity feed (neutral wording)
 */
export interface LogEntry {
	hash: string;
	author: string;
	email: string;
	message: string;
	date: string;
}

/**
 * Get recent commit log for activity feed. Returns empty array if not a repo or on error.
 */
export async function gitLog(repoPath: string, limit = 20): Promise<LogEntry[]> {
	if (!isGitRepo(repoPath)) return [];
	try {
		// Tab-separated: hash, author, email, subject, date ISO
		const { stdout } = await execAsync(
			`git log -n ${Math.min(limit, 50)} --pretty=format:'%h%x09%an%x09%ae%x09%s%x09%ci'`,
			{ cwd: repoPath, env: process.env, timeout: 5000 }
		);
		const lines = (stdout || '').trim().split('\n').filter(Boolean);
		return lines.map((line) => {
			const parts = line.split('\t');
			return {
				hash: parts[0] ?? '',
				author: parts[1] ?? '',
				email: parts[2] ?? '',
				message: (parts[3] ?? '').replace(/\s+/g, ' ').trim(),
				date: parts[4] ?? ''
			};
		});
	} catch {
		return [];
	}
}

/**
 * Validate file path is within content directory
 */
export function validateContentPath(filePath: string, contentDir: string): boolean {
	const resolved = path.resolve(filePath);
	const contentResolved = path.resolve(contentDir);
	return resolved.startsWith(contentResolved);
}

/**
 * Get safe file path within content directory
 */
export function getSafeContentPath(relativePath: string, contentDir: string): string {
	// Remove any path traversal attempts
	const safePath = relativePath.replace(/\.\./g, '').replace(/^\//, '');
	return path.join(contentDir, safePath);
}

