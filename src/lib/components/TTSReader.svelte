<script lang="ts">
	import { onMount } from 'svelte';

	let { text, onWordHighlight } = $props<{
		text: string;
		onWordHighlight?: (word: string, index: number) => void;
	}>();

	let isPlaying = $state(false);
	let currentWordIndex = $state(-1);
	let speechSynthesis: SpeechSynthesis | null = null;
	let utterance: SpeechSynthesisUtterance | null = null;
	let words: string[] = [];

	onMount(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			speechSynthesis = window.speechSynthesis;
			words = text.split(/\s+/);
		}
	});

	function togglePlayback() {
		if (!speechSynthesis) {
			alert('Text-to-speech is not supported in your browser.');
			return;
		}

		if (isPlaying) {
			speechSynthesis.cancel();
			isPlaying = false;
			currentWordIndex = -1;
		} else {
			utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1;
			utterance.pitch = 1;
			utterance.volume = 1;

			utterance.onstart = () => {
				isPlaying = true;
			};

			utterance.onend = () => {
				isPlaying = false;
				currentWordIndex = -1;
			};

			utterance.onerror = () => {
				isPlaying = false;
				currentWordIndex = -1;
			};

			// Word highlighting simulation
			let wordIndex = 0;
			const interval = setInterval(() => {
				if (!isPlaying || wordIndex >= words.length) {
					clearInterval(interval);
					return;
				}
				currentWordIndex = wordIndex;
				onWordHighlight?.(words[wordIndex], wordIndex);
				wordIndex++;
			}, 200);

			speechSynthesis.speak(utterance);
		}
	}
</script>

<button
	class="tts-button"
	class:playing={isPlaying}
	onclick={togglePlayback}
	aria-label={isPlaying ? 'Stop reading' : 'Start reading'}
>
	{#if isPlaying}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
			<rect x="6" y="4" width="4" height="16" />
			<rect x="14" y="4" width="4" height="16" />
		</svg>
		<span>Stop</span>
	{:else}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polygon points="5 3 19 12 5 21" />
		</svg>
		<span>Listen</span>
	{/if}
</button>

<style>
	.tts-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: var(--bg-secondary);
		border: 2px solid var(--border-subtle);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.tts-button:hover {
		background: var(--bg-accent);
		border-color: var(--highlight);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.tts-button.playing {
		background: var(--highlight);
		color: var(--bg-primary);
		border-color: var(--highlight);
	}

	.tts-button svg {
		flex-shrink: 0;
	}
</style>

