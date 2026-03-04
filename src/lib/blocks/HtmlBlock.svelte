<script lang="ts">
	let { content = '' } = $props<{ content?: string }>();
</script>

<div class="block-html">
	{@html content}
</div>

<style>
	.block-html { padding: 1rem 0; }
</style>
