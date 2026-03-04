<script lang="ts">
	let { url = '', poster = '' } = $props<{ url?: string; poster?: string }>();
	const isEmbed = $derived.by(() => !!url && (url.includes('youtube') || url.includes('vimeo') || url.includes('youtu.be')));
	const embedUrl = $derived.by(() => {
		if (!url || !isEmbed) return '';
		if (url.includes('youtu.be/')) return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0];
		if (url.includes('youtube')) return url.replace('watch?v=', 'embed/').replace('/watch?', '/embed?');
		if (url.includes('vimeo.com/')) return 'https://player.vimeo.com/video/' + url.split('vimeo.com/')[1].split('?')[0];
		return url;
	});
</script>

<div class="block-video">
	{#if isEmbed && embedUrl}
		<iframe src={embedUrl} title="Video" allowfullscreen class="block-video-iframe"></iframe>
	{:else if url && !isEmbed}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video src={url} poster={poster || undefined} controls class="block-video-el"></video>
	{:else}
		<p class="block-video-placeholder">Add video URL</p>
	{/if}
</div>

<style>
	.block-video { margin: 2rem 0; }
	.block-video-iframe, .block-video-el { width: 100%; aspect-ratio: 16/9; border-radius: 8px; }
	.block-video-placeholder { padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-secondary); border-radius: 8px; }
</style>
