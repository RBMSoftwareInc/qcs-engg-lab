<script lang="ts">
	let { text, position = 'top' } = $props<{
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
	}>();
</script>

<div class="tooltip" data-position={position}>
	{@render children()}
	<span class="tooltip-text">{text}</span>
</div>

<style>
	.tooltip {
		position: relative;
		display: inline-block;
	}

	.tooltip-text {
		visibility: hidden;
		opacity: 0;
		background-color: rgba(0, 0, 0, 0.9);
		color: #fff;
		text-align: center;
		border-radius: 6px;
		padding: 6px 10px;
		position: absolute;
		z-index: 1000;
		font-size: 0.75rem;
		white-space: nowrap;
		pointer-events: none;
		transition: opacity 0.2s, visibility 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.tooltip[data-position="top"] .tooltip-text {
		bottom: 125%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 5px;
	}

	.tooltip[data-position="top"] .tooltip-text::after {
		content: "";
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
	}

	.tooltip[data-position="bottom"] .tooltip-text {
		top: 125%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 5px;
	}

	.tooltip[data-position="bottom"] .tooltip-text::after {
		content: "";
		position: absolute;
		bottom: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: transparent transparent rgba(0, 0, 0, 0.9) transparent;
	}

	.tooltip[data-position="left"] .tooltip-text {
		right: 125%;
		top: 50%;
		transform: translateY(-50%);
		margin-right: 5px;
	}

	.tooltip[data-position="left"] .tooltip-text::after {
		content: "";
		position: absolute;
		left: 100%;
		top: 50%;
		margin-top: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: transparent transparent transparent rgba(0, 0, 0, 0.9);
	}

	.tooltip[data-position="right"] .tooltip-text {
		left: 125%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: 5px;
	}

	.tooltip[data-position="right"] .tooltip-text::after {
		content: "";
		position: absolute;
		right: 100%;
		top: 50%;
		margin-top: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: transparent rgba(0, 0, 0, 0.9) transparent transparent;
	}

	.tooltip:hover .tooltip-text {
		visibility: visible;
		opacity: 1;
	}
</style>
