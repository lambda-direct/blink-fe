<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import type { GetProjectsResponse } from '../api/projects';
	import { useProjects } from '../queries/projects';

	let projects: GetProjectsResponse['projects'] = [];
	let servicesCountMap: { [key: string]: number } = {};

	$: queryProjects = useProjects(true);
	$: if ($queryProjects.data) {
		projects = $queryProjects.data.projects;
		servicesCountMap = $queryProjects.data.servicesCountMap;
	}
</script>

<section class="mx-auto mt-10 max-w-screen-lg">
	<span class="text-xl">Projects</span>
	<p class="text-sm text-neutral-400">Manage your projects</p>

	<div class="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
		{#each projects as project}
			<ProjectCard {project} servicesCount={servicesCountMap[project.id]} />
		{/each}
	</div>
</section>
