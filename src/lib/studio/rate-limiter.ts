/**
 * Rate Limiter for GitHub API
 * Prevents exceeding GitHub API rate limits
 * 
 * GitHub API rate limits:
 * - Authenticated: 5,000 requests/hour
 * - Unauthenticated: 60 requests/hour
 */

interface RateLimitState {
	count: number;
	resetAt: number;
}

class RateLimiter {
	private limits: Map<string, RateLimitState> = new Map();
	private readonly windowMs: number;
	private readonly maxRequests: number;

	constructor(maxRequests: number = 100, windowMs: number = 60 * 60 * 1000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs; // Default: 1 hour
	}

	/**
	 * Check if request is allowed
	 */
	canMakeRequest(key: string = 'default'): boolean {
		const now = Date.now();
		const state = this.limits.get(key);

		if (!state || now > state.resetAt) {
			// Reset window
			this.limits.set(key, {
				count: 1,
				resetAt: now + this.windowMs
			});
			return true;
		}

		if (state.count >= this.maxRequests) {
			return false;
		}

		state.count++;
		return true;
	}

	/**
	 * Get remaining requests in current window
	 */
	getRemaining(key: string = 'default'): number {
		const state = this.limits.get(key);
		if (!state) {
			return this.maxRequests;
		}

		const now = Date.now();
		if (now > state.resetAt) {
			return this.maxRequests;
		}

		return Math.max(0, this.maxRequests - state.count);
	}

	/**
	 * Get reset time for current window
	 */
	getResetTime(key: string = 'default'): number | null {
		const state = this.limits.get(key);
		if (!state) {
			return null;
		}

		const now = Date.now();
		if (now > state.resetAt) {
			return null;
		}

		return state.resetAt;
	}

	/**
	 * Reset rate limit for a key
	 */
	reset(key: string = 'default'): void {
		this.limits.delete(key);
	}
}

// Global rate limiter instance
// Authenticated GitHub API allows 5,000 requests/hour
// We set a conservative limit of 4,000/hour to leave buffer and prevent hitting GitHub's limit
// This is per-server-instance, so multiple users share the same limit
export const githubRateLimiter = new RateLimiter(4000, 60 * 60 * 1000);

/**
 * Middleware to check rate limit before GitHub API calls
 */
export function checkRateLimit(key: string = 'github'): { allowed: boolean; remaining?: number; resetAt?: number } {
	const allowed = githubRateLimiter.canMakeRequest(key);
	
	if (!allowed) {
		const resetAt = githubRateLimiter.getResetTime(key);
		return {
			allowed: false,
			remaining: 0,
			resetAt: resetAt || undefined
		};
	}

	return {
		allowed: true,
		remaining: githubRateLimiter.getRemaining(key),
		resetAt: githubRateLimiter.getResetTime(key) || undefined
	};
}
