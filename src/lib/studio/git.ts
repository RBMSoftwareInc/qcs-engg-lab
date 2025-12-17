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
 * Execute Git command safely
 */
async function gitCommand(command: string, cwd: string): Promise<GitResult> {
	try {
		const { stdout, stderr } = await execAsync(`git ${command}`, {
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
 * Pull latest changes from remote
 */
export async function gitPull(repoPath: string): Promise<GitResult> {
	return gitCommand('pull origin main', repoPath);
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
 * Push changes to remote
 */
export async function gitPush(repoPath: string): Promise<GitResult> {
	return gitCommand('push origin main', repoPath);
}

/**
 * Get current Git status
 */
export async function gitStatus(repoPath: string): Promise<GitResult> {
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

