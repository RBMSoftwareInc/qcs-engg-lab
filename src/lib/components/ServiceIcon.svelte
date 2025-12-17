<script lang="ts">
	let { type } = $props<{
		type: 'architecture' | 'development' | 'team' | 'optimization' | 'consulting';
	}>();
</script>

{#if type === 'architecture'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
		<rect x="16" y="16" width="32" height="32" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
		<circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.6"/>
		<line x1="32" y1="20" x2="32" y2="28" stroke="currentColor" stroke-width="2" opacity="0.5"/>
		<line x1="32" y1="36" x2="32" y2="44" stroke="currentColor" stroke-width="2" opacity="0.5"/>
		<line x1="20" y1="32" x2="28" y2="32" stroke="currentColor" stroke-width="2" opacity="0.5"/>
		<line x1="36" y1="32" x2="44" y2="32" stroke="currentColor" stroke-width="2" opacity="0.5"/>
	</svg>
{:else if type === 'development'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="12" y="12" width="40" height="40" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
		<line x1="20" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="2" opacity="0.6"/>
		<line x1="20" y1="32" x2="44" y2="32" stroke="currentColor" stroke-width="2" opacity="0.6"/>
		<line x1="20" y1="40" x2="36" y2="40" stroke="currentColor" stroke-width="2" opacity="0.6"/>
		<circle cx="28" cy="8" r="3" fill="currentColor" opacity="0.6"/>
		<circle cx="36" cy="8" r="3" fill="currentColor" opacity="0.6"/>
		<path d="M24 52 L32 48 L40 52" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
	</svg>
{:else if type === 'team'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="20" cy="20" r="8" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<circle cx="44" cy="20" r="8" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<path d="M12 40 Q20 32, 28 40" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<path d="M36 40 Q44 32, 52 40" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<circle cx="32" cy="16" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
		<path d="M20 48 Q32 40, 44 48" stroke="currentColor" stroke-width="2" fill="none"/>
		<line x1="20" y1="28" x2="28" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="36" y1="22" x2="44" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
	</svg>
{:else if type === 'optimization'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
		<path d="M32 12 L36 20 L32 28 L28 20 Z" stroke="currentColor" stroke-width="2" fill="none"/>
		<path d="M52 32 L44 36 L36 32 L44 28 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<path d="M32 52 L28 44 L32 36 L36 44 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<path d="M12 32 L20 28 L28 32 L20 36 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<circle cx="32" cy="32" r="3" fill="currentColor"/>
		<line x1="32" y1="12" x2="32" y2="29" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="52" y1="32" x2="35" y2="32" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
	</svg>
{:else if type === 'consulting'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M32 12 L40 20 L32 28 L24 20 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<path d="M20 32 L28 40 L36 40 L44 32 L36 24 L28 24 Z" stroke="currentColor" stroke-width="2" fill="none"/>
		<path d="M32 40 L40 48 L32 52 L24 48 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<circle cx="32" cy="32" r="4" fill="currentColor"/>
		<line x1="32" y1="12" x2="32" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="32" y1="36" x2="32" y2="48" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="20" y1="32" x2="28" y2="32" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="36" y1="32" x2="44" y2="32" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
	</svg>
{/if}

<style>
	svg {
		color: var(--highlight);
		transition: transform 0.3s ease;
	}
</style>

