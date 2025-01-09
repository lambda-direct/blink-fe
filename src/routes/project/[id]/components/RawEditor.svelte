<script lang="ts">
	import CodeMirror from '$lib/components/CodeMirror/CodeMirror.svelte';
	import { getValue } from '$lib/components/CodeMirror/helper';
	import type { FormatError } from '$lib/components/CodeMirror/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Copy } from 'lucide-svelte';

	export let variables: { name: string; value: string }[] = [];
	export let onUpdate: (
		updatedVariables: { name: string; value: string }[],
		restart: boolean
	) => void;
	export let onCancel: () => void;

	let validatedVariables: { name: string; value: string }[] = [...variables];
	let errors: FormatError[] = [];
	let format: 'env' | 'json' = 'env';
	let copySuccess = false;
	let restart = false;

	const handleUpdateVariables = (event: CustomEvent<{ name: string; value: string }[]>) => {
		validatedVariables = event.detail;
	};

	const handleErrors = (event: CustomEvent<FormatError[]>) => {
		errors = event.detail;
	};

	const handleUpdate = () => {
		if (JSON.stringify(validatedVariables) !== JSON.stringify(variables)) {
			onUpdate(validatedVariables, restart);
		} else onCancel();
	};

	const copyToClipboard = async () => {
		const dataString = getValue(format, validatedVariables);
		try {
			await navigator.clipboard.writeText(dataString);
			copySuccess = true;
			setTimeout(() => (copySuccess = false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};
</script>

<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
	<div class="bg-card flex w-full max-w-2xl flex-col gap-4 rounded-lg p-6 text-start">
		<div class="flex justify-between">
			<h2 class="text-xl">Raw Editor</h2>
		</div>
		<CodeMirror
			{variables}
			on:errors={handleErrors}
			on:update={handleUpdateVariables}
			on:formatChange={(event) => (format = event.detail)}
		/>
		<label class="mr-1 flex items-center justify-end gap-2">
			<input
				type="checkbox"
				bind:checked={restart}
				class="h-4 w-4 accent-[#853bce] opacity-25 checked:opacity-100"
			/>
			<span>Restart service</span>
		</label>
		<div class="flex justify-between gap-4">
			<Button
				class="hover:bg-accent flex h-9 items-center gap-1 bg-transparent px-3 font-normal text-[#A667E4] hover:text-[#A667E4]"
				on:click={copyToClipboard}
			>
				<Copy class="h-4 w-4" />
				{copySuccess ? 'Copied!' : `Copy ${format === 'env' ? 'ENV' : 'JSON'}`}
			</Button>
			<div class="flex gap-2">
				<Button
					class="bg-accent h-9 border font-normal text-white hover:bg-[#33323e]"
					on:click={onCancel}>Cancel</Button
				>
				<Button
					class="h-9 border bg-[#853bce] font-normal text-white hover:bg-[#A667E4]"
					on:click={handleUpdate}
					disabled={errors.length > 0}>Update Variables</Button
				>
			</div>
		</div>
	</div>
</div>
