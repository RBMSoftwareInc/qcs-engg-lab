<script lang="ts">
	import { onMount } from 'svelte';

	let { currentWord, currentIndex } = $props<{
		currentWord: string;
		currentIndex: number;
	}>();

	let contentRef: HTMLElement;
	let highlightedElements: HTMLElement[] = [];

	onMount(() => {
		// This component will be used to highlight words during TTS
		// The actual highlighting is handled in the parent component
	});
</script>

<div bind:this={contentRef} class="reading-highlighter">
	<slot />
</div>

<style>
	.reading-highlighter :global(.word-highlighted) {
		background: rgba(244, 196, 48, 0.3);
		border-radius: 2px;
		padding: 0 2px;
		transition: background 0.3s ease;
	}
</style>

