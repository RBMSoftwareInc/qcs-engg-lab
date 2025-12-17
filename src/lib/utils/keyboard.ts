export function setupKeyboardNavigation() {
	if (typeof window === 'undefined') return;

	// Handle keyboard navigation for modals
	document.addEventListener('keydown', (e) => {
		// ESC key handling is done in components
		// Tab navigation is handled by browser by default
		
		// Smooth scroll on anchor links with keyboard
		if (e.key === 'Enter' && e.target instanceof HTMLAnchorElement) {
			const href = e.target.getAttribute('href');
			if (href && href.startsWith('#')) {
				e.preventDefault();
				const target = document.querySelector(href);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
		}
	});
}

