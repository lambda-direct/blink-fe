<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import type { GetProjectsResponse } from '../../api/projects';
	import { useProjects } from '../../queries/projects';
	import { selectedInstanceId } from '../../stores/instanceStore';

	let projects: GetProjectsResponse['projects'] = [];
	let servicesCountMap: { [key: string]: number } = {};
	let isLoading = true;

	$: queryProjects = $selectedInstanceId ? useProjects($selectedInstanceId, true) : null;
	$: {
		if ($queryProjects) {
			isLoading = $queryProjects.isFetching;
		} else {
			isLoading = false;
		}
	}

	$: if ($queryProjects?.data) {
		projects = $queryProjects.data.projects;
		servicesCountMap = $queryProjects.data.servicesCountMap;
	}
</script>

<section class="mx-auto mt-10 flex max-w-screen-lg flex-col">
	<span class="text-xl">Projects</span>
	<p class="text-sm text-neutral-400">Manage your projects</p>

	{#if !isLoading}
		{#if projects.length > 0}
			<div class="mt-4 grid h-full grid-cols-3 gap-4 overflow-auto border-t pt-4">
				{#each projects as project}
					<ProjectCard {project} servicesCount={servicesCountMap[project.id]} />
				{/each}
			</div>
		{:else}
			<p class="mt-4 border-t pt-4 text-center text-xl font-medium">No projects found</p>
		{/if}
	{/if}
</section>
