<script lang="ts">
	let { open = $bindable(false), page = '' } = $props<{ open?: boolean; page?: string }>();

	let rating = $state<number | null>(null);
	let comment = $state('');
	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!comment.trim()) return;

		error = '';
		isSubmitting = true;
		try {
			const res = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					page: page || (typeof window !== 'undefined' ? window.location.pathname : ''),
					rating: rating ?? undefined,
					comment: comment.trim()
				})
			});
			const data = await res.json().catch(() => ({}));
			if (res.ok && data.success) {
				isSubmitted = true;
				rating = null;
				comment = '';
				setTimeout(() => {
					open = false;
					isSubmitted = false;
				}, 2500);
			} else {
				error = data.message || 'Submission failed. Please try again.';
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
	<div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
		<div class="modal-content">
			<button type="button" class="modal-close" onclick={() => (open = false)} aria-label="Close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
			</button>
			<h2 id="feedback-modal-title" class="modal-title">Send feedback</h2>
			{#if isSubmitted}
				<div class="success-message">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
					<p class="success-title">Thank you</p>
					<p class="success-text">Your feedback helps us improve.</p>
				</div>
			{:else}
				<p class="modal-description">Tell us what you think. Optional: rate from 1–5.</p>
				<form onsubmit={handleSubmit} class="modal-form">
					<div class="form-group">
						<label>Rating (optional)</label>
						<div class="rating-row" role="group" aria-label="Rating">
							{#each [1, 2, 3, 4, 5] as n}
								<button type="button" class="rating-btn" class:selected={rating === n} onclick={() => rating = rating === n ? null : n} aria-pressed={rating === n}>{n}</button>
							{/each}
						</div>
					</div>
					<div class="form-group">
						<label for="feedback-comment">Comment</label>
						<textarea id="feedback-comment" bind:value={comment} rows="4" required placeholder="Your feedback..."></textarea>
					</div>
					{#if error}<div class="form-error" role="alert">{error}</div>{/if}
					<button type="submit" class="submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send feedback'}</button>
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
	.form-group textarea { padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font: inherit; resize: vertical; min-height: 100px; }
	.form-group textarea:focus { outline: none; border-color: var(--highlight); }
	.rating-row { display: flex; gap: 0.5rem; }
	.rating-btn { width: 2.5rem; height: 2.5rem; border: 2px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
	.rating-btn:hover { border-color: var(--highlight); }
	.rating-btn.selected { border-color: var(--highlight); background: rgba(244, 196, 48, 0.15); color: var(--text-primary); }
	.form-error { color: var(--error, #dc2626); font-size: 0.9rem; }
	.submit-btn { padding: 1rem 2rem; background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
	.submit-btn:hover:not(:disabled) { opacity: 0.9; }
	.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.success-message { text-align: center; padding: 2rem 0; }
	.success-message svg { color: var(--highlight, #22c55e); margin-bottom: 1rem; }
	.success-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
	.success-text { color: var(--text-secondary); font-size: 0.95rem; }
</style>
