/**
 * Safe JSON parser for API responses
 * Handles static builds where API routes return HTML instead of JSON
 * NEVER throws errors - always returns { data, isHtml }
 */
export async function safeJsonParse<T = any>(response: Response): Promise<{ data: T | null; isHtml: boolean }> {
	try {
		const contentType = response.headers.get('content-type') || '';
		const text = await response.text();
		
		// Check if response is HTML (static build - API route doesn't exist)
		if (contentType.includes('text/html') || text.trim().startsWith('<!')) {
			return { data: null, isHtml: true };
		}
		
		// Try to parse as JSON
		try {
			const data = JSON.parse(text);
			return { data, isHtml: false };
		} catch (parseError) {
			// If parse fails, it's likely HTML
			return { data: null, isHtml: true };
		}
	} catch (error) {
		// If ANY error occurs (network, etc.), assume static build
		return { data: null, isHtml: true };
	}
}

/**
 * Check if Studio API is available (not a static build)
 */
export async function checkApiAvailable(): Promise<boolean> {
	try {
		const response = await fetch('/studio/api/auth/check', {
			method: 'GET',
			headers: { 'Accept': 'application/json' }
		});
		const { isHtml } = await safeJsonParse(response);
		return !isHtml;
	} catch {
		return false;
	}
}

