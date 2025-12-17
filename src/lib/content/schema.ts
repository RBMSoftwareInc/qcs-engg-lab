/**
 * Content Governance Schema
 * 
 * Defines the structure and validation rules for MDX content frontmatter.
 * This is the single source of truth for content metadata.
 */

export type ContentType = 'page' | 'domain' | 'field-note' | 'signal' | 'service' | 'insight';
export type ContentStatus = 'draft' | 'review' | 'live' | 'all';

export interface BaseContentMetadata {
	/** Content type - determines routing and rendering */
	type: ContentType;
	
	/** Publication status - only 'live' content is published */
	status: ContentStatus;
	
	/** Display title */
	title: string;
	
	/** SEO description */
	description?: string;
	
	/** Sort order for listings */
	order?: number;
	
	/** Legacy URL for redirect mapping (WordPress/Elementor) */
	legacyUrl?: string;
	
	/** Publication date (ISO 8601) */
	publishedAt?: string;
	
	/** Last updated date (ISO 8601) */
	updatedAt?: string;
	
	/** Content tags for categorization */
	tags?: string[];
	
	/** Author name */
	author?: string;
}

export interface DomainMetadata extends BaseContentMetadata {
	type: 'domain';
	icon?: string;
	diagram?: string;
}

export interface FieldNoteMetadata extends BaseContentMetadata {
	type: 'field-note';
	category?: string;
	heroImage?: string;
}

export interface SignalMetadata extends BaseContentMetadata {
	type: 'signal';
	category?: string;
	icon?: 'scale' | 'analytics' | 'cloud' | 'intelligence';
	image?: string;
}

export interface ServiceMetadata extends BaseContentMetadata {
	type: 'service';
	icon?: 'architecture' | 'development' | 'team' | 'optimization' | 'consulting';
	features?: string[];
	benefits?: Array<{ title: string; description: string }>;
}

export interface InsightMetadata extends BaseContentMetadata {
	type: 'insight';
	category?: string;
	heroImage?: string;
}

export interface PageMetadata extends BaseContentMetadata {
	type: 'page';
}

export type ContentMetadata = 
	| DomainMetadata 
	| FieldNoteMetadata 
	| SignalMetadata 
	| ServiceMetadata 
	| InsightMetadata 
	| PageMetadata;

/**
 * Validates content metadata against schema
 */
export function validateMetadata(metadata: Partial<ContentMetadata>): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!metadata.type) {
		errors.push('Missing required field: type');
	} else if (!['page', 'domain', 'field-note', 'signal', 'service', 'insight'].includes(metadata.type)) {
		errors.push(`Invalid type: ${metadata.type}`);
	}

	if (!metadata.status) {
		errors.push('Missing required field: status');
	} else if (!['draft', 'review', 'live'].includes(metadata.status)) {
		errors.push(`Invalid status: ${metadata.status}`);
	}

	if (!metadata.title) {
		errors.push('Missing required field: title');
	}

	if (metadata.legacyUrl && !metadata.legacyUrl.startsWith('/')) {
		errors.push('legacyUrl must start with /');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Default metadata for new content
 */
export function getDefaultMetadata(type: ContentType): Partial<ContentMetadata> {
	return {
		type,
		status: 'draft',
		order: 999,
		publishedAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
}

