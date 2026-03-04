<script lang="ts">
	let { style = 'solid' } = $props<{ style?: string }>();
</script>

<hr class="block-divider" class:dashed={style === 'dashed'} />

<style>
	.block-divider { border: none; border-top: 1px solid var(--border-subtle); margin: 2rem 0; }
	.block-divider.dashed { border-top-style: dashed; }
</style>
