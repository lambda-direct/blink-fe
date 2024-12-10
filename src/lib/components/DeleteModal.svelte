<script lang="ts">
	import Button from './ui/button/button.svelte';

	export let type: string = 'variable';
	export let name: string;
	export let onDelete: () => void;
	export let onCancel: () => void;
</script>

<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
	<div class="bg-card flex w-full max-w-md flex-col gap-6 rounded-lg p-6 text-start">
		<h2 class="text-xl">Delete {type}</h2>
		<p>
			Are you sure you want to delete <span class="text-[#853bce]">{name}</span> ? Once deleted, it will
			be gone forever
		</p>

		<div class="flex justify-end gap-4">
			<Button
				class="bg-accent border text-base font-normal text-white hover:bg-[#33323e]"
				on:click={onCancel}>Cancel</Button
			>
			<Button
				class="bg-[#b62d2b] border text-base font-normal text-white hover:bg-[#d85c5a]"
				on:click={onDelete}>Delete</Button
			>
		</div>
	</div>
</div>
