/**
 * Validation utilities for Studio operations
 * Ensures data integrity and prevents invalid operations
 */

/**
 * Validate markdown content
 */
export function validateMarkdown(content: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!content || typeof content !== 'string') {
		errors.push('Content must be a non-empty string');
		return { valid: false, errors };
	}

	// Check for balanced frontmatter
	const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
	if (frontmatterMatch) {
		// Frontmatter exists, validate it
		const frontmatter = frontmatterMatch[1];
		const body = frontmatterMatch[2];

		if (!body.trim()) {
			errors.push('Markdown body cannot be empty');
		}

		// Check for required frontmatter fields
		if (!frontmatter.includes('title:')) {
			errors.push('Frontmatter must include a title field');
		}
	} else {
		// No frontmatter, content should not be empty
		if (!content.trim()) {
			errors.push('Content cannot be empty');
		}
	}

	// Check for potentially dangerous content
	if (content.includes('<script')) {
		errors.push('Content cannot contain script tags');
	}

	if (content.includes('javascript:')) {
		errors.push('Content cannot contain javascript: protocol');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Validate file path
 */
export function validateFilePath(path: string, allowedExtensions: string[] = ['.md', '.json', '.css']): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!path || typeof path !== 'string') {
		errors.push('Path must be a non-empty string');
		return { valid: false, errors };
	}

	// Check for path traversal
	if (path.includes('..') || path.includes('~')) {
		errors.push('Path cannot contain path traversal sequences');
	}

	// Check for absolute paths
	if (path.startsWith('/') && !path.startsWith('/content') && !path.startsWith('/design')) {
		errors.push('Path must be relative to content or design directory');
	}

	// Check extension
	if (allowedExtensions.length > 0) {
		const hasValidExtension = allowedExtensions.some(ext => path.endsWith(ext));
		if (!hasValidExtension) {
			errors.push(`Path must end with one of: ${allowedExtensions.join(', ')}`);
		}
	}

	// Check for invalid characters
	if (/[<>:"|?*]/.test(path)) {
		errors.push('Path contains invalid characters');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Validate commit message
 */
export function validateCommitMessage(message: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!message || typeof message !== 'string') {
		errors.push('Commit message must be a non-empty string');
		return { valid: false, errors };
	}

	if (message.trim().length === 0) {
		errors.push('Commit message cannot be empty');
	}

	if (message.length > 200) {
		errors.push('Commit message must be 200 characters or less');
	}

	// Check for potentially problematic characters
	if (message.includes('\n') && message.split('\n').length > 3) {
		errors.push('Commit message should not exceed 3 lines');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Validate JSON content
 */
export function validateJSON(content: string): { valid: boolean; errors: string[]; data?: any } {
	const errors: string[] = [];

	if (!content || typeof content !== 'string') {
		errors.push('Content must be a non-empty string');
		return { valid: false, errors };
	}

	try {
		const data = JSON.parse(content);
		return {
			valid: true,
			errors: [],
			data
		};
	} catch (error: any) {
		errors.push(`Invalid JSON: ${error.message}`);
		return {
			valid: false,
			errors
		};
	}
}
