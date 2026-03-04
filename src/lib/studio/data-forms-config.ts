/**
 * Data Forms config: which public forms (inquiries, newsletter, contact, etc.) are enabled
 * and where to persist submissions. Stored in config/data-forms.json; no DB.
 */

export type DataFormId =
	| 'inquiries'
	| 'newsletter'
	| 'contact'
	| 'waitlist'
	| 'feedback'
	| 'demoRequest';

/** Optional per-field label and placeholder (key = field name, e.g. name, email, message) */
export interface DataFormFieldCopy {
	label?: string;
	placeholder?: string;
}

export interface DataFormEntry {
	enabled: boolean;
	path: string;
	label: string;
	/** Button text, e.g. "Send", "Subscribe" */
	submitText?: string;
	/** Message shown after successful submit */
	successMessage?: string;
	/** Per-field labels and placeholders */
	fields?: Record<string, DataFormFieldCopy>;
}

export type DataFormsConfig = Record<DataFormId, DataFormEntry>;

export const DATA_FORMS_CONFIG_PATH = 'config/data-forms.json';

const DEFAULTS: DataFormsConfig = {
	inquiries: {
		enabled: true,
		path: 'data/inquiries',
		label: 'Get Started',
		submitText: 'Get started',
		successMessage: "We've received your message and will be in touch soon."
	},
	newsletter: {
		enabled: true,
		path: 'data/newsletter',
		label: 'Newsletter',
		submitText: 'Subscribe',
		successMessage: "You're on the list. We'll send updates occasionally."
	},
	contact: {
		enabled: false,
		path: 'data/contact',
		label: 'Contact',
		submitText: 'Send',
		successMessage: "We've received your message and will get back to you soon."
	},
	waitlist: {
		enabled: false,
		path: 'data/waitlist',
		label: 'Waitlist',
		submitText: 'Join waitlist',
		successMessage: "You're on the list. We'll notify you when we launch."
	},
	feedback: {
		enabled: false,
		path: 'data/feedback',
		label: 'Feedback',
		submitText: 'Send feedback',
		successMessage: 'Thank you. Your feedback helps us improve.'
	},
	demoRequest: {
		enabled: false,
		path: 'data/demo-requests',
		label: 'Demo Request',
		submitText: 'Request demo',
		successMessage: "We've received your request and will contact you to schedule."
	}
};

const FORM_IDS: DataFormId[] = [
	'inquiries',
	'newsletter',
	'contact',
	'waitlist',
	'feedback',
	'demoRequest'
];

function normalizeFieldCopy(raw: unknown): DataFormFieldCopy | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const o = raw as Record<string, unknown>;
	const label = typeof o.label === 'string' ? o.label.trim() : undefined;
	const placeholder = typeof o.placeholder === 'string' ? o.placeholder.trim() : undefined;
	if (!label && !placeholder) return undefined;
	return { label, placeholder };
}

function normalizeEntry(raw: unknown, defaultEntry: DataFormEntry): DataFormEntry {
	if (!raw || typeof raw !== 'object') return defaultEntry;
	const o = raw as Record<string, unknown>;
	const entry: DataFormEntry = {
		enabled: typeof o.enabled === 'boolean' ? o.enabled : defaultEntry.enabled,
		path: typeof o.path === 'string' ? o.path.trim() || defaultEntry.path : defaultEntry.path,
		label: typeof o.label === 'string' ? o.label.trim() || defaultEntry.label : defaultEntry.label
	};
	if (typeof o.submitText === 'string' && o.submitText.trim()) entry.submitText = o.submitText.trim();
	else if (defaultEntry.submitText) entry.submitText = defaultEntry.submitText;
	if (typeof o.successMessage === 'string' && o.successMessage.trim()) entry.successMessage = o.successMessage.trim();
	else if (defaultEntry.successMessage) entry.successMessage = defaultEntry.successMessage;
	if (o.fields && typeof o.fields === 'object') {
		const fields: Record<string, DataFormFieldCopy> = {};
		for (const [key, val] of Object.entries(o.fields)) {
			const fc = normalizeFieldCopy(val);
			if (fc) fields[key] = fc;
		}
		if (Object.keys(fields).length) entry.fields = fields;
	}
	return entry;
}

export function normalizeDataFormsConfig(raw: unknown): DataFormsConfig {
	if (!raw || typeof raw !== 'object') return { ...DEFAULTS };
	const o = raw as Record<string, unknown>;
	const out = { ...DEFAULTS };
	for (const id of FORM_IDS) {
		out[id] = normalizeEntry(o[id], DEFAULTS[id]);
	}
	return out;
}

export function getDefaultDataFormsConfig(): DataFormsConfig {
	return { ...DEFAULTS };
}

export function getDataFormsEnabledMap(config: DataFormsConfig): Record<DataFormId, boolean> {
	return {
		inquiries: config.inquiries.enabled,
		newsletter: config.newsletter.enabled,
		contact: config.contact.enabled,
		waitlist: config.waitlist.enabled,
		feedback: config.feedback.enabled,
		demoRequest: config.demoRequest.enabled
	};
}

/** Public copy for forms: label, submitText, successMessage, fields (only for enabled forms) */
export type DataFormCopy = {
	label: string;
	submitText?: string;
	successMessage?: string;
	fields?: Record<string, DataFormFieldCopy>;
};

export function getDataFormsCopy(config: DataFormsConfig): Partial<Record<DataFormId, DataFormCopy>> {
	const copy: Partial<Record<DataFormId, DataFormCopy>> = {};
	for (const id of FORM_IDS) {
		const e = config[id];
		if (!e.enabled) continue;
		copy[id] = {
			label: e.label,
			submitText: e.submitText,
			successMessage: e.successMessage,
			fields: e.fields
		};
	}
	return copy;
}

export { FORM_IDS };

/** Server-only: load config from GitHub (used by public form APIs and /api/data-forms/enabled) */
let cachedConfig: { config: DataFormsConfig; expires: number } | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function loadDataFormsConfigFromRepo(
	getFileContent: (path: string) => Promise<{ success: boolean; data?: { content: string } }>
): Promise<DataFormsConfig> {
	const now = Date.now();
	if (cachedConfig && cachedConfig.expires > now) {
		return cachedConfig.config;
	}
	try {
		const result = await getFileContent(DATA_FORMS_CONFIG_PATH);
		if (result.success && result.data?.content) {
			const parsed = JSON.parse(result.data.content) as unknown;
			const config = normalizeDataFormsConfig(parsed);
			cachedConfig = { config, expires: now + CACHE_TTL_MS };
			return config;
		}
	} catch {
		// use defaults
	}
	cachedConfig = { config: getDefaultDataFormsConfig(), expires: now + CACHE_TTL_MS };
	return cachedConfig.config;
}
