<script lang="ts">
	import { LogOut } from 'lucide-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { GetProjectsResponse } from '../api/projects';
	import { useProjects } from '../queries/projects';
	import { getUser, type UserResponse } from '../api/user';


	let selectedProjectId: Selected<string>;
	let projects: GetProjectsResponse['projects'] = [];
	let user: UserResponse['user'] | null = null;
	let isAuthenticated = false;
	let projectId: string | null = null;

	if (typeof window !== 'undefined') {
		isAuthenticated = !!localStorage.getItem('accessToken');
	}

	$: queryProjects = useProjects();
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
		<nav class="w-full border-b">
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
			{#if projectId}
				<div class="absolute top-0 m-2 ml-24 flex items-center">
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
				</div>
			{/if}
			{#if user}
				<div class="absolute right-0 top-0 m-4 mr-6">
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
