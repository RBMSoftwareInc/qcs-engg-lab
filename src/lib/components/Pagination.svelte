<script lang="ts">
	let { currentPage, totalPages, onPageChange } = $props<{
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	}>();

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			onPageChange(page);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function getPageNumbers() {
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			}
		}

		return pages;
	}
</script>

{#if totalPages > 1}
	<nav class="pagination" aria-label="Pagination">
		<button
			class="pagination-btn"
			class:disabled={currentPage === 1}
			onclick={() => goToPage(currentPage - 1)}
			aria-label="Previous page"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>

		<div class="pagination-numbers">
			{#each getPageNumbers() as page}
				{#if typeof page === 'number'}
					<button
						class="pagination-number"
						class:active={page === currentPage}
						onclick={() => goToPage(page)}
						aria-label="Page {page}"
						aria-current={page === currentPage ? 'page' : undefined}
					>
						{page}
					</button>
				{:else}
					<span class="pagination-ellipsis">{page}</span>
				{/if}
			{/each}
		</div>

		<button
			class="pagination-btn"
			class:disabled={currentPage === totalPages}
			onclick={() => goToPage(currentPage + 1)}
			aria-label="Next page"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 18l6-6-6-6" />
			</svg>
		</button>
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 3rem 0;
	}

	.pagination-btn {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		border: 2px solid var(--border-subtle);
		background: var(--bg-primary);
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.pagination-btn:hover:not(.disabled) {
		border-color: var(--highlight);
		background: var(--bg-secondary);
		transform: translateY(-2px);
	}

	.pagination-btn.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pagination-numbers {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.pagination-number {
		min-width: 40px;
		height: 40px;
		padding: 0 0.75rem;
		border-radius: 8px;
		border: 2px solid transparent;
		background: var(--bg-primary);
		color: var(--text-secondary);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.pagination-number:hover {
		border-color: var(--border-subtle);
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.pagination-number.active {
		background: var(--text-primary);
		color: var(--bg-primary);
		border-color: var(--text-primary);
		box-shadow: 0 2px 8px rgba(31, 41, 55, 0.2);
	}

	.pagination-ellipsis {
		padding: 0 0.5rem;
		color: var(--text-muted);
	}

	@media (max-width: 640px) {
		.pagination-number {
			min-width: 36px;
			height: 36px;
			padding: 0 0.5rem;
			font-size: 0.9rem;
		}

		.pagination-btn {
			width: 36px;
			height: 36px;
		}
	}
</style>

