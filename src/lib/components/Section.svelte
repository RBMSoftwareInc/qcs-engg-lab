<script lang="ts">
	let { id, className = '' } = $props<{
		id?: string;
		className?: string;
	}>();
</script>

<section id={id} class="section {className}">
	<div class="container">
		<slot />
	</div>
</section>

<style>
	.section {
		padding: 4rem 0;
		position: relative;
	}

	.section:first-child {
		padding-top: 2rem;
	}

	.section:last-child {
		padding-bottom: 5rem;
	}

	@media (min-width: 768px) {
		.section {
			padding: 5rem 0;
		}
	}
</style>

