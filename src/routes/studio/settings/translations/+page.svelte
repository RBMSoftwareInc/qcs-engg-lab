<script lang="ts">
	import {
		SUPPORTED_LOCALES,
		DEFAULT_LOCALE,
		LOCALE_LABELS,
		LOCALE_OG,
		type Locale
	} from '$lib/i18n';
</script>

<svelte:head>
	<title>Translations | Studio Settings</title>
</svelte:head>

<div class="translations-settings-page">
	<div class="page-header">
		<h1>Translations</h1>
		<p class="page-description">
			Supported languages and default locale for the site. Content can be stored per language under
			<code>content/[locale]/…</code> (e.g. <code>content/fr/pages/home.json</code>). This config is defined in
			<code>src/lib/i18n.ts</code> and is used by the block-page loader and (when implemented) locale-aware routes and Studio content list.
		</p>
	</div>

	<div class="form-section">
		<h2>Default locale</h2>
		<p class="locale-default">
			<strong>{LOCALE_LABELS[DEFAULT_LOCALE]}</strong> (<code>{DEFAULT_LOCALE}</code>) — used when no locale is in the URL or content path.
		</p>
	</div>

	<div class="form-section">
		<h2>Supported locales</h2>
		<p class="section-note">These locales are available for content and (when [locale] routes are enabled) for the public site.</p>
		<ul class="locale-list">
			{#each SUPPORTED_LOCALES as locale}
				<li class="locale-item">
					<span class="locale-code">{locale}</span>
					<span class="locale-label">{LOCALE_LABELS[locale as Locale]}</span>
					{#if locale === DEFAULT_LOCALE}
						<span class="locale-badge">default</span>
					{/if}
					<span class="locale-og" title="Used for og:locale and hreflang">{LOCALE_OG[locale as Locale]}</span>
				</li>
			{/each}
		</ul>
	</div>

	<div class="form-section how-applied">
		<h2>Where this is applied</h2>
		<ul class="applied-list">
			<li><strong>Block pages</strong> — <code>getPageBySlug(slug, locale)</code> and <code>getPageSlugs(locale)</code> in <code>src/lib/content/pages.ts</code> resolve under <code>content/[locale]/pages/</code> when a locale is passed; otherwise <code>content/pages/</code> (default).</li>
			<li><strong>Public site</strong> — When <code>[locale]</code> routes are added (e.g. <code>/[locale]/page/[slug]</code>), the layout will use this list to validate the locale and set <code>lang</code> and <code>og:locale</code>.</li>
			<li><strong>Studio</strong> — Content list and edit can filter or group by locale; new/edit can target a specific language. Full locale-aware editing is described in <code>docs/I18N_TRANSLATIONS_GIT_NATIVE.md</code>.</li>
		</ul>
	</div>

	<p class="edit-note">
		To add or remove languages, edit <code>src/lib/i18n.ts</code> (SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_OG) and redeploy.
	</p>
</div>

<style>
	.translations-settings-page {
		max-width: 100%;
		width: 100%;
		padding: 2rem;
		box-sizing: border-box;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.page-description {
		font-size: 0.95rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
	}

	.page-description code {
		background: var(--bg-secondary);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
	}

	.form-section {
		margin-bottom: 2rem;
	}

	.form-section h2 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: var(--text-primary);
	}

	.section-note {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin: 0 0 0.75rem 0;
	}

	.locale-default {
		font-size: 0.95rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.locale-default code {
		background: var(--bg-secondary);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
	}

	.locale-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		overflow: hidden;
	}

	.locale-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
		font-size: 0.95rem;
	}

	.locale-item:last-child {
		border-bottom: none;
	}

	.locale-code {
		font-weight: 600;
		min-width: 2.5rem;
		color: var(--text-primary);
	}

	.locale-label {
		flex: 1;
		color: var(--text-secondary);
	}

	.locale-badge {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background: rgba(34, 197, 94, 0.15);
		color: #16a34a;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	.locale-og {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-family: ui-monospace, monospace;
	}

	.how-applied .applied-list {
		margin: 0;
		padding-left: 1.25rem;
	}

	.how-applied .applied-list li {
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.how-applied .applied-list code {
		background: var(--bg-secondary);
		padding: 0.15rem 0.35rem;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.edit-note {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin: 1.5rem 0 0 0;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-subtle);
	}

	.edit-note code {
		background: var(--bg-primary);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
	}
</style>
