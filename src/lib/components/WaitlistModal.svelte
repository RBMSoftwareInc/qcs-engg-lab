<script lang="ts">
	let { open = $bindable(false) } = $props<{ open?: boolean }>();

	let email = $state('');
	let source = $state('');
	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email.trim()) return;

		error = '';
		isSubmitting = true;
		try {
			const res = await fetch('/api/waitlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email.trim(), source: source.trim() || undefined })
			});
			const data = await res.json().catch(() => ({}));
			if (res.ok && data.success) {
				isSubmitted = true;
				email = '';
				source = '';
				setTimeout(() => {
					open = false;
					isSubmitted = false;
				}, 2500);
			} else {
				error = data.message || 'Signup failed. Please try again.';
			}
		} catch (_) {
			error = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) open = false;
	}
</script>

{#if open}
	<div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="waitlist-modal-title">
		<div class="modal-content">
			<button type="button" class="modal-close" onclick={() => (open = false)} aria-label="Close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
			</button>
			<h2 id="waitlist-modal-title" class="modal-title">Join the waitlist</h2>
			{#if isSubmitted}
				<div class="success-message">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
					<p class="success-title">You're on the list</p>
					<p class="success-text">We'll be in touch when we're ready.</p>
				</div>
			{:else}
				<p class="modal-description">Get early access. We'll notify you when we launch.</p>
				<form onsubmit={handleSubmit} class="modal-form">
					<div class="form-group">
						<label for="waitlist-email">Email</label>
						<input id="waitlist-email" type="email" bind:value={email} required autocomplete="email" placeholder="you@example.com" />
					</div>
					<div class="form-group">
						<label for="waitlist-source">How did you hear about us? (optional)</label>
						<input id="waitlist-source" type="text" bind:value={source} placeholder="e.g. Twitter, referral" />
					</div>
					{#if error}<div class="form-error" role="alert">{error}</div>{/if}
					<button type="submit" class="submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Joining…' : 'Join waitlist'}</button>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop { position: fixed; inset: 0; background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(12px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
	.modal-content { background: var(--bg-primary); border-radius: 16px; padding: 3rem; max-width: 500px; width: 100%; position: relative; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
	.modal-close { position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
	.modal-close:hover { color: var(--text-primary); }
	.modal-title { font-size: 1.75rem; font-weight: 600; margin-bottom: 0.5rem; }
	.modal-description { color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem; }
	.modal-form { display: flex; flex-direction: column; gap: 1.25rem; }
	.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
	.form-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); }
	.form-group input { padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font: inherit; }
	.form-group input:focus { outline: none; border-color: var(--highlight); }
	.form-error { color: var(--error, #dc2626); font-size: 0.9rem; }
	.submit-btn { padding: 1rem 2rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
	.submit-btn:hover:not(:disabled) { opacity: 0.9; }
	.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.success-message { text-align: center; padding: 2rem 0; }
	.success-message svg { color: var(--highlight, #22c55e); margin-bottom: 1rem; }
	.success-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
	.success-text { color: var(--text-secondary); font-size: 0.95rem; }
</style>
