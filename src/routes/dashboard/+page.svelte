<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import type { GetProjectsResponse } from '../../api/projects';
	import { useProjects } from '../../queries/projects';
	import { selectedInstanceId } from '../../stores/instanceStore';

	let projects: GetProjectsResponse['projects'] = [];
	let servicesCountMap: { [key: string]: number } = {};
	let isLoading: boolean = true;

	$: queryProjects = $selectedInstanceId ? useProjects($selectedInstanceId, true) : null;
	$: {
		if ($queryProjects) {
			isLoading = $queryProjects.isFetching;

			if (!$queryProjects.isError && $queryProjects.data) {
				projects = $queryProjects.data.projects || [];
				servicesCountMap = $queryProjects.data.servicesCountMap || {};
			} else {
				projects = [];
				servicesCountMap = {};
			}
		} else {
			isLoading = false;
		}
	}
</script>

<section class="flex h-full w-full flex-col overflow-auto pt-10">
	<div class="mx-auto w-full max-w-screen-lg px-2 lg:px-0">
		<span class="text-xl">Projects</span>
		<p class="text-sm text-neutral-400">Manage your projects</p>

		{#if !isLoading}
			{#if projects.length > 0}
				<div class="mt-4 flex flex-wrap justify-center gap-4 border-t py-4 lg:justify-start">
					{#each projects as project}
						<ProjectCard {project} servicesCount={servicesCountMap[project.id]} />
					{/each}
				</div>
			{:else}
				<p class="mt-4 border-t pt-4 text-center text-xl font-medium">No projects found</p>
			{/if}
		{/if}
	</div>
</section>
