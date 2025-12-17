<script lang="ts">
	let { size = 40, variant = 'full', showText = true } = $props<{
		size?: number;
		variant?: 'monogram' | 'full' | 'wordmark';
		showText?: boolean;
	}>();
</script>

<div class="logo-container">
	<svg
		width={size}
		height={size}
		viewBox="0 0 120 120"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="logo-svg"
	>
		<defs>
			<linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
				<stop offset="100%" style="stop-color:#4B5563;stop-opacity:1" />
			</linearGradient>
		</defs>
		
		<!-- Quantum core - abstract geometric form -->
		<g class="quantum-core">
			<!-- Outer ring - quantum field -->
			<circle cx="60" cy="60" r="50" stroke="url(#quantumGradient)" stroke-width="2" fill="none" opacity="0.3" />
			<circle cx="60" cy="60" r="45" stroke="url(#quantumGradient)" stroke-width="1.5" fill="none" opacity="0.2" />
			
			<!-- Central core - energy nodes -->
			<circle cx="60" cy="60" r="8" fill="url(#quantumGradient)" />
			<circle cx="60" cy="60" r="4" fill="var(--highlight)" opacity="0.8" />
			
			<!-- Orbital paths -->
			<ellipse cx="60" cy="60" rx="30" ry="15" stroke="url(#quantumGradient)" stroke-width="1" fill="none" opacity="0.15" transform="rotate(45 60 60)" />
			<ellipse cx="60" cy="60" rx="30" ry="15" stroke="url(#quantumGradient)" stroke-width="1" fill="none" opacity="0.15" transform="rotate(-45 60 60)" />
			
			<!-- Connection nodes -->
			<circle cx="85" cy="60" r="3" fill="url(#quantumGradient)" opacity="0.6" />
			<circle cx="35" cy="60" r="3" fill="url(#quantumGradient)" opacity="0.6" />
			<circle cx="60" cy="85" r="3" fill="url(#quantumGradient)" opacity="0.6" />
			<circle cx="60" cy="35" r="3" fill="url(#quantumGradient)" opacity="0.6" />
			
			<!-- Quantum connections -->
			<line x1="60" y1="60" x2="85" y2="60" stroke="url(#quantumGradient)" stroke-width="1" opacity="0.2" />
			<line x1="60" y1="60" x2="35" y2="60" stroke="url(#quantumGradient)" stroke-width="1" opacity="0.2" />
			<line x1="60" y1="60" x2="60" y2="85" stroke="url(#quantumGradient)" stroke-width="1" opacity="0.2" />
			<line x1="60" y1="60" x2="60" y2="35" stroke="url(#quantumGradient)" stroke-width="1" opacity="0.2" />
		</g>
	</svg>
	
	{#if showText && (variant === 'full' || variant === 'wordmark')}
		<div class="logo-text">
			<span class="logo-primary">QuantumCore</span>
			<span class="logo-secondary">Solutions</span>
			{#if variant === 'full'}
				<span class="logo-tagline">Innovate | Shape | Thrive</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.logo-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-svg {
		display: block;
		flex-shrink: 0;
		color: var(--text-primary);
		transition: transform 0.3s ease;
	}

	.logo-container:hover .logo-svg {
		transform: rotate(5deg) scale(1.05);
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
	}

	.logo-primary {
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
	}

	.logo-secondary {
		font-size: 0.75rem;
		font-weight: 400;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-secondary);
		margin-top: -2px;
	}

	.logo-tagline {
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--highlight);
		margin-top: 4px;
		opacity: 0.9;
	}

	@media (max-width: 640px) {
		.logo-text {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.logo-svg {
			transition: none;
		}

		.logo-container:hover .logo-svg {
			transform: none;
		}
	}
</style>
