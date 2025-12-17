/**
 * Safe JSON parser for API responses
 * Handles static builds where API routes return HTML instead of JSON
 */
export async function safeJsonParse<T = any>(response: Response): Promise<{ data: T | null; isHtml: boolean }> {
	const contentType = response.headers.get('content-type') || '';
	const text = await response.text();
	
	// Check if response is HTML (static build - API route doesn't exist)
	if (contentType.includes('text/html') || text.trim().startsWith('<!')) {
		return { data: null, isHtml: true };
	}
	
	try {
		const data = JSON.parse(text);
		return { data, isHtml: false };
	} catch (error) {
		// If parse fails, likely HTML response
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

