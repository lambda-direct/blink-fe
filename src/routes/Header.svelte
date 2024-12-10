<script lang="ts">
	import { Check, ChevronDown, CircleAlert, LogOut, Pencil } from 'lucide-svelte';
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
	import { selectedInstanceId } from '../stores/instanceStore';

	let instances: Response['instances'] = [];
	let isEditing: boolean = false;
	let editItemName: string = '';
	let selectedProjectId: Selected<string>;
	let projects: GetProjectsResponse['projects'] = [];
	let user: UserResponse['user'] | null = null;
	let isAuthenticated = false;
	let projectId: string | null = null;
	let showInvalidNameError: boolean = false;
	let errorTimeout: ReturnType<typeof setTimeout>;
	let renameInput: HTMLInputElement | null = null;

	const dashboardLinks = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/statistics', label: 'Statistics' },
		{ href: '/logs', label: 'Logs' }
	];

	if (typeof window !== 'undefined') {
		isAuthenticated = !!localStorage.getItem('accessToken');
	}
	$: currentPath = $page.url.pathname;
	$: isProjectsRoute = currentPath.startsWith('/project');

	$: queryInstances = useInstances();
	$: if ($queryInstances.data) {
		instances = $queryInstances.data.instances.sort((a, b) => {
			const dateA = a.lastLoginAt || 0;
			const dateB = b.lastLoginAt || 0;
			return dateB - dateA;
		});

		if (!$selectedInstanceId && instances.length > 0) {
			const lastInstance = instances.reduce((prev, curr) => {
				if (curr.lastLoginAt && (!prev.lastLoginAt || curr.lastLoginAt > prev.lastLoginAt)) {
					return curr;
				}
				return prev;
			}, instances[0]);

			setInstanceId(lastInstance.id);
		}
	}

	$: selectedInstance = $selectedInstanceId
		? instances.find((instance) => instance.id === $selectedInstanceId)
		: null;

	function handleSelectInstance(id: string) {
		if (isProjectsRoute) {
			goto('/dashboard');
		}
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
		clearTimeout(errorTimeout);
	}

	function validateName(name: string) {
		const regex = /^[a-zA-Z0-9]+([a-zA-Z0-9_-])*$/;
		return regex.test(name);
	}

	async function handleUpdateItem() {
		const newItemName = editItemName.trim().replace(/\s+/g, ' ');

		if (!validateName(newItemName)) {
			showInvalidNameError = true;
			clearTimeout(errorTimeout);
			errorTimeout = setTimeout(() => {
				showInvalidNameError = false;
			}, 3000);
			return;
		}

		showInvalidNameError = false;
		if (selectedInstance && newItemName !== selectedInstance.name) {
			const data: RequestBody = { name: newItemName };
			try {
				await patchInstanceById(selectedInstance.id, data);
				const instanceIndex = instances.findIndex(
					(instance) => instance.id === selectedInstance.id
				);
				if (instanceIndex !== -1) {
					instances[instanceIndex] = { ...instances[instanceIndex], name: newItemName };
				}
			} catch (error) {
				console.error(error);
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

	$: queryProjects = $selectedInstanceId ? useProjects($selectedInstanceId, true) : null;
	$: {
		if ($queryProjects?.data) {
			projects = $queryProjects.data.projects;
		}
	}
	$: {
		if (isProjectsRoute && $page.params.id) {
			projectId = $page.params.id;
			selectedProjectId = { value: projectId };
		} else {
			projectId = null;
		}
	}
	$: validProject = projects.some((project) => project.id === projectId);

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

	$: if (isEditing && renameInput) {
		renameInput.focus();
	}

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
		<nav class="relative w-full border-b sm:px-14">
			<div class="mx-auto mt-10 flex min-h-10 max-w-screen-lg items-center justify-end lg:mt-0">
				{#if isProjectsRoute}
					<a
						href={`/project/${projectId}`}
						class="relative h-10 px-4 py-2 font-medium transition-colors hover:text-white {currentPath ===
						`/project/${projectId}`
							? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
							: 'text-neutral-400'}"
					>
						Architecture
					</a>
					<a
						href={`/project/${projectId}/observability`}
						class="relative h-10 px-4 py-2 font-medium transition-colors hover:text-white {currentPath ===
						`/project/${projectId}/observability`
							? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
							: 'text-neutral-400'}"
					>
						Observability
					</a>
				{:else}
					{#each dashboardLinks as { href, label }}
						<a
							{href}
							class="relative h-10 px-4 py-2 font-medium transition-colors hover:text-white {currentPath ===
							href
								? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
								: 'text-neutral-400'}"
						>
							{label}
						</a>{/each}
				{/if}
			</div>
			<div class="absolute left-2 top-0 flex h-10 items-center gap-1 lg:left-20">
				{#if selectedInstance}
					<span class="mr-2 text-gray-600">/</span>
					<DropdownMenu.Root closeOnItemClick={false} onOutsideClick={handleCancelEdit}>
						<DropdownMenu.Trigger
							class="flex w-fit items-center gap-2 overflow-hidden text-ellipsis outline-none {!selectedInstance.isOnline
								? 'text-neutral-500'
								: ''}"
							style="max-width: var(--custom-max-width);"
						>
							<span class="truncate">{selectedInstance.name}</span>
							<ChevronDown class="h-5 w-5 text-gray-600" />
						</DropdownMenu.Trigger>

						<DropdownMenu.Content
							class="mt-2 w-fit sm:min-w-52"
							style="max-width: var(--custom-max-width);"
						>
							{#each instances as instance}
								<DropdownMenu.Item
									on:click={() => handleSelectInstance(instance.id)}
									class="flex items-center gap-2 text-base
					 text-neutral-400 hover:text-white
					  {instance.id === $selectedInstanceId ? 'text-white' : ''}
					  {!instance.isOnline ? 'text-neutral-400' : ''}"
									aria-disabled={!instance.isOnline}
								>
									<div class="h-4 w-4">
										{#if instance.id === $selectedInstanceId}
											<Check class="h-4 w-4" />
										{/if}
									</div>
									<span class="truncate">{instance.name}</span>
								</DropdownMenu.Item>
							{/each}

							<DropdownMenu.DropdownMenuSeparator />

							{#if isEditing}
								<DropdownMenu.Item class="bg-accent relative flex flex-col text-base">
									<input
										type="text"
										class="bg-accent placeholder-grey-400 w-full outline-none"
										bind:value={editItemName}
										bind:this={renameInput}
										on:focusout={() => renameInput?.focus()}
										on:keydown={handleKeydown}
										spellcheck="false"
									/>
								</DropdownMenu.Item>
								{#if showInvalidNameError}
									<DropdownMenu.Item
										class="flex items-center justify-center gap-2 text-base text-neutral-400"
									>
										<CircleAlert class="h-4 w-4" />
										<span>Invalid name</span>
									</DropdownMenu.Item>
								{/if}
							{:else}
								<DropdownMenu.Item
									class="flex items-center gap-2 text-base"
									on:click={handleRenameClick}
								>
									<Pencil class="h-4 w-4" />
									Rename
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
				{#if validProject}
					<span class="text-gray-600">/</span>
					<Select.Root selected={selectedProjectId} onSelectedChange={handleSelectProject}>
						<Select.Trigger
							class="flex w-fit items-center justify-start gap-2 overflow-hidden text-ellipsis border-none bg-transparent sm:min-w-48"
							style="max-width: var(--custom-max-width);"
						>
							<span class="truncate"
								>{projects.find((project) => project.id === selectedProjectId.value)?.name ||
									''}</span
							>
						</Select.Trigger>

						<Select.Content class="w-fit sm:min-w-48" style="max-width: var(--custom-max-width);">
							{#each projects as project}
								<Select.Item value={project.id} class="truncate">{project.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>
			{#if user}
				<div class="absolute -top-1 right-2 flex h-10 items-center sm:right-6">
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

<style>
	:root {
		--custom-max-width: 200px;
	}
	@media (max-width: 500px) {
		:root {
			--custom-max-width: 125px;
		}
	}

	@media (min-width: 768px) and (max-width: 1280px) {
		:root {
			--custom-max-width: 270px;
		}
	}
	@media (min-width: 1281px) {
		:root {
			--custom-max-width: 350px;
		}
	}
</style>
