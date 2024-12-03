<script lang="ts">
	import { goto } from '$app/navigation';
	import type { GetProjectsResponse } from '../../api/projects';
	import getTimeAgo from '../../routes/statistics/utils/getTimeAgo';

	export let project: GetProjectsResponse['projects'][0];
	export let servicesCount: number;

	function handleGoToProject() {
		goto(`/project/${project.id}`);
	}
</script>

<button
	class="bg-accent flex h-full min-h-44 w-[330px] cursor-pointer flex-col justify-between overflow-hidden rounded-lg p-4 hover:bg-[#33323e]"
	on:click={handleGoToProject}
	type="button"
	aria-label={`Open project: ${project.name}`}
>
	<h5 class="w-72 overflow-hidden text-ellipsis text-nowrap text-left">{project.name}</h5>
	<div class="flex w-full items-center justify-between text-sm text-neutral-400">
		<span>Created {getTimeAgo(project.createdAt)}</span>
		<span>
			{servicesCount}
			{servicesCount === 1 ? 'service' : 'services'}</span
		>
	</div>
</button>
