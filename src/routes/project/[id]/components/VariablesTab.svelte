<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { writable } from 'svelte/store';
	import type { GetServiceResponse } from '../../../../api/services';
	import {
		Eye,
		EyeOff,
		Copy,
		Check,
		Plus,
		EllipsisVertical,
		Pencil,
		XIcon,
		TrashIcon,
		Trash2Icon
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { tick } from 'svelte';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	export let variables: GetServiceResponse['environmentVariables'] = [];

	// type EnvironmentVariable = GetServiceResponse['environmentVariables'][0];

	const showValueMap = writable(new Map<string, boolean>(variables.map((v) => [v.id, false])));
	const copiedMap = writable(new Map<string, boolean>());

	let isAdding = false;
	let newVariableName = '';
	let newVariableValue = '';
	let addInput: HTMLInputElement;
	let editInput: HTMLInputElement;
	let editingVariableId: string | null = null;
	let editingValue = '';
	let showModal = false;
	let selectedVariable: string | null = null;

	function toggleShowValue(id: string) {
		showValueMap.update((currentMap) => {
			variables.forEach((v) => {
				if (v.id !== id) {
					currentMap.set(v.id, false);
				}
			});

			const currentShow = currentMap.get(id) || false;
			currentMap.set(id, !currentShow);

			if (!currentShow) {
				setTimeout(() => {
					currentMap.set(id, false);
					showValueMap.set(currentMap);
				}, 10000);
			}

			return currentMap;
		});
	}

	async function copyToClipboard(id: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copiedMap.update((currentMap) => {
				currentMap.set(id, true);
				return currentMap;
			});

			setTimeout(() => {
				copiedMap.update((currentMap) => {
					currentMap.set(id, false);
					return currentMap;
				});
			}, 2000);
		} catch (error) {
			console.error('Failed to copy text: ', error);
		}
	}

	async function startAdding() {
		isAdding = true;
		await tick();
		if (addInput) {
			addInput.focus();
		}
	}

	async function stopAdding() {
		isAdding = false;
		newVariableName = '';
		newVariableValue = '';
	}

	async function startEditing(id: string, currentValue: string) {
		editingVariableId = id;
		editingValue = currentValue;
		await tick();
		if (editInput) {
			editInput.focus();
		}
	}

	function openDeleteModal(variable: string) {
		selectedVariable = variable;
		showModal = true;
	}

	function deleteVariable() {
		showModal = false;
		selectedVariable = null;
	}

	function cancelDelete() {
		showModal = false;
		selectedVariable = null;
	}
</script>

<div class="flex flex-col pt-4">
	<div class="mb-4 flex items-center justify-between gap-2 border-b pb-4">
		{#if !isAdding}
			<h2 class="text-xl font-medium text-neutral-400">
				{variables.length} Environment
				{variables.length === 1 ? 'Variable' : 'Variables'}
			</h2>
			<Button
				class="hover:bg-accent flex h-9 items-center gap-1 border border-[#853bce] bg-transparent px-3 text-sm font-normal text-[#A667E4] hover:border-[#A667E4] hover:text-[#A667E4]"
				on:click={startAdding}><Plus class="h-4 w-4" /> New Variable</Button
			>
		{:else}
			<input
				type="text"
				class="flex h-9 w-full items-center overflow-hidden rounded-lg border bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
				placeholder="VARIABLE_NAME"
				bind:value={newVariableName}
				bind:this={addInput}
			/>
			<input
				type="text"
				class="flex h-9 w-full items-center overflow-hidden rounded-lg border bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
				placeholder="VALUE"
				bind:value={newVariableValue}
			/>
			<Button
				class="hover:bg-accent flex h-9 items-center gap-1 rounded-lg border border-[#853bce] bg-transparent px-3 text-sm font-normal text-[#A667E4] hover:border-[#A667E4] hover:text-[#A667E4]"
				on:click={stopAdding}
				disabled={!newVariableName || !newVariableValue}><Check class="h-4 w-4" />Add</Button
			>
			<Button
				class="hover:bg-accent flex h-9 items-center gap-1 rounded-lg border bg-transparent px-3 text-sm font-normal text-white"
				on:click={stopAdding}>Cancel</Button
			>
		{/if}
	</div>
	<div class="space-y-2">
		{#each variables as { name, value, id }}
			<div class="group/item flex w-full gap-2">
				<div
					class="group-hover/item:bg-accent flex h-9 w-full items-center overflow-hidden rounded-lg border px-6 text-sm"
				>
					<span class="truncate">{name}</span>
				</div>
				{#if editingVariableId === id}
					<input
						type="text"
						class="group-hover/item:bg-accent flex h-9 w-full items-center overflow-hidden rounded-lg border bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
						bind:value={editingValue}
						bind:this={editInput}
					/>
					<button
						class="p-1"
						on:click={() => {
							editingVariableId = null;
							editingValue = '';
						}}
					>
						<Check class="h-4 w-4 text-[#853bce] hover:text-[#A667E4]" />
					</button>
					<button
						class="p-1"
						on:click={() => {
							editingVariableId = null;
							editingValue = '';
						}}
					>
						<XIcon class="h-4 w-4 text-neutral-400 hover:text-white" />
					</button>
				{:else}
					<div
						class="group-hover/item:bg-accent flex h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-lg border px-6 text-sm"
					>
						<div class="truncate">
							{#if $showValueMap.get(id)}
								{value}
							{:else}
								<span>*****</span>
							{/if}
						</div>
						<div class="hidden gap-1 text-neutral-400 group-hover/item:flex">
							<button class="p-1" on:click={() => toggleShowValue(id)} aria-label="show value">
								{#if $showValueMap.get(id)}
									<Eye class="h-4 w-4 hover:text-white" />
								{:else}
									<EyeOff class="h-4 w-4 hover:text-white" />
								{/if}
							</button>
							<button
								class="p-1"
								on:click={() => copyToClipboard(id, value)}
								aria-label="copy to clipboard"
							>
								{#if $copiedMap.get(id)}
									<Check class="h-4 w-4" />
								{:else}
									<Copy class="h-4 w-4 hover:text-white" />
								{/if}
							</button>
						</div>
					</div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="outline-none">
							<EllipsisVertical class="h-4 w-4 text-neutral-400 group-hover/item:text-white" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item
								class="flex items-center gap-2 text-base"
								on:click={() => startEditing(id, value)}
							>
								<Pencil class="h-4 w-4" />
								Edit
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="flex items-center gap-2 text-base"
								style="color: #b62d2b;"
								on:click={() => openDeleteModal(name)}
							>
								<Trash2Icon class="h-4 w-4" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
			</div>
		{/each}
	</div>
	{#if showModal && selectedVariable}
		<DeleteModal
			type="variable"
			name={selectedVariable}
			onDelete={deleteVariable}
			onCancel={cancelDelete}
		/>
	{/if}
</div>
