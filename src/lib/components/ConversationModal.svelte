<script lang="ts">
	import { onMount } from 'svelte';

	/** Optional copy from Studio Data Forms config (inquiries: label, submitText, successMessage, fields) */
	export type ConversationModalCopy = {
		label?: string;
		submitText?: string;
		successMessage?: string;
		fields?: Record<string, { label?: string; placeholder?: string }>;
	};

	let { open = $bindable(false), copy } = $props<{
		open?: boolean;
		copy?: ConversationModalCopy;
	}>();

	let formRef: HTMLFormElement;
	let nameRef: HTMLInputElement;
	let emailRef: HTMLInputElement;
	let intentRef: HTMLTextAreaElement;
	let prefersReducedMotion = $state(false);
	let isAnimating = $state(false);
	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let error = $state('');

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const name = nameRef?.value?.trim() ?? '';
		const email = emailRef?.value?.trim() ?? '';
		const intent = intentRef?.value?.trim() ?? '';
		if (!name || !email || !intent) return;

		error = '';
		isSubmitting = true;
		try {
			const res = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, intent })
			});
			const data = await res.json().catch(() => ({}));
			if (res.ok && data.success) {
				isSubmitted = true;
				formRef?.reset();
				setTimeout(() => {
					open = false;
					isSubmitted = false;
				}, 2500);
			} else {
				error = data.message || 'Something went wrong. Please try again.';
			}
		} catch (_) {
			error = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			isAnimating = true;
			document.addEventListener('keydown', handleKeydown);
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
		};
	});

	const title = $derived(copy?.label ?? "Let's Get Started");
	const submitLabel = $derived(copy?.submitText ?? 'Proceed');
	const successText = $derived(copy?.successMessage ?? "We've received your message and will get back to you soon.");
	const field = (name: string, kind: 'label' | 'placeholder') => copy?.fields?.[name]?.[kind];
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="modal-backdrop"
		class:animating={isAnimating}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div
			class="modal-content"
			class:animating={isAnimating}
			style:animation={prefersReducedMotion ? 'none' : undefined}
		>
			<button class="modal-close" onclick={() => (open = false)} aria-label="Close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>

			<h2 id="modal-title" class="modal-title">{title}</h2>

			{#if isSubmitted}
				<div class="success-message">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
					<p class="success-title">Thank you</p>
					<p class="success-text">{successText}</p>
				</div>
			{:else}
				<p class="modal-intro">
					Custom software crafted for your sustainable success.<br />
					Tell us about your project and we'll get back to you.
				</p>

				<form bind:this={formRef} onsubmit={handleSubmit} class="modal-form">
				<div class="form-group">
					<label for="name">{field('name', 'label') ?? 'Name'}</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:this={nameRef}
						required
						autocomplete="name"
						placeholder={field('name', 'placeholder') ?? ''}
					/>
				</div>

				<div class="form-group">
					<label for="email">{field('email', 'label') ?? 'Email'}</label>
					<input
						type="email"
						id="email"
						name="email"
						bind:this={emailRef}
						required
						autocomplete="email"
						placeholder={field('email', 'placeholder') ?? ''}
					/>
				</div>

				<div class="form-group">
					<label for="intent">{field('intent', 'label') ?? 'What brings you here?'}</label>
					<textarea
						id="intent"
						name="intent"
						bind:this={intentRef}
						rows="4"
						required
						placeholder={field('intent', 'placeholder') ?? 'Share your intent...'}
					></textarea>
				</div>

					{#if error}
						<div class="form-error" role="alert">{error}</div>
					{/if}
				<button type="submit" class="form-submit" disabled={isSubmitting}>
					{isSubmitting ? 'Sending…' : submitLabel}
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
		opacity: 0;
		transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.modal-backdrop.animating {
		opacity: 1;
	}

	.modal-content {
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		padding: 3.5rem;
		max-width: 650px;
		width: 100%;
		position: relative;
		opacity: 0;
		transform: translateY(30px) scale(0.95);
		transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset;
		border-radius: 12px;
	}

	.modal-content.animating {
		opacity: 1;
		transform: translateY(0) scale(1);
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
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s ease;
	}

	.modal-close:hover {
		color: var(--text-primary);
	}

	.modal-close:focus {
		outline: 2px solid var(--highlight);
		outline-offset: 2px;
	}

	.modal-title {
		font-size: 2rem;
		font-weight: 500;
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
	}

	.modal-intro {
		font-size: 1.1rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.modal-form {
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
		color: var(--text-secondary);
		font-weight: 500;
	}

	.form-group input,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid var(--border-subtle);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--highlight);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 100px;
	}

	.form-submit {
		margin-top: 1rem;
		padding: 1rem 2rem;
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: transform 0.2s ease, background 0.2s ease;
	}

	.form-submit:hover {
		transform: translateY(-2px);
		background: var(--text-primary);
	}

	.form-submit:focus {
		outline: 2px solid var(--highlight);
		outline-offset: 2px;
	}

	.form-submit:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.form-error {
		color: var(--error, #dc2626);
		font-size: 0.9rem;
		margin-top: -0.5rem;
	}

	.success-message {
		text-align: center;
		padding: 2rem 0;
	}

	.success-message svg {
		color: var(--highlight, #22c55e);
		margin-bottom: 1rem;
	}

	.success-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.success-text {
		color: var(--text-secondary);
		line-height: 1.6;
	}

	@media (prefers-reduced-motion: reduce) {
		.modal-backdrop,
		.modal-content {
			transition: none;
		}

		.modal-content {
			opacity: 1;
			transform: none;
		}
	}

	@media (max-width: 640px) {
		.modal-content {
			padding: 2rem 1.5rem;
		}

		.modal-title {
			font-size: 1.5rem;
		}
	}
</style>

