<script lang="ts">
	let { type } = $props<{
		type: 'architecture' | 'systems' | 'research' | 'complexity' | 'longterm' | 'production';
	}>();
</script>

{#if type === 'architecture'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
		<rect x="16" y="16" width="32" height="32" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
		<circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.6"/>
		<line x1="32" y1="20" x2="32" y2="28" stroke="currentColor" stroke-width="2" opacity="0.5"/>
		<line x1="32" y1="36" x2="32" y2="44" stroke="currentColor" stroke-width="2" opacity="0.5"/>
	</svg>
{:else if type === 'systems'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
		<circle cx="32" cy="16" r="4" fill="currentColor"/>
		<circle cx="48" cy="32" r="4" fill="currentColor"/>
		<circle cx="32" cy="48" r="4" fill="currentColor"/>
		<circle cx="16" cy="32" r="4" fill="currentColor"/>
		<line x1="32" y1="20" x2="44" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="44" y1="36" x2="32" y2="44" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="20" y1="36" x2="32" y2="44" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="20" y1="28" x2="32" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
	</svg>
{:else if type === 'research'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M32 12 L40 20 L32 28 L24 20 Z" stroke="currentColor" stroke-width="2" fill="none"/>
		<path d="M20 32 L28 40 L36 40 L44 32 L36 24 L28 24 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<circle cx="32" cy="32" r="3" fill="currentColor"/>
		<line x1="32" y1="12" x2="32" y2="29" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="32" y1="35" x2="32" y2="52" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
	</svg>
{:else if type === 'complexity'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M16 32 L32 16 L48 32 L32 48 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4"/>
		<path d="M24 32 L32 24 L40 32 L32 40 Z" stroke="currentColor" stroke-width="2" fill="none"/>
		<circle cx="32" cy="32" r="3" fill="currentColor"/>
	</svg>
{:else if type === 'longterm'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
		<path d="M32 12 L32 32 L44 40" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
		<circle cx="32" cy="32" r="2" fill="currentColor"/>
		<path d="M12 32 Q20 24, 32 24 Q44 24, 52 32" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.4"/>
	</svg>
{:else if type === 'production'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="12" y="20" width="40" height="28" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
		<rect x="16" y="24" width="32" height="20" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
		<line x1="20" y1="32" x2="44" y2="32" stroke="currentColor" stroke-width="2" opacity="0.6"/>
		<line x1="20" y1="38" x2="36" y2="38" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<circle cx="28" cy="12" r="3" fill="currentColor" opacity="0.6"/>
		<circle cx="36" cy="12" r="3" fill="currentColor" opacity="0.6"/>
	</svg>
{/if}

<style>
	svg {
		color: var(--highlight);
		transition: transform 0.3s ease, opacity 0.3s ease;
	}
</style>

