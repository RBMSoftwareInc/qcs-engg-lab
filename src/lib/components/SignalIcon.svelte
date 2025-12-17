<script lang="ts">
	let { type } = $props<{
		type: 'scale' | 'analytics' | 'cloud' | 'intelligence';
	}>();
</script>

{#if type === 'scale'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
		<circle cx="32" cy="32" r="16" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/>
		<circle cx="32" cy="32" r="8" fill="currentColor"/>
		<circle cx="12" cy="32" r="4" fill="currentColor" opacity="0.6"/>
		<circle cx="52" cy="32" r="4" fill="currentColor" opacity="0.6"/>
		<circle cx="32" cy="12" r="4" fill="currentColor" opacity="0.6"/>
		<circle cx="32" cy="52" r="4" fill="currentColor" opacity="0.6"/>
		<line x1="32" y1="32" x2="12" y2="32" stroke="currentColor" stroke-width="1" opacity="0.3"/>
		<line x1="32" y1="32" x2="52" y2="32" stroke="currentColor" stroke-width="1" opacity="0.3"/>
		<line x1="32" y1="32" x2="32" y2="12" stroke="currentColor" stroke-width="1" opacity="0.3"/>
		<line x1="32" y1="32" x2="32" y2="52" stroke="currentColor" stroke-width="1" opacity="0.3"/>
	</svg>
{:else if type === 'analytics'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="40" width="8" height="16" fill="currentColor" opacity="0.8"/>
		<rect x="20" y="32" width="8" height="24" fill="currentColor" opacity="0.8"/>
		<rect x="32" y="24" width="8" height="32" fill="currentColor" opacity="0.8"/>
		<rect x="44" y="16" width="8" height="40" fill="currentColor" opacity="0.8"/>
		<line x1="8" y1="40" x2="20" y2="32" stroke="currentColor" stroke-width="2" opacity="0.5"/>
		<line x1="20" y1="32" x2="32" y2="24" stroke="currentColor" stroke-width="2" opacity="0.5"/>
		<line x1="32" y1="24" x2="44" y2="16" stroke="currentColor" stroke-width="2" opacity="0.5"/>
	</svg>
{:else if type === 'cloud'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M48 28c0-6.627-5.373-12-12-12-2.4 0-4.6.7-6.4 1.9C27.8 15.2 24.2 12 20 12c-6.627 0-12 5.373-12 12 0 .8.1 1.6.3 2.4C4.1 28.2 2 31.4 2 35c0 4.418 3.582 8 8 8h36c5.523 0 10-4.477 10-10s-4.477-10-10-10z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4"/>
		<path d="M40 24c0-4.418-3.582-8-8-8-1.6 0-3.1.5-4.3 1.3C26.2 15.8 23.6 14 20.5 14c-4.418 0-8 3.582-8 8 0 .6.1 1.2.2 1.8C9.4 25.1 8 27.2 8 29.5c0 3.038 2.462 5.5 5.5 5.5h23c3.866 0 7-3.134 7-7s-3.134-7-7-7z" stroke="currentColor" stroke-width="2" fill="none"/>
		<circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.6"/>
	</svg>
{:else if type === 'intelligence'}
	<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M32 8 L40 20 L32 32 L24 20 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<path d="M20 32 L32 24 L44 32 L32 40 Z" stroke="currentColor" stroke-width="2" fill="none"/>
		<path d="M32 40 L40 52 L32 56 L24 52 Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
		<circle cx="32" cy="32" r="4" fill="currentColor"/>
		<line x1="32" y1="12" x2="32" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
		<line x1="32" y1="36" x2="32" y2="52" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
	</svg>
{/if}

<style>
	svg {
		color: var(--highlight);
		transition: transform 0.3s ease;
	}
</style>

