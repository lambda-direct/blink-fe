<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { Plus } from 'lucide-svelte';
	import type { GetProjectsResponse } from '../../api/projects';
	import { useProjects } from '../../queries/projects';
	import { selectedInstanceId } from '../../stores/instanceStore';
	import { Circle } from 'svelte-loading-spinners';

	let projects: GetProjectsResponse['projects'] | null = null;
	let servicesCountMap: { [key: string]: number } = {};
	let isLoading: boolean = true;

	$: queryProjects = $selectedInstanceId ? useProjects($selectedInstanceId, true) : null;
	$: {
		if ($queryProjects) {
			isLoading = $queryProjects.isFetching;

			if (!$queryProjects.isError && $queryProjects.data) {
				projects = $queryProjects.data.projects;
				servicesCountMap = $queryProjects.data.servicesCountMap || {};
			} else {
				projects = null;
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
		<p class="border-b pb-4 text-sm text-neutral-400">Manage your projects</p>
		{#if isLoading}
			<div class="flex w-full items-center justify-center h-44 font-bold">
				<Circle size="30" color="#1F2937" />
			</div>
		{:else if !isLoading}
			{#if projects !== null}
				<div class="flex flex-wrap justify-center gap-4 py-4 lg:justify-start">
					{#each projects as project}
						<ProjectCard {project} servicesCount={servicesCountMap[project.id]} />
					{/each}
					<button
						class="h-full min-h-44 w-[330px] cursor-pointer overflow-hidden rounded-lg border border-dashed border-neutral-400 p-4 text-neutral-400 hover:border-white hover:text-white"
						type="button"
						aria-label={`Create new project`}
					>
						<div class="flex w-full items-center justify-center gap-2 pr-4">
							<Plus class="h-4 w-4" />
							<h5>Add a Project</h5>
						</div>
					</button>
				</div>
			{:else}
				<p class="pt-4 text-center text-xl font-medium">No projects found</p>
			{/if}
		{/if}
	</div>
</section>
