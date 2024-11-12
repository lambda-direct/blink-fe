<script lang="ts">
	import type { GetServiceResponse, GetServicesResponse } from '../../api/services';
	import { useService } from '../../queries/services';
	import getTimeAgo from '../../routes/statistics/utils/getTimeAgo';
	import { Database } from 'lucide-svelte';

	export let onClick: (serviceId: string, mountId: string | null) => void;
	export let serviceId: string;
	export let projectId: string;
	export let selected: boolean = false;

	let data: GetServiceResponse | null = null;
	let service: GetServiceResponse['service'] | null = null;

	function handleClick(mountId: string | null = null) {
		onClick(serviceId, mountId);
	}

	$: queryService = useService(projectId, serviceId);
	$: {
		if ($queryService?.data) {
			data = $queryService.data;
			service = data.service;
		}
	}
</script>

{#if data && service}
	<div>
		<button
			class="bg-card hover:bg-accent relative flex h-36 w-72 max-w-screen-lg cursor-pointer flex-col justify-between rounded-lg border p-4 {selected
				? 'border-[#853bce]'
				: ''}"
			on:click={() => handleClick(null)}
			type="button"
			aria-label={`${service.name}`}
		>
			<div class="flex items-center gap-2">
				{#if service.type === 'storage'}
					<Database />
				{/if}
				<h5 class="w-56 overflow-hidden text-ellipsis text-nowrap text-left">{service.name}</h5>
			</div>
			<div class="flex w-full items-start text-sm text-neutral-400">
				<span>Created {getTimeAgo(service.createdAt)}</span>
			</div>
		</button>
		{#if data.bindMounts && data.bindMounts.length > 0}
			{#each data.bindMounts as mount}
				<button
					class="bg-card hover:bg-accent -mt-6 flex h-16 w-72 max-w-screen-lg cursor-pointer justify-center rounded-lg border pb-2 pl-4 {selected
						? 'border-[#853bce]'
						: ''}"
					type="button"
					on:click={() => handleClick(mount.id)}
					aria-label="Bind Mount"
				>
					<div class="mr-auto flex h-full items-end text-sm text-neutral-400">
						<span>Mount Storage</span>
					</div>
				</button>
			{/each}
		{/if}
	</div>
{/if}
