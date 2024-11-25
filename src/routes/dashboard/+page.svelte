<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import type { GetProjectsResponse } from '../../api/projects';
	import { useProjects } from '../../queries/projects';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Check, ChevronDown, Pencil, PlusCircle } from 'lucide-svelte';

	let projects: GetProjectsResponse['projects'] = [];
	let servicesCountMap: { [key: string]: number } = {};
	let items: string[] = ['VPS1', 'VPS2', 'VPS3'];
	let selectedItem: string = items[0];
	let isEditing: boolean = false;
	let editItemName: string = '';

	function handleSelectVPS(item: string) {
		selectedItem = item;
	}

	function handleRenameClick() {
		isEditing = true;
		editItemName = '';
	}

	function handleCancelEdit() {
		isEditing = false;
		editItemName = '';
	}

	function handleUpdateItem() {
		const newItemName = editItemName.trim().replace(/\s+/g, ' ');
		if (newItemName) {
			const index = items.indexOf(selectedItem);
			if (index !== -1) {
				items[index] = newItemName;
				selectedItem = newItemName;
			}
		}
		handleCancelEdit();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancelEdit();
		} else if (event.key === 'Enter') {
			handleUpdateItem();
		} else {
			event.stopPropagation();
		}
	}

	$: queryProjects = useProjects(true);
	$: if ($queryProjects.data) {
		projects = $queryProjects.data.projects;
		servicesCountMap = $queryProjects.data.servicesCountMap;
	}
</script>

<section class="mx-auto mt-10 flex max-w-screen-lg flex-col">
	<!-- <DropdownMenu.Root closeOnItemClick={false} onOutsideClick={handleCancelEdit}>
		<DropdownMenu.Trigger class="mx-auto flex items-center gap-2 text-3xl outline-none">
			{selectedItem}
			<ChevronDown class="h-5 w-5 text-gray-600" />
		</DropdownMenu.Trigger>

		<DropdownMenu.Content class="w-fit min-w-52">
			{#each items as item}
				<DropdownMenu.Item
					on:click={() => handleSelectVPS(item)}
					class="flex items-center justify-between gap-4 text-base 
					 text-gray-400 hover:text-white
					 {item === selectedItem ? 'text-white' : ''}"
				>
					{item}
					{#if item === selectedItem}
						<Check class="h-4 w-4" />
					{/if}
				</DropdownMenu.Item>
			{/each}

			<DropdownMenu.DropdownMenuSeparator />

			{#if isEditing}
				<DropdownMenu.Item class="bg-accent relative text-base">
					svelte-ignore a11y-autofocus
					<input
						id="renameInput"
						type="text"
						class="bg-accent placeholder-grey-400 outline-none w-full"
						placeholder={selectedItem}
						bind:value={editItemName}
						on:focusout={() => document.getElementById('renameInput')?.focus()}
						on:keydown={handleKeydown}
						autofocus
					/>
				</DropdownMenu.Item>
			{:else}
				<DropdownMenu.Item
					class="flex items-center gap-2 text-base"
					on:click={handleRenameClick}
				>
					<Pencil class="h-4 w-4" />
					Rename
				</DropdownMenu.Item>
			{/if}

			<DropdownMenu.Item class="flex items-center gap-2 text-base" on:click={() => {}}>
				<PlusCircle class="h-4 w-4" />
				New VPS
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root> -->
	<span class="text-xl">Projects</span>
	<p class="text-sm text-neutral-400">Manage your projects</p>

	{#if projects.length > 0}
		<div class="mt-4 grid h-full grid-cols-3 gap-4 overflow-auto border-t pt-4">
			{#each projects as project}
				<ProjectCard {project} servicesCount={servicesCountMap[project.id]} />
			{/each}
		</div>
	{:else}
		<p class="mt-4 border-t pt-4 text-center text-xl font-medium">No projects found</p>
	{/if}
</section>
