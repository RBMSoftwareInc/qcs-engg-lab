<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';

	let { open = $bindable(false), practice } = $props<{
		open: boolean;
		practice: {
			title: string;
			description?: string;
			slug: string;
			image?: string;
			html?: string;
			content?: string;
		} | null;
	}>();

	let modalRef: HTMLElement;
	let contentRef: HTMLElement;

	function handleClose() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			handleClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === modalRef) {
			handleClose();
		}
	}

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
			window.addEventListener('keydown', handleKeydown);
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if open && practice}
	<div
		class="practice-modal"
		class:open={open}
		bind:this={modalRef}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="modal-container" onclick={(e) => e.stopPropagation()}>
			<button class="modal-close" onclick={handleClose} aria-label="Close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>

			<div class="modal-content" bind:this={contentRef}>
				<div class="modal-header">
					{#if practice.image}
						<div class="modal-image">
							<img src={practice.image} alt={practice.title} loading="eager" />
						</div>
					{:else}
						<div class="modal-image-placeholder">
							<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect x="15" y="15" width="90" height="90" stroke="currentColor" stroke-width="2" stroke-dasharray="6 6" fill="none" opacity="0.3" />
								<circle cx="60" cy="60" r="25" fill="currentColor" opacity="0.2" />
								<path d="M35 35L85 85M85 35L35 85" stroke="currentColor" stroke-width="1.5" opacity="0.3" />
							</svg>
						</div>
					{/if}
					<div class="modal-header-text">
						<h2 id="modal-title" class="modal-title">{practice.title}</h2>
						{#if practice.description}
							<p class="modal-description">{practice.description}</p>
						{/if}
					</div>
				</div>

				<div class="modal-body">
					{#if practice.html}
						<MarkdownBlock html={practice.html} />
					{:else if practice.content}
						<div class="content-text">
							{#each practice.content.split('\n\n') as paragraph}
								{#if paragraph.trim()}
									<p>{paragraph.trim()}</p>
								{/if}
							{/each}
						</div>
					{:else}
						<p class="no-content">No additional content available.</p>
					{/if}
				</div>

				<div class="modal-footer">
					<a href="/practice/{practice.slug}" class="view-full-link" onclick={handleClose}>
						View Full Page →
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.practice-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
		backdrop-filter: blur(8px);
		background: rgba(0, 0, 0, 0.4);
	}

	.practice-modal.open {
		opacity: 1;
		pointer-events: all;
	}

	.modal-container {
		position: relative;
		width: 90%;
		max-width: 900px;
		max-height: 90vh;
		background: var(--bg-primary);
		border-radius: 16px;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transform: scale(0.95) translateY(20px);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.practice-modal.open .modal-container {
		transform: scale(1) translateY(0);
	}

	.modal-close {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1px solid var(--border-subtle);
		background: var(--bg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--text-secondary);
		z-index: 10;
	}

	.modal-close:hover {
		background: var(--bg-secondary);
		border-color: var(--highlight);
		color: var(--text-primary);
		transform: rotate(90deg);
	}

	.modal-content {
		overflow-y: auto;
		overflow-x: hidden;
		max-height: 90vh;
	}

	.modal-header {
		padding: 3rem 3rem 2rem;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}

	.modal-image {
		width: 200px;
		height: 200px;
		flex-shrink: 0;
		border-radius: 12px;
		overflow: hidden;
		background: var(--bg-secondary);
	}

	.modal-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.modal-image-placeholder {
		width: 200px;
		height: 200px;
		flex-shrink: 0;
		border-radius: 12px;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
		border: 2px dashed var(--border-subtle);
	}

	.modal-image-placeholder svg {
		opacity: 0.4;
	}

	.modal-header-text {
		flex: 1;
	}

	.modal-title {
		font-size: 2.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.modal-description {
		font-size: 1.25rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0;
	}

	.modal-body {
		padding: 2rem 3rem;
		color: var(--text-secondary);
		line-height: 1.8;
	}

	.modal-body :global(p) {
		margin-bottom: 1.5rem;
	}

	.modal-body :global(h2) {
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		font-size: 1.75rem;
		color: var(--text-primary);
	}

	.modal-body :global(h3) {
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		font-size: 1.5rem;
		color: var(--text-primary);
	}

	.modal-body :global(ul),
	.modal-body :global(ol) {
		margin-left: 2rem;
		margin-bottom: 1.5rem;
	}

	.modal-footer {
		padding: 2rem 3rem;
		border-top: 1px solid var(--border-subtle);
		text-align: center;
		background: var(--bg-secondary);
	}

	.view-full-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-primary);
		text-decoration: none;
		font-weight: 600;
		font-size: 1.1rem;
		transition: all 0.2s ease;
		border-bottom: 2px solid var(--highlight);
		padding-bottom: 4px;
	}

	.view-full-link:hover {
		border-bottom-color: var(--text-primary);
		gap: 0.75rem;
	}

	.content-text p {
		margin-bottom: 1.5rem;
	}

	.no-content {
		color: var(--text-muted);
		font-style: italic;
		text-align: center;
		padding: 3rem;
	}

	@media (max-width: 768px) {
		.modal-container {
			width: 95%;
			max-height: 95vh;
		}

		.modal-header {
			flex-direction: column;
			padding: 2rem 1.5rem 1.5rem;
		}

		.modal-image,
		.modal-image-placeholder {
			width: 100%;
			height: 200px;
		}

		.modal-title {
			font-size: 2rem;
		}

		.modal-body {
			padding: 1.5rem;
		}

		.modal-footer {
			padding: 1.5rem;
		}

		.modal-close {
			top: 1rem;
			right: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.practice-modal,
		.modal-container {
			transition: none;
		}
	}
</style>

