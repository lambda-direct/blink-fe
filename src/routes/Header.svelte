<script lang="ts">
	import { Check, ChevronDown, LogOut, Pencil } from 'lucide-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { GetProjectsResponse } from '../api/projects';
	import type { Response, RequestBody } from '../api/instance';
	import { useProjects } from '../queries/projects';
	import { getUser, type UserResponse } from '../api/user';
	import { useInstances } from '../queries/instances';
	import { setInstanceId } from '../stores/instanceStore';
	import { patchInstanceById } from '../api/instance';

	let instances: Response['instances'] = [];
	let selectedInstanceId: string | null = null;
	let isEditing: boolean = false;
	let editItemName: string = '';
	let selectedProjectId: Selected<string>;
	let projects: GetProjectsResponse['projects'] = [];
	let user: UserResponse['user'] | null = null;
	let isAuthenticated = false;
	let projectId: string | null = null;

	if (typeof window !== 'undefined') {
		isAuthenticated = !!localStorage.getItem('accessToken');
	}

	$: queryInstances = useInstances();
	$: selectedInstance = instances.find((instance) => instance.id === selectedInstanceId);
	$: if ($queryInstances.data) {
		instances = $queryInstances.data.instances;
		if (instances.length > 0) {
			const selectedInstance = instances.reduce((prev, curr) => {
				if (curr.lastLoginAt && (!prev.lastLoginAt || curr.lastLoginAt > prev.lastLoginAt)) {
					return curr;
				}
				return prev;
			}, instances[0]);

			selectedInstanceId = selectedInstance.id;
			setInstanceId(selectedInstanceId);
		}
	}

	function handleSelectInstance(id: string) {
		selectedInstanceId = id;
		setInstanceId(id);
	}

	function handleRenameClick() {
		if (selectedInstance) {
			isEditing = true;
			editItemName = selectedInstance.name;
		}
	}

	function handleCancelEdit() {
		isEditing = false;
		editItemName = '';
	}

	async function handleUpdateItem() {
		const newItemName = editItemName.trim().replace(/\s+/g, ' ');
		if (newItemName && selectedInstanceId) {
			const data: RequestBody = { name: newItemName };
			try {
				await patchInstanceById(selectedInstanceId, data);
				const instanceIndex = instances.findIndex((instance) => instance.id === selectedInstanceId);
				if (instanceIndex !== -1) {
					instances[instanceIndex] = { ...instances[instanceIndex], name: newItemName };
				}
			} catch (error) {
				console.error(error);
			} finally {
				handleCancelEdit();
			}
		}
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

	$: queryProjects = selectedInstanceId ? useProjects(selectedInstanceId, true) : null;
	$: {
		if ($queryProjects?.data) {
			projects = $queryProjects.data.projects;
		}
	}
	$: {
		if ($page.url.pathname.startsWith('/project/') && $page.params.id) {
			projectId = $page.params.id;
			selectedProjectId = { value: projectId };
		} else {
			projectId = null;
		}
	}

	function getInitials(name: string): string {
		return name.charAt(0).toUpperCase();
	}

	function handleLogout() {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		goto('/');
		window.location.reload();
	}

	function handleSelectProject(option: Selected<string> | undefined) {
		if (!option) return;
		const newProjectId = option.value;
		if (newProjectId !== selectedProjectId?.value) {
			selectedProjectId = { value: newProjectId };
			goto(`/project/${newProjectId}`);
		}
	}

	$: currentPath = $page.url.pathname;

	onMount(async () => {
		if (isAuthenticated) {
			try {
				const response = await getUser();
				user = response.user;
			} catch (error) {
				console.error(error);
			}
		}
	});
</script>

<header class="mx-auto grid items-center py-4">
	{#if isAuthenticated}
		<nav class="relative w-full border-b">
			<div class="mx-auto flex max-w-screen-lg items-center justify-end">
				<a
					href="/dashboard"
					class="relative h-10 px-4 py-2 font-medium transition-colors hover:text-white {currentPath ===
					'/dashboard'
						? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
						: 'text-neutral-400'}"
				>
					Dashboard
				</a>
				<a
					href="/statistics"
					class="relative h-10 px-4 py-2 font-medium transition-colors hover:text-white {currentPath ===
					'/statistics'
						? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
						: 'text-neutral-400'}"
				>
					Statistics
				</a>
				<a
					href="/logs"
					class="relative h-10 px-4 py-2 font-medium transition-colors hover:text-white {currentPath ===
					'/logs'
						? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
						: 'text-neutral-400'}"
				>
					Logs
				</a>
			</div>
			<div class="absolute left-24 top-0 flex h-10 items-center gap-1">
				{#if selectedInstance}
					<span class="mr-2 text-gray-600">/</span>
					<DropdownMenu.Root closeOnItemClick={false} onOutsideClick={handleCancelEdit}>
						<DropdownMenu.Trigger class="mx-auto flex items-center gap-2 outline-none">
							{selectedInstance.name}
							<ChevronDown class="h-5 w-5 text-gray-600" />
						</DropdownMenu.Trigger>

						<DropdownMenu.Content class="w-fit min-w-52 mt-2">
							{#each instances as instance}
								<DropdownMenu.Item
									on:click={() => handleSelectInstance(instance.id)}
									class="flex items-center gap-2 text-base 
					 text-gray-400 hover:text-white
					  {instance.id === selectedInstanceId ? 'text-white' : ''}"
								>
									<div class="h-4 w-4">
										{#if instance.id === selectedInstanceId}
											<Check class="h-4 w-4" />
										{/if}
									</div>
									{instance.name}
								</DropdownMenu.Item>
							{/each}

							<DropdownMenu.DropdownMenuSeparator />

							{#if isEditing}
								<DropdownMenu.Item class="bg-accent relative text-base">
									<!-- svelte-ignore a11y-autofocus -->
									<input
										id="renameInput"
										type="text"
										class="bg-accent placeholder-grey-400 w-full outline-none"
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

							<!-- <DropdownMenu.Item class="flex items-center gap-2 text-base" on:click={() => {}}>
				<PlusCircle class="h-4 w-4" />
				New VPS
			</DropdownMenu.Item> -->
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
				{#if projectId}
					<span class="text-gray-600">/</span>
					<Select.Root selected={selectedProjectId} onSelectedChange={handleSelectProject}>
						<Select.Trigger
							class="flex w-fit min-w-48 items-center justify-start gap-2 border-none bg-transparent"
						>
							{projects.find((project) => project.id === selectedProjectId.value)?.name || ''}
						</Select.Trigger>

						<Select.Content>
							{#each projects as project}
								<Select.Item value={project.id}>{project.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>
			{#if user}
				<div class="absolute right-6 -top-1 flex h-10 items-center">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Avatar.Root class="h-8 w-8">
								{#if user.avatarUrl}
									<Avatar.Image src={user.avatarUrl} alt="User Avatar" />
								{:else if user.name}
									<Avatar.Fallback class="bg-[#33323e] text-sm text-white">
										{getInitials(user.name)}
										MK
									</Avatar.Fallback>
								{/if}
							</Avatar.Root>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="mt-2 w-fit min-w-56  overflow-hidden" align="end">
							<div class="w-54 bg-accent m-2 flex flex-col items-center gap-4 rounded-lg p-6">
								<Avatar.Root class="h-16 w-16">
									{#if user.avatarUrl}
										<Avatar.Image src={user.avatarUrl} alt="User Avatar" />
									{:else if user.name}
										<Avatar.Fallback class="bg-[#33323e] text-lg text-white">
											{getInitials(user.name)}
											MK
										</Avatar.Fallback>
									{/if}
								</Avatar.Root>
								<span class="font-semibold">{user.name}</span>
								<span class="text-sm text-neutral-400">{user.email}</span>
							</div>
							<DropdownMenu.DropdownMenuSeparator />
							<DropdownMenu.Item class="flex items-center gap-x-2" on:click={handleLogout}>
								<LogOut class="h-4 w-4" />
								Log out
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
		</nav>
	{/if}
</header>
