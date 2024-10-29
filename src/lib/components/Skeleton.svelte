<script lang="ts">
	export let width: number = 300;
</script>

<div class="skeleton-loader" style="height: {width}px;"></div>

<style>
	.skeleton-loader {
		width: 100%;
		background: linear-gradient(
			90deg,
			rgba(19, 17, 28, 0.7) 10%,
			rgb(31, 41, 55) 50%,
			rgba(19, 17, 28, 0.65) 90%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite linear;
		border-radius: 4px;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
</style>
