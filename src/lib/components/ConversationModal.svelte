<script lang="ts">
	import { onMount } from 'svelte';

	let { open = $bindable(false) } = $props<{
		open?: boolean;
	}>();

	let formRef: HTMLFormElement;
	let nameRef: HTMLInputElement;
	let emailRef: HTMLInputElement;
	let intentRef: HTMLTextAreaElement;
	let prefersReducedMotion = $state(false);
	let isAnimating = $state(false);

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		// Handle form submission here
		console.log('Form submitted');
		open = false;
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

			<h2 id="modal-title" class="modal-title">Let's Get Started</h2>
			<p class="modal-intro">
				Custom software crafted for your sustainable success.<br />
				Tell us about your project and we'll get back to you.
			</p>

			<form bind:this={formRef} onsubmit={handleSubmit} class="modal-form">
				<div class="form-group">
					<label for="name">Name</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:this={nameRef}
						required
						autocomplete="name"
					/>
				</div>

				<div class="form-group">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						bind:this={emailRef}
						required
						autocomplete="email"
					/>
				</div>

				<div class="form-group">
					<label for="intent">What brings you here?</label>
					<textarea
						id="intent"
						name="intent"
						bind:this={intentRef}
						rows="4"
						required
						placeholder="Share your intent..."
					></textarea>
				</div>

				<button type="submit" class="form-submit">Proceed</button>
			</form>
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

