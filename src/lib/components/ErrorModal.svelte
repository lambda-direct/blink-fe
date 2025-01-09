<script lang="ts">
	import { onMount } from 'svelte';
	import { CircleAlert } from 'lucide-svelte';

	export let errorMessage: string = 'Invalid format';
	export let showError: boolean = false;
	let showErrorMessage = true;

	const handleShowErrorClick = () => {
		showErrorMessage = !showErrorMessage;
	};

	const handleEnterClick = (event: KeyboardEvent) => {
		event.preventDefault();
		if (event.key === 'Enter') {
			handleShowErrorClick();
		}
	};

	onMount(() => {
		setTimeout(() => {
			showErrorMessage = false;
		}, 5000);
	});
</script>

{#if showError}
	<div
		role="button"
		tabindex="0"
		aria-labelledby="showErrorMessage"
		aria-label="showErrorMessage"
		on:click={handleShowErrorClick}
		on:keydown={handleEnterClick}
		class="modal"
		class:gap={showErrorMessage}
	>
		<p class="title">
			{#if showErrorMessage}
				{errorMessage}
			{/if}
		</p>
		<CircleAlert color={'#eaeaea'} />
	</div>
{/if}

<style>
	.title {
		color: #eaeaea;
		font-size: 14px;
		/* font-family: 'JetBrainsMono-Regular', monospace; */
	}

	.modal {
		display: flex;
		align-items: center;
		flex-direction: row-reverse;
		padding: 12px;
		background: #8f2626;
		border-radius: 4px;
		bottom: 0px;
		position: absolute;
		right: 10px;
		z-index: 5;
		cursor: pointer;
		animation: floatIn 0.3s ease-in-out 0s forwards;
	}

	.gap {
		gap: 4px;
	}

	@keyframes floatIn {
		to {
			bottom: 10px;
		}
	}
</style>
