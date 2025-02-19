<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { writable } from 'svelte/store';
	import { createEnvironmentVariables, type EnvironmentVariable } from '../../../../api/services';
	import {
		Eye,
		EyeOff,
		Copy,
		Check,
		Plus,
		EllipsisVertical,
		Pencil,
		XIcon,
		Trash2Icon,
		Braces
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { tick } from 'svelte';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import { selectedInstanceId } from '../../../../stores/instanceStore';
	import { useEnvironmentVariables } from '../../../../queries/services';
	import RawEditor from './RawEditor.svelte';

	export let projectId: string;
	export let serviceId: string;

	let variables: EnvironmentVariable[] = [];
	let isAdding = false;
	let newVariableName = '';
	let newVariableValue = '';
	let addInput: HTMLInputElement;
	let editInput: HTMLInputElement;
	let editingVariableId: string | null = null;
	let editingValue = '';
	let showModal = false;
	let isRawEditorOpen = false;
	let selectedVariable: string | null = null;
	let isLoading: boolean = true;
	let restart = false;
	let isUpdating: boolean = false;

	$: queryVariables = $selectedInstanceId
		? useEnvironmentVariables($selectedInstanceId, projectId, serviceId)
		: null;

	$: {
		if ($queryVariables) {
			isLoading = !$queryVariables.isFetched;

			if (!$queryVariables.isError && $queryVariables.data) {
				variables = $queryVariables.data;
			} else {
				variables = [];
			}
		}
	}

	$: isSaveDisabled =
		variables.some((v) => v.name === newVariableName) ||
		!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newVariableName) ||
		!newVariableName ||
		!newVariableValue ||
		/\s/.test(newVariableValue);

	const showValueMap = writable(new Map<string, boolean>(variables.map((v) => [v.id, false])));
	const copiedMap = writable(new Map<string, boolean>());

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
			copiedMap.update((map) => {
				const newMap = new Map(map);
				newMap.set(id, true);
				return newMap;
			});

			setTimeout(() => {
				copiedMap.update((map) => {
					const newMap = new Map(map);
					newMap.set(id, false);
					return newMap;
				});
			}, 2000);
		} catch (error) {
			console.error('Failed to copy text:', error);
		}
	}

	async function startAdding() {
		isAdding = true;
		await tick();
		addInput?.focus();
	}

	async function finishAdding() {
		if (isSaveDisabled) return;
		isUpdating = true;
		try {
			await createEnvironmentVariables($selectedInstanceId!, projectId, serviceId, {
				environmentVariables: [
					...variables.map((v) => ({ name: v.name, value: v.value })),
					{
						name: newVariableName,
						value: newVariableValue
					}
				],
				restart
			});
			$queryVariables?.refetch();
			isAdding = false;
			newVariableName = '';
			newVariableValue = '';
		} catch (error) {
			console.error('Failed to add variable:', error);
		} finally {
			isUpdating = false;
		}
	}

	async function startEditing(id: string, currentValue: string) {
		editingVariableId = id;
		editingValue = currentValue;
		await tick();
		editInput?.focus();
	}

	async function finishEditing() {
		if (!editingVariableId || !editingValue || /\s/.test(editingValue)) return;
		isUpdating = true;
		try {
			await createEnvironmentVariables($selectedInstanceId!, projectId, serviceId, {
				environmentVariables: variables.map((v) =>
					v.id === editingVariableId ? { ...v, value: editingValue } : v
				),
				restart
			});
			$queryVariables?.refetch();
			editingVariableId = null;
			editingValue = '';
		} catch (error) {
			console.error('Failed to edit variable:', error);
		} finally {
			isUpdating = false;
		}
	}

	function handleOpenRawEditor() {
		isRawEditorOpen = true;
	}

	function handleCloseRawEditor() {
		isRawEditorOpen = false;
	}

	async function handleUpdateVariables(updatedVariables: { name: string; value: string }[]) {
		isUpdating = true;
		try {
			await createEnvironmentVariables($selectedInstanceId!, projectId, serviceId, {
				environmentVariables: updatedVariables,
				restart
			});
			$queryVariables?.refetch();
			handleCloseRawEditor();
		} catch (error) {
			console.error('Failed to update variables:', error);
		} finally {
			isUpdating = false;
		}
	}

	function openDeleteModal(variable: string) {
		selectedVariable = variable;
		showModal = true;
	}

	async function deleteVariable() {
		if (!selectedVariable) return;
		isUpdating = true;
		try {
			await createEnvironmentVariables($selectedInstanceId!, projectId, serviceId, {
				environmentVariables: variables.filter((v) => v.name !== selectedVariable),
				restart
			});
			$queryVariables?.refetch();
			selectedVariable = null;
			showModal = false;
		} catch (error) {
			console.error('Failed to delete variable:', error);
		} finally {
			isUpdating = false;
		}
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
				<span class="inline-block text-center">
					{#if isLoading}
						<span class="opacity-0">0</span>
					{:else}
						{variables.length}
					{/if}
				</span>
				Environment {variables.length === 1 ? 'Variable' : 'Variables'}
			</h2>
			<div class="flex gap-2">
				<Button
					class="hover:bg-accent flex h-9 items-center gap-1 bg-transparent px-3 text-sm font-normal text-[#A667E4]"
					on:click={handleOpenRawEditor}><Braces class="h-4 w-4" /> Raw Editor</Button
				>
				<Button
					class="hover:bg-accent flex h-9 items-center gap-1 border border-[#853bce] bg-transparent px-3 text-sm font-normal text-[#A667E4] hover:border-[#A667E4] hover:text-[#A667E4]"
					on:click={startAdding}><Plus class="h-4 w-4" /> New Variable</Button
				>
			</div>
		{:else}
			<input
				type="text"
				class="flex h-9 w-full items-center overflow-hidden rounded-lg border bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
				placeholder="VARIABLE_NAME"
				bind:value={newVariableName}
				bind:this={addInput}
				spellcheck="false"
			/>
			<input
				type="text"
				class="flex h-9 w-full items-center overflow-hidden rounded-lg border bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
				placeholder="VALUE"
				bind:value={newVariableValue}
				spellcheck="false"
			/>
			<Button
				class="hover:bg-accent h-9 w-[74px] flex-none items-center gap-1 rounded-lg border border-[#853bce] bg-transparent px-3 text-sm font-normal text-[#A667E4] hover:border-[#A667E4] hover:text-[#A667E4]"
				on:click={finishAdding}
				disabled={isSaveDisabled || isUpdating}
			>
				{#if isUpdating}
					<Circle size="16" color="#A667E4" />
				{:else}
					<Check class="h-4 w-4" />
					Add
				{/if}
			</Button>
			<Button
				class="hover:bg-accent flex h-9 items-center gap-1 rounded-lg border bg-transparent px-3 text-sm font-normal text-white"
				on:click={() => {
					isAdding = false;
					newVariableName = '';
					newVariableValue = '';
				}}>Cancel</Button
			>
		{/if}
	</div>
	<div class="space-y-2">
		{#if !isLoading}
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
							spellcheck="false"
						/>
						<button
							class="p-1 disabled:pointer-events-none disabled:opacity-50"
							on:click={finishEditing}
							disabled={/\s/.test(editingValue) || !editingValue || isUpdating}
						>
							{#if isUpdating}
								<Circle size="16" color="#A667E4" />
							{:else}
								<Check class="h-4 w-4 text-[#853bce] hover:text-[#A667E4]" />
							{/if}
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
		{/if}
		<div class="flex flex-col">
			<label class="flex items-center justify-end gap-2">
				<input
					type="checkbox"
					bind:checked={restart}
					class="h-4 w-4 accent-[#853bce] opacity-30 checked:opacity-100"
				/>
				<p class="text-neutral-400">Restart Service After Update</p>
			</label>
		</div>
		{#if isLoading}
			<div class="flex h-12 items-center justify-center">
				<Circle size="24" color="#4B5563" />
			</div>
		{/if}
	</div>
	{#if isRawEditorOpen}
		<RawEditor
			{variables}
			onUpdate={handleUpdateVariables}
			onCancel={handleCloseRawEditor}
			isLoading={isUpdating}
		/>
	{/if}
	{#if showModal && selectedVariable}
		<DeleteModal
			type="variable"
			name={selectedVariable}
			onDelete={deleteVariable}
			onCancel={cancelDelete}
			isLoading={isUpdating}
		/>
	{/if}
</div>
