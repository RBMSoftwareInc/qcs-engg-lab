/**
 * Multi-language (i18n) configuration for the git-native website builder.
 * Used by the public site (routing, locale switcher) and Studio (content per locale).
 */

export const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
	en: 'English',
	fr: 'Français',
	de: 'Deutsch',
	es: 'Español'
};

/** BCP 47 / og:locale style (e.g. en_US, fr_FR) for meta tags */
export const LOCALE_OG: Record<Locale, string> = {
	en: 'en_US',
	fr: 'fr_FR',
	de: 'de_DE',
	es: 'es_ES'
};

export function isValidLocale(value: string): value is Locale {
	return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getLocaleFromParam(param: string | undefined): Locale {
	if (param && isValidLocale(param)) return param;
	return DEFAULT_LOCALE;
}
