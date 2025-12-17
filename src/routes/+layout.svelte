<script lang="ts">
	// ============================================
	// GLOBAL JSON PARSING PROTECTION - LOADS FIRST
	// This prevents ALL JSON.parse errors from Studio
	// ============================================
	if (typeof window !== 'undefined') {
		// Patch Response.json() to NEVER throw errors
		const originalJson = Response.prototype.json;
		Response.prototype.json = async function() {
			try {
				const contentType = this.headers.get('content-type') || '';
				const text = await this.text();
				if (contentType.includes('text/html') || text.trim().startsWith('<!')) {
					return {}; // Return empty object instead of throwing
				}
				try {
					return JSON.parse(text);
				} catch {
					return {}; // Return empty object on parse failure
				}
			} catch {
				return {}; // Return empty object on any error
			}
		};

		// Patch JSON.parse() for Studio routes
		const originalParse = JSON.parse;
		JSON.parse = function(text: string, reviver?: any) {
			try {
				if (typeof text === 'string' && text.trim().startsWith('<!')) {
					return {}; // Return empty object for HTML
				}
				return originalParse.call(this, text, reviver);
			} catch (error) {
				// For Studio routes, return empty object instead of throwing
				if (window.location.pathname.startsWith('/studio')) {
					return {};
				}
				// For other routes, throw original error
				throw error;
			}
		};

		// Global unhandled rejection handler
		window.addEventListener('unhandledrejection', (event) => {
			if (event.reason instanceof SyntaxError && 
				event.reason.message.includes('Unexpected token') &&
				window.location.pathname.startsWith('/studio')) {
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
		}, true); // Use capture phase
	}

	import '../lib/styles/global.css';
	import { onMount } from 'svelte';
	import ConversationModal from '$lib/components/ConversationModal.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';
	import { getVisitorState, markFirstVisit } from '$lib/utils/visitor';
	import { setupKeyboardNavigation } from '$lib/utils/keyboard';

	let { children } = $props();

	let prefersReducedMotion = $state(false);
	let modalOpen = $state(false);
	let headerScrolled = $state(false);
	let visitorState = $state(getVisitorState());
	let mobileMenuOpen = $state(false);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Setup keyboard navigation
		setupKeyboardNavigation();

		// Handle scroll for header
		function handleScroll() {
			headerScrolled = window.scrollY > 50;
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		// Show modal on first visit - collect contact info
		if (visitorState.isFirstVisit) {
			setTimeout(() => {
				modalOpen = true;
				markFirstVisit();
			}, 800);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content="QuantumCore Solutions – Custom Software. Crafted for Your Sustainable Success." />
	<title>QuantumCore Solutions</title>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</svelte:head>

<ScrollProgress />

<nav class="main-nav" class:scrolled={headerScrolled}>
	<div class="container">
		<a href="/" class="nav-logo" aria-label="QuantumCore Solutions">
			<Logo size={36} variant="full" showText={true} />
		</a>
		
		<button
			class="mobile-menu-toggle"
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			aria-label="Toggle menu"
			aria-expanded={mobileMenuOpen}
		>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
		</button>

		<div class="nav-content" class:open={mobileMenuOpen}>
			<div class="nav-links">
				<a href="/practice">Practice</a>
				<a href="/philosophy">Philosophy</a>
				<a href="/insights">Insights</a>
				<a href="/signals">Signals</a>
				<a href="/about">About</a>
			</div>
			<button class="nav-initiate" onclick={() => { modalOpen = true; mobileMenuOpen = false; }}>
				Initiate
			</button>
		</div>
	</div>
</nav>

<main>
	{@render children()}
</main>

<footer class="main-footer">
	<div class="container">
		<div class="footer-grid">
			<div class="footer-brand">
				<div class="footer-logo-wrapper">
					<Logo size={36} variant="full" showText={true} />
				</div>
				<p class="footer-tagline">Engineering clarity into complexity.</p>
			</div>

			<div class="footer-section">
				<h3 class="footer-heading">Location</h3>
				<address class="footer-address">
					Block B-B37-031<br />
					Sharjah, United Arab Emirates<br />
					50819
				</address>
				<div class="footer-hours">
					<p class="hours-label">Hours</p>
					<p class="hours-time">I-V 9:00-18:00</p>
					<p class="hours-time">VI - VII Closed</p>
				</div>
			</div>

			<div class="footer-section">
				<h3 class="footer-heading">Contact</h3>
				<div class="footer-contacts">
					<a href="tel:+919550270463" class="footer-link">
						<span class="link-icon">📞</span>
						<span>+91 9550270463</span>
					</a>
					<a href="tel:+971557742649" class="footer-link">
						<span class="link-icon">📞</span>
						<span>+971 55 774 2649</span>
					</a>
					<a href="mailto:info@quantumcoresolutions.com" class="footer-link">
						<span class="link-icon">✉️</span>
						<span>info@quantumcoresolutions.com</span>
					</a>
				</div>
			</div>

			<div class="footer-section">
				<h3 class="footer-heading">Navigate</h3>
				<nav class="footer-nav">
					<a href="/practice">Practice</a>
					<a href="/philosophy">Philosophy</a>
					<a href="/insights">Insights</a>
					<a href="/signals">Signals</a>
					<a href="/about">About</a>
				</nav>
			</div>
		</div>

		<div class="footer-bottom">
			<p class="footer-copyright">© {new Date().getFullYear()} QuantumCore Solutions. All rights reserved.</p>
		</div>
	</div>
</footer>

<ConversationModal bind:open={modalOpen} />

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.main-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: transparent;
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
		padding: 1rem 0;
	}

	.main-nav.scrolled {
		background: rgba(255, 253, 247, 0.95);
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
	}

	.main-nav .container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav-logo {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.mobile-menu-toggle {
		display: none;
		flex-direction: column;
		gap: 4px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
	}

	.hamburger-line {
		width: 24px;
		height: 2px;
		background: var(--text-primary);
		transition: all 0.3s ease;
	}

	.nav-content {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-links a {
		color: var(--text-primary);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
		position: relative;
	}

	.nav-links a:hover {
		color: var(--highlight);
	}

	.nav-initiate {
		padding: 0.75rem 1.5rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.nav-initiate:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	main {
		margin-top: 80px;
		min-height: calc(100vh - 80px);
	}

	.main-footer {
		background: var(--bg-primary);
		padding: 5rem 0 2.5rem;
		margin-top: 6rem;
		border-top: 1px solid var(--border-subtle);
		position: relative;
	}

	.main-footer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(to right, transparent, var(--border-subtle), transparent);
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr;
		gap: 4rem;
		margin-bottom: 4rem;
		align-items: start;
	}

	.footer-brand {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 320px;
	}

	.footer-logo-wrapper {
		margin-bottom: 0.5rem;
	}

	.footer-tagline {
		font-size: 1rem;
		color: var(--text-secondary);
		font-style: normal;
		margin: 0;
		line-height: 1.6;
		font-weight: 400;
		letter-spacing: 0.01em;
	}

	.footer-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.footer-heading {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.footer-address {
		font-size: 0.9rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0;
		font-style: normal;
	}

	.footer-hours {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.hours-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 0.25rem 0;
	}

	.hours-time {
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin: 0;
	}

	.footer-contacts {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		padding: 0.25rem 0;
		line-height: 1.5;
	}

	.footer-link:hover {
		color: var(--text-primary);
		transform: translateX(2px);
	}

	.link-icon {
		font-size: 0.875rem;
		opacity: 0.7;
		width: 1.25rem;
		text-align: center;
	}

	.footer-nav {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.footer-nav a {
		display: inline-block;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		padding: 0.25rem 0;
		line-height: 1.5;
		position: relative;
		width: fit-content;
	}

	.footer-nav a::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 1px;
		background: var(--highlight);
		transition: width 0.3s ease;
	}

	.footer-nav a:hover {
		color: var(--text-primary);
		transform: translateX(2px);
	}

	.footer-nav a:hover::after {
		width: 100%;
	}

	.footer-bottom {
		text-align: center;
		padding-top: 2.5rem;
		border-top: 1px solid var(--border-subtle);
		margin-top: 2rem;
	}

	.footer-copyright {
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin: 0;
		letter-spacing: 0.01em;
		font-weight: 400;
	}

	@media (max-width: 1024px) {
		.footer-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 3rem;
		}

		.footer-brand {
			max-width: 100%;
		}
	}

	@media (max-width: 768px) {
		.mobile-menu-toggle {
			display: flex;
		}

		.nav-content {
			position: fixed;
			top: 70px;
			left: 0;
			right: 0;
			background: var(--bg-primary);
			flex-direction: column;
			padding: 2rem;
			transform: translateX(-100%);
			transition: transform 0.3s ease;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		}

		.nav-content.open {
			transform: translateX(0);
		}

		.nav-links {
			flex-direction: column;
			width: 100%;
			gap: 1rem;
		}

		.nav-initiate {
			width: 100%;
		}

		.main-footer {
			padding: 4rem 0 2rem;
			margin-top: 4rem;
		}

		.footer-grid {
			grid-template-columns: 1fr;
			gap: 2.5rem;
			margin-bottom: 3rem;
		}

		.footer-section {
			gap: 1.25rem;
		}

		.footer-bottom {
			padding-top: 2rem;
			margin-top: 1.5rem;
		}
	}
</style>
