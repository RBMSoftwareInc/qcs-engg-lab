<script lang="ts">
	let { height = '2rem' } = $props<{ height?: string }>();
</script>

<div class="block-spacer" style="height: {height};"></div>

<style>
	.block-spacer { width: 100%; min-height: 1rem; }
</style>
