<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// Redirect happens in +page.server.ts; this is a fallback if client loads first
	onMount(() => {
		const slug = $page.params.slug;
		if (slug) {
			goto(`/studio/builder?page=${encodeURIComponent(slug)}`, { replaceState: true });
		}
	});
</script>

<p>Loading builder…</p>
