<script lang="ts">
	let { open = $bindable(false) } = $props<{
		open?: boolean;
	}>();

	let email = $state('');
	let isSubmitting = $state(false);
	let isSubmitted = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email || !email.includes('@')) return;

		isSubmitting = true;
		// Simulate API call
		setTimeout(() => {
			isSubmitting = false;
			isSubmitted = true;
			setTimeout(() => {
				open = false;
				isSubmitted = false;
				email = '';
			}, 2000);
		}, 1000);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
		}
	}
</script>

{#if open}
	<div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true">
		<div class="modal-content">
			<button class="modal-close" onclick={() => (open = false)} aria-label="Close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>

			{#if isSubmitted}
				<div class="success-message">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
					<h2>Subscribed!</h2>
					<p>Thank you for subscribing to our newsletter.</p>
				</div>
			{:else}
				<h2 class="modal-title">Stay Informed</h2>
				<p class="modal-description">
					Subscribe to receive our latest insights, research, and engineering updates.
				</p>

				<form onsubmit={handleSubmit} class="newsletter-form">
					<div class="form-group">
						<label for="newsletter-email">Email Address</label>
						<input
							type="email"
							id="newsletter-email"
							bind:value={email}
							required
							placeholder="your.email@example.com"
							autocomplete="email"
						/>
					</div>

					<button type="submit" class="submit-btn" disabled={isSubmitting}>
						{isSubmitting ? 'Subscribing...' : 'Subscribe'}
					</button>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(31, 41, 55, 0.6);
		backdrop-filter: blur(12px) saturate(180%);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: var(--bg-primary);
		border-radius: 16px;
		padding: 3rem;
		max-width: 500px;
		width: 100%;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-close {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-secondary);
		padding: 0.5rem;
		transition: color 0.2s ease;
	}

	.modal-close:hover {
		color: var(--text-primary);
	}

	.modal-title {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.modal-description {
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.newsletter-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.form-group input {
		padding: 0.875rem;
		border: 2px solid var(--border-subtle);
		border-radius: 8px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--highlight);
		box-shadow: 0 0 0 3px rgba(244, 196, 48, 0.1);
	}

	.submit-btn {
		padding: 1rem 2rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(31, 41, 55, 0.2);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.success-message {
		text-align: center;
		padding: 2rem 0;
	}

	.success-message svg {
		color: var(--highlight);
		margin: 0 auto 1.5rem;
		display: block;
	}

	.success-message h2 {
		font-size: 1.75rem;
		margin-bottom: 0.75rem;
	}

	.success-message p {
		color: var(--text-secondary);
	}
</style>

