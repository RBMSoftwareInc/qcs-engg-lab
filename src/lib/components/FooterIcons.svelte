<script lang="ts">
	let { name } = $props<{ name: 'phone' | 'email' | 'location' | 'clock' | 'arrow' }>();
	const size = 18;
</script>

{#if name === 'phone'}
	<svg class="footer-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
	</svg>
{:else if name === 'email'}
	<svg class="footer-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
		<polyline points="22,6 12,13 2,6" />
	</svg>
{:else if name === 'location'}
	<svg class="footer-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
{:else if name === 'clock'}
	<svg class="footer-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
{:else if name === 'arrow'}
	<svg class="footer-icon footer-icon-arrow" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<line x1="5" y1="12" x2="19" y2="12" />
		<polyline points="12 5 19 12 12 19" />
	</svg>
{/if}

<style>
	.footer-icon {
		flex-shrink: 0;
		opacity: 0.85;
		transition: opacity 0.2s ease;
	}

	:global(.footer-link:hover) .footer-icon,
	:global(.footer-nav a:hover) .footer-icon-arrow {
		opacity: 1;
	}

	.footer-icon-arrow {
		opacity: 0.5;
	}
</style>
