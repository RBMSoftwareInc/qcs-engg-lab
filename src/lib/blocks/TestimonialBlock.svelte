<script lang="ts">
	let { quote = '', author = '', role = '', avatar = '' } = $props<{
		quote?: string;
		author?: string;
		role?: string;
		avatar?: string;
	}>();
</script>

<blockquote class="block-testimonial">
	<p class="block-testimonial-quote">"{quote}"</p>
	<footer class="block-testimonial-footer">
		{#if avatar}<img class="block-testimonial-avatar" src={avatar} alt="" />{/if}
		<div>
			<cite class="block-testimonial-author">{author}</cite>
			{#if role}<span class="block-testimonial-role">{role}</span>{/if}
		</div>
	</footer>
</blockquote>

<style>
	.block-testimonial { margin: 3rem auto; max-width: 600px; padding: 2rem; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid var(--highlight); }
	.block-testimonial-quote { font-size: 1.25rem; font-style: italic; margin: 0 0 1rem; color: var(--text-primary); }
	.block-testimonial-footer { display: flex; align-items: center; gap: 1rem; }
	.block-testimonial-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
	.block-testimonial-author { font-weight: 600; font-style: normal; color: var(--text-primary); }
	.block-testimonial-role { display: block; font-size: 0.9rem; color: var(--text-muted); }
</style>
