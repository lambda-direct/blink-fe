<script lang="ts">
	import { onMount } from 'svelte';
	import { CircleAlert } from 'lucide-svelte';
	import { errorStore } from '../../stores/errorStore';

	export let errorType: 'general' | 'variable' = 'general';
	export let errorMessage: string = 'Invalid format';
	export let showError: boolean = false;

	let showErrorMessage = true;
	let message: string;
	let show: boolean;

	$: {
		if (errorType === 'general') {
			const store = $errorStore;
			message = store.errorMessage;
			show = store.showError;
		} else if (errorType === 'variable') {
			message = errorMessage;
			show = showError;
		}
	}

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

{#if show}
	<div
		role="button"
		tabindex="0"
		aria-labelledby="showErrorMessage"
		aria-label="showErrorMessage"
		on:click={handleShowErrorClick}
		on:keydown={handleEnterClick}
		class="modal"
		class:gap={showErrorMessage}
		class:general-error={errorType === 'general'}
		class:variable-error={errorType === 'variable'}
	>
		<p class="title">
			{#if showErrorMessage}
				{message}
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
		position: absolute;
		z-index: 5;
		cursor: pointer;
	}

	.modal.variable-error {
		bottom: 0px;
		right: 10px;
		animation: floatInVariable 0.3s ease-in-out 0s forwards;
	}

	.modal.general-error {
		top: 0px;
		right: 24px;
		animation: floatInGeneral 0.3s ease-in-out 0s forwards;
	}

	.gap {
		gap: 4px;
	}

	@keyframes floatInVariable {
		to {
			bottom: 10px;
		}
	}

	@keyframes floatInGeneral {
		to {
			top: 70px;
		}
	}
</style>
