<script lang="ts">
	import CircleIcon from './CircleIcon.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Button from '$lib/components/ui/button/button.svelte';
	import { EllipsisVertical, Pencil, Plus, Trash2Icon } from 'lucide-svelte';
	import {
		createBindMount,
		deleteBindMount,
		updateBindMount,
		type BindMount
	} from '../../../../api/services';
	import { selectedInstanceId } from '../../../../stores/instanceStore';
	import { useBindMounts } from '../../../../queries/services';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import { createEventDispatcher } from 'svelte';
	import { Circle } from 'svelte-loading-spinners';

	export let projectId: string;
	export let serviceId: string;

	const dispatch = createEventDispatcher();

	let mounts: BindMount[] = [];
	let isLoading: boolean = true;
	let restart = false;
	let showModal = false;
	let isUpdating = false;
	let isBindMountAdding = false;
	let isBindMountEditing = false;
	let selectedBindMount: string | null = null;
	let editingBindMountId: string | null = null;
	let editingSourcePath = '';
	let editingDestinationPath = '';
	let initialSourcePath = '';
	let initialDestinationPath = '';

	$: queryBindMounts = $selectedInstanceId
		? useBindMounts($selectedInstanceId, projectId, serviceId)
		: null;
	$: {
		if ($queryBindMounts) {
			isLoading = $queryBindMounts.isFetching;
			if ($queryBindMounts.data) {
				mounts = $queryBindMounts.data;
				isLoading = false;
			}
		}
	}

	function openDeleteModal(bindMount: string) {
		selectedBindMount = bindMount;
		showModal = true;
	}
	function closeDeleteModal() {
		showModal = false;
		selectedBindMount = null;
	}

	async function handleDeleteBindMount() {
		if (!selectedBindMount || !$selectedInstanceId) return;
		isUpdating = true;
		try {
			await deleteBindMount(
				$selectedInstanceId,
				projectId,
				serviceId,
				selectedBindMount,
				restart ? 'true' : 'false'
			);
			$queryBindMounts?.refetch();
			dispatch('refreshService');
			closeDeleteModal();
		} catch (error) {
			console.error('Failed to delete bind mount:', error);
		} finally {
			isUpdating = false;
		}
	}

	function startEditing(bindMount: { id: string; sourcePath: string; destinationPath: string }) {
		isBindMountEditing = true;
		editingBindMountId = bindMount.id;
		editingSourcePath = bindMount.sourcePath;
		editingDestinationPath = bindMount.destinationPath;
		initialSourcePath = bindMount.sourcePath;
		initialDestinationPath = bindMount.destinationPath;
	}
	async function handleSaveBindMount() {
		if (!editingBindMountId || !$selectedInstanceId) return;
		isUpdating = true;
		try {
			await updateBindMount(
				$selectedInstanceId,
				projectId,
				serviceId,
				editingBindMountId,
				{
					bindMount: {
						sourcePath: editingSourcePath,
						destinationPath: editingDestinationPath
					}
				},
				restart
			);
			$queryBindMounts?.refetch();
			cancelEditing();
		} catch (error) {
			console.error('Failed to update bind mount:', error);
		} finally {
			isUpdating = false;
		}
	}

	function cancelEditing() {
		isBindMountEditing = false;
		editingBindMountId = null;
		editingSourcePath = '';
		editingDestinationPath = '';
	}

	function startAdding() {
		isBindMountAdding = true;
		isBindMountEditing = false;
		editingSourcePath = '';
		editingDestinationPath = '';
	}

	async function handleAddBindMount() {
		if (!$selectedInstanceId) return;
		isUpdating = true;
		try {
			await createBindMount($selectedInstanceId, projectId, serviceId, {
				bindMount: {
					sourcePath: editingSourcePath,
					destinationPath: editingDestinationPath
				},
				restart
			});
			$queryBindMounts?.refetch();
			dispatch('refreshService');
			cancelAdding();
		} catch (error) {
			console.error('Failed to create bind mount:', error);
		} finally {
			isUpdating = false;
		}
	}

	function cancelAdding() {
		isBindMountAdding = false;
		editingSourcePath = '';
		editingDestinationPath = '';
	}

	$: hasChanges =
		editingSourcePath !== initialSourcePath || editingDestinationPath !== initialDestinationPath;

	$: isSaveDisabled =
		!editingSourcePath.match(/^[^\0]+$/) ||
		!editingDestinationPath.match(/^[^\0]+$/) ||
		!hasChanges ||
		mounts.some((m) => m.destinationPath === editingDestinationPath && m.id !== editingBindMountId);

	$: isAddDisabled =
		!editingSourcePath.match(/^[^\0]+$/) ||
		!editingDestinationPath.match(/^[^\0]+$/) ||
		mounts.some((m) => m.destinationPath === editingDestinationPath);
</script>

<div class="flex flex-col pt-4">
	<div class="flex flex-col gap-4">
		<div class="flex items-center justify-between gap-6 border-b pb-4 text-neutral-400">
			<div class="flex items-center gap-6">
				<CircleIcon />
				<h2 class="text-xl font-medium">Connection</h2>
			</div>
			<Button
				class="hover:bg-accent flex h-9 items-center gap-1 border border-[#853bce] bg-transparent px-3 text-sm font-normal text-[#A667E4] hover:border-[#A667E4] hover:text-[#A667E4]"
				on:click={startAdding}><Plus class="h-4 w-4" /> New Bind Mount</Button
			>
		</div>
		{#if isLoading}
			<div class="flex h-12 items-center justify-center">
				<Circle size="24" color="#4B5563" />
			</div>
		{:else}
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
			{#if isBindMountAdding}
				<div class="bg-accent mb-2 flex flex-col gap-4 rounded-lg border p-6">
					<div class="ml-10 flex flex-col gap-4 text-sm">
						<p class="text-neutral-400">Source Path</p>
						<input
							type="text"
							bind:value={editingSourcePath}
							class="flex min-h-14 w-full items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
					</div>
					<div class="ml-10 flex flex-col gap-4 text-sm">
						<p class="text-neutral-400">Destination Path</p>
						<input
							type="text"
							bind:value={editingDestinationPath}
							class="flex min-h-14 w-full items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
					</div>
					<div class="ml-10 mt-3 flex items-end justify-end gap-2">
						<Button
							class="flex h-9 items-center gap-1 border bg-transparent text-sm text-white hover:bg-[#33323e]"
							on:click={cancelAdding}
						>
							Cancel
						</Button>
						<Button
							class="flex h-9 min-w-[135px] items-center gap-1 bg-[#853bce] px-3 text-sm text-white hover:bg-[#A667E4]"
							on:click={handleAddBindMount}
							disabled={isAddDisabled || isUpdating}
						>
							{#if isUpdating}
								<Circle size="16" color="white" />
							{:else}
								Add Bind Mount
							{/if}
						</Button>
					</div>
				</div>
			{/if}
			{#each mounts as mount}
				<div class="bg-accent boreder group/item relative mb-2 flex flex-col gap-4 rounded-lg p-6">
					{#if !isBindMountEditing && editingBindMountId !== mount.id}
						<div class="absolute right-6 top-6">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger class="outline-none">
									<EllipsisVertical
										class="h-4 w-4 text-neutral-400 opacity-0 group-hover/item:opacity-100"
									/>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" class="bg-accent">
									<DropdownMenu.Item
										class="flex items-center gap-2 text-base hover:bg-[#33323e]"
										on:click={() => startEditing(mount)}
									>
										<Pencil class="h-4 w-4" />
										Edit
									</DropdownMenu.Item>
									<DropdownMenu.Item
										class="flex items-center gap-2 text-base hover:bg-[#33323e]"
										style="color: #b62d2b;"
										on:click={() => openDeleteModal(mount.id)}
									>
										<Trash2Icon class="h-4 w-4" />
										Delete
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>{/if}
					{#if isBindMountEditing && editingBindMountId === mount.id}
						<div class="ml-10 flex flex-col gap-4 overflow-x-auto text-nowrap text-sm">
							<p class="text-neutral-400">Source Path</p>
							<input
								type="text"
								bind:value={editingSourcePath}
								class="flex min-h-14 w-full items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
						</div>
						<div class="ml-10 flex flex-col gap-4 text-sm">
							<p class="text-neutral-400">Destination Path</p>
							<input
								type="text"
								bind:value={editingDestinationPath}
								class="flex min-h-14 w-full items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
						</div>
						<div class="ml-10 mt-3 flex items-end justify-end gap-2">
							<Button
								class="flex h-9 items-center gap-1 border bg-transparent text-sm text-white hover:bg-[#33323e]"
								on:click={cancelEditing}
							>
								Cancel
							</Button>
							<Button
								class="flex h-9 min-w-[160px] items-center gap-1 bg-[#853bce] px-3 text-sm text-white hover:bg-[#A667E4]"
								on:click={handleSaveBindMount}
								disabled={isSaveDisabled || isUpdating}
							>
								{#if isUpdating}
									<Circle size="16" color="white" />
								{:else}
									Update Bind Mount
								{/if}
							</Button>
						</div>
					{:else}
						{#if mount.sourcePath}
							<div class="ml-10 flex flex-col gap-4 overflow-x-auto text-nowrap text-sm">
								<p class="text-neutral-400">Source Path</p>
								<div class="h-fit min-h-14 rounded-lg border p-5">{mount.sourcePath}</div>
							</div>
						{/if}

						{#if mount.destinationPath}
							<div class="overflow-x-autotext-nowrap ml-10 flex flex-col gap-4 text-sm">
								<p class="text-neutral-400">Destination Path</p>
								<div class="h-fit min-h-14 rounded-lg border p-5">{mount.destinationPath}</div>
							</div>
						{/if}
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
{#if showModal && selectedBindMount}
	<DeleteModal
		type="bind mount"
		onDelete={handleDeleteBindMount}
		onCancel={closeDeleteModal}
		isLoading={isUpdating}
	/>
{/if}
