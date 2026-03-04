<script lang="ts">
	import { onMount } from 'svelte';

	let { selector = 'main', headingTag = 'h2' } = $props<{
		selector?: string;
		headingTag?: string;
	}>();

	let headings = $state<{ id: string; text: string }[]>([]);
	let activeId = $state('');

	onMount(() => {
		const container = document.querySelector(selector);
		if (!container) return;

		const els = container.querySelectorAll(headingTag);
		const list: { id: string; text: string }[] = [];
		els.forEach((el) => {
			const id = el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
			if (id) {
				if (!el.id) el.id = id;
				list.push({ id, text: el.textContent?.trim() || '' });
			}
		});
		headings = list;

		if (list.length < 2) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
						break;
					}
				}
			},
			{ rootMargin: '-20% 0px -70% 0px', threshold: 0 }
		);

		list.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	});
</script>

{#if headings.length >= 2}
	<nav class="on-this-page" aria-label="On this page">
		<h3 class="on-this-page-title">On this page</h3>
		<ul class="on-this-page-list">
			{#each headings as { id, text }}
				<li>
					<a
						href="#{id}"
						class:active={activeId === id}
					>
						{text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.on-this-page {
		position: sticky;
		top: 100px;
		padding: 1rem 0;
	}

	.on-this-page-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin: 0 0 0.75rem 0;
	}

	.on-this-page-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.on-this-page-list li {
		margin-bottom: 0.35rem;
	}

	.on-this-page-list a {
		display: block;
		font-size: 0.9rem;
		color: var(--text-secondary);
		text-decoration: none;
		border: none;
		padding: 0.25rem 0;
		border-left: 2px solid transparent;
		padding-left: 0.75rem;
		transition: color 0.2s ease, border-color 0.2s ease;
	}

	.on-this-page-list a:hover {
		color: var(--text-primary);
	}

	.on-this-page-list a.active {
		color: var(--text-primary);
		border-left-color: var(--highlight);
		font-weight: 500;
	}
</style>
