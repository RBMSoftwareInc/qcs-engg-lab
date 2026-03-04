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
	import { page } from '$app/stores';
	import ConversationModal from '$lib/components/ConversationModal.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import FooterIcons from '$lib/components/FooterIcons.svelte';
	import { getVisitorState, markFirstVisit } from '$lib/utils/visitor';
	import { setupKeyboardNavigation } from '$lib/utils/keyboard';
	import { getBaseUrl, fullUrl, getDefaultMeta, getOrganizationJsonLd, getWebSiteJsonLd } from '$lib/seo';
	import { fade } from 'svelte/transition';

	let { data, children } = $props();
	// Active design skin CSS — applied only to public site, not Studio
	const applySkin = $derived(
		!!(data?.skinCss && typeof data.skinCss === 'string' && !$page.url.pathname.startsWith('/studio'))
	);
	let seoConfig = $derived(data?.seoConfig ?? null);
	let menus = $derived(data?.menus ?? { header: [], footer: [], cta: [] });
	let headerLinks = $derived(menus.header?.filter((l) => l.enabled !== false) ?? []);
	let footerLinks = $derived(menus.footer?.filter((l) => l.enabled !== false) ?? []);
	let ctaItems = $derived(menus.cta?.filter((c) => c.enabled !== false) ?? []);
	let modalCta = $derived(ctaItems.find((c) => c.type === 'modal'));
	let linkCtas = $derived(ctaItems.filter((c) => c.type === 'link'));
	let baseUrl = $derived(getBaseUrl(seoConfig?.siteUrl));
	let canonicalUrl = $derived(
		baseUrl ? `${baseUrl}${$page.url.pathname || '/'}` : fullUrl($page.url.pathname)
	);
	let meta = $derived(getDefaultMeta(seoConfig));

	let prefersReducedMotion = $state(false);
	let modalOpen = $state(false);
	let headerScrolled = $state(false);
	let visitorState = $state(getVisitorState());
	let mobileMenuOpen = $state(false);
	/** Copy for data forms (from /api/data-forms/enabled) so modals can use Studio-customized labels */
	let dataFormsCopy = $state<Record<string, { label?: string; submitText?: string; successMessage?: string; fields?: Record<string, { label?: string; placeholder?: string }> }> | null>(null);

	// Single header on Studio: remove main-site top padding so Studio header sits at top
	$effect(() => {
		if (typeof document === 'undefined') return;
		const path = $page.url.pathname;
		if (path.startsWith('/studio')) {
			document.body.classList.add('studio-routes');
		} else {
			document.body.classList.remove('studio-routes');
		}
	});

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

		// Load data-forms copy (enabled + labels) for modals when not on Studio
		if (!window.location.pathname.startsWith('/studio')) {
			fetch('/api/data-forms/enabled')
				.then((r) => r.json())
				.then((data) => {
					if (data?.copy && typeof data.copy === 'object') dataFormsCopy = data.copy;
				})
				.catch(() => {});
		}

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
	<meta name="description" content={meta.description} />
	<title>{meta.title}</title>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	{#if applySkin && data?.skinCss}
		<style data-active-skin={data?.activeSkinName ?? undefined}>{data.skinCss}</style>
	{/if}
	<!-- Canonical URL for search engines -->
	<link rel="canonical" href={canonicalUrl} />
	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:site_name" content={meta.siteName} />
	<meta property="og:locale" content="en_US" />
	{#if seoConfig?.ogImage}
		<meta property="og:image" content={seoConfig.ogImage.startsWith('http') ? seoConfig.ogImage : baseUrl + (seoConfig.ogImage.startsWith('/') ? seoConfig.ogImage : '/' + seoConfig.ogImage)} />
		<meta name="twitter:image" content={seoConfig.ogImage.startsWith('http') ? seoConfig.ogImage : baseUrl + (seoConfig.ogImage.startsWith('/') ? seoConfig.ogImage : '/' + seoConfig.ogImage)} />
	{/if}
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	{#if seoConfig?.twitterHandle}
		<meta name="twitter:site" content={seoConfig.twitterHandle} />
	{/if}
	<!-- JSON-LD for search -->
	{@html `<script type="application/ld+json">${getOrganizationJsonLd(seoConfig?.siteUrl)}<\/script>`}
	{@html `<script type="application/ld+json">${getWebSiteJsonLd(seoConfig?.siteUrl)}<\/script>`}
</svelte:head>

<Analytics gtmId={seoConfig?.gtmId} gaMeasurementId={seoConfig?.gaMeasurementId} />
<ScrollProgress />
<BackToTop />

{#key $page.url.pathname}
	<div
		class="page-transition"
		in:fade={{ duration: prefersReducedMotion ? 0 : 160 }}
		out:fade={{ duration: prefersReducedMotion ? 0 : 120 }}
	>
{#if !$page.url.pathname.startsWith('/studio')}
<nav class="main-nav" class:scrolled={headerScrolled}>
	<span class="nav-accent" aria-hidden="true"></span>
	<div class="container">
		<a href="/" class="nav-logo" aria-label="QuantumCore Solutions">
			<Logo size={36} variant="full" showText={true} />
		</a>

		<button
			class="mobile-menu-toggle"
			class:open={mobileMenuOpen}
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
				{#each headerLinks as link}
					<a href={link.href} class:active={$page.url.pathname === link.href || (link.href !== '/' && $page.url.pathname.startsWith(link.href))}>
						{link.label}
					</a>
				{/each}
			</div>
			{#if modalCta}
				<button class="nav-initiate" onclick={() => { modalOpen = true; mobileMenuOpen = false; }}>
					<span class="nav-initiate-text">{modalCta.label}</span>
					<svg class="nav-initiate-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</button>
			{/if}
			{#each linkCtas as cta}
				<a href={cta.href ?? '#'} class="nav-cta-link" target="_blank" rel="noopener noreferrer">
					{cta.label}
				</a>
			{/each}
		</div>
	</div>
</nav>
{/if}

<main>
	{@render children()}
</main>

{#if !$page.url.pathname.startsWith('/studio')}
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
					<span class="footer-address-first"><FooterIcons name="location" /> Block B-B37-031</span><br />
					Sharjah, United Arab Emirates<br />
					50819
				</address>
				<div class="footer-hours">
					<span class="hours-label"><FooterIcons name="clock" /> Hours</span>
					<p class="hours-time">Mon–Fri 9:00–18:00</p>
					<p class="hours-time">Sat–Sun Closed</p>
				</div>
			</div>

			<div class="footer-section">
				<h3 class="footer-heading">Contact</h3>
				<div class="footer-contacts">
					<a href="tel:+919550270463" class="footer-link">
						<FooterIcons name="phone" />
						<span>+91 9550270463</span>
					</a>
					<a href="tel:+971557742649" class="footer-link">
						<FooterIcons name="phone" />
						<span>+971 55 774 2649</span>
					</a>
					<a href="mailto:info@quantumcoresolutions.com" class="footer-link">
						<FooterIcons name="email" />
						<span>info@quantumcoresolutions.com</span>
					</a>
				</div>
			</div>

			<div class="footer-section">
				<h3 class="footer-heading">Navigate</h3>
				<nav class="footer-nav">
					{#each footerLinks as link}
						<a href={link.href}><FooterIcons name="arrow" /> {link.label}</a>
					{/each}
				</nav>
			</div>
		</div>

		<div class="footer-bottom">
			<p class="footer-copyright">© {new Date().getFullYear()} QuantumCore Solutions</p>
		</div>
	</div>
</footer>
{/if}

<ConversationModal bind:open={modalOpen} copy={dataFormsCopy?.inquiries ?? undefined} />
	</div>
{/key}

<style>
	.page-transition {
		min-height: 100%;
	}
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
		background: rgba(255, 253, 247, 0.72);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
		padding: 0.875rem 0;
		border-bottom: 1px solid transparent;
	}

	.main-nav.scrolled {
		background: rgba(255, 253, 247, 0.92);
		box-shadow: 0 1px 0 var(--border-subtle), 0 4px 24px rgba(0, 0, 0, 0.04);
		border-bottom-color: var(--border-subtle);
	}

	.nav-accent {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent 0%, var(--highlight) 20%, var(--highlight) 80%, transparent 100%);
		opacity: 0.6;
		pointer-events: none;
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
		justify-content: center;
		gap: 5px;
		width: 40px;
		height: 40px;
		background: none;
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		cursor: pointer;
		padding: 0;
		position: relative;
		z-index: 1002;
		transition: border-color 0.25s ease, background 0.25s ease;
	}

	.mobile-menu-toggle:hover {
		border-color: var(--highlight);
		background: rgba(244, 196, 48, 0.08);
	}

	.hamburger-line {
		width: 18px;
		height: 1.5px;
		background: var(--text-primary);
		transition: transform 0.3s ease, opacity 0.3s ease;
		margin: 0 auto;
	}

	.mobile-menu-toggle.open .hamburger-line:nth-child(1) {
		transform: translateY(3.25px) rotate(45deg);
	}

	.mobile-menu-toggle.open .hamburger-line:nth-child(2) {
		opacity: 0;
	}

	.mobile-menu-toggle.open .hamburger-line:nth-child(3) {
		transform: translateY(-3.25px) rotate(-45deg);
	}

	.nav-content {
		display: flex;
		align-items: center;
		gap: 2.25rem;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-links a {
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9375rem;
		letter-spacing: 0.02em;
		transition: color 0.25s ease;
		position: relative;
		padding: 0.35rem 0;
	}

	.nav-links a::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 1.5px;
		background: var(--highlight);
		transition: width 0.25s ease;
	}

	.nav-links a:hover {
		color: var(--text-primary);
	}

	.nav-links a:hover::after {
		width: 100%;
	}

	.nav-links a.active {
		color: var(--text-primary);
	}

	.nav-links a.active::after {
		width: 100%;
		opacity: 0.85;
	}

	.nav-initiate {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: 1px solid var(--text-primary);
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.875rem;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.nav-initiate:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(31, 41, 55, 0.25);
	}

	.nav-initiate-icon {
		opacity: 0.9;
		transition: transform 0.25s ease;
	}

	.nav-initiate:hover .nav-initiate-icon {
		transform: translateX(2px);
	}

	.nav-cta-link {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
		text-decoration: none;
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		white-space: nowrap;
	}

	.nav-cta-link:hover {
		border-color: var(--highlight);
		color: var(--highlight);
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
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 0.75rem 0;
		padding-bottom: 0.5rem;
		border-bottom: none;
	}

	.footer-address {
		font-size: 0.9rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0;
		font-style: normal;
	}

	.footer-address-first {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.footer-hours {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.hours-label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 0.35rem 0;
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

	.footer-nav {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.footer-nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
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
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(255, 253, 247, 0.97);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			flex-direction: column;
			justify-content: center;
			padding: 5rem 2rem 2rem;
			transform: translateX(100%);
			transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
			box-shadow: -8px 0 32px rgba(0, 0, 0, 0.06);
			z-index: 1001;
		}

		.nav-content.open {
			transform: translateX(0);
		}

		.nav-links {
			flex-direction: column;
			width: 100%;
			gap: 0;
			align-items: stretch;
		}

		.nav-links a {
			padding: 1rem 0;
			font-size: 1.125rem;
			border-bottom: 1px solid var(--border-subtle);
		}

		.nav-links a::after {
			display: none;
		}

		.nav-links a.active {
			color: var(--highlight);
			font-weight: 600;
		}

		.nav-initiate {
			width: 100%;
			margin-top: 2rem;
			justify-content: center;
			padding: 0.875rem 1.5rem;
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
