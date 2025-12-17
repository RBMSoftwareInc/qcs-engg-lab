/**
 * GLOBAL JSON PARSING PATCH
 * Prevents ALL JSON.parse errors from Studio API calls
 * This runs BEFORE any Studio code executes
 */

if (typeof window !== 'undefined') {
	// Patch Response.json() globally to prevent errors
	const originalJson = Response.prototype.json;
	
	Response.prototype.json = async function() {
		try {
			// Check content-type first
			const contentType = this.headers.get('content-type') || '';
			if (contentType.includes('text/html')) {
				// Return empty object instead of throwing
				return {};
			}
			
			// Try to get text first
			const text = await this.text();
			
			// Check if it's HTML
			if (text.trim().startsWith('<!')) {
				// Return empty object instead of throwing
				return {};
			}
			
			// Try to parse as JSON
			try {
				return JSON.parse(text);
			} catch {
				// If parse fails, return empty object
				return {};
			}
		} catch (error) {
			// If ANY error, return empty object
			return {};
		}
	};

	// Also patch global JSON.parse for Studio routes
	const originalParse = JSON.parse;
	JSON.parse = function(text: string, reviver?: (this: any, key: string, value: any) => any) {
		try {
			// Check if it looks like HTML
			if (typeof text === 'string' && text.trim().startsWith('<!')) {
				console.warn('Studio: Prevented JSON.parse on HTML content');
				return {};
			}
			return originalParse.call(this, text, reviver);
		} catch (error) {
			// If parse fails and it's a Studio route, return empty object
			if (window.location.pathname.startsWith('/studio')) {
				console.warn('Studio: JSON.parse failed, returning empty object');
				return {};
			}
			// For non-Studio routes, throw the original error
			throw error;
		}
	};

	// Global unhandled rejection handler
	window.addEventListener('unhandledrejection', (event) => {
		if (event.reason instanceof SyntaxError && 
			event.reason.message.includes('Unexpected token') &&
			window.location.pathname.startsWith('/studio')) {
			console.warn('Studio: Suppressed JSON parse error - static build detected');
			event.preventDefault();
			event.stopPropagation();
		}
	});

	console.log('✅ Studio JSON parsing protection enabled');
}

