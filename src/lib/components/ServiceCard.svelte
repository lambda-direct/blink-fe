<script lang="ts">
	import type { GetServiceResponse } from '../../api/services';
	import { useService } from '../../queries/services';
	import getTimeAgo from '../../routes/statistics/utils/getTimeAgo';
	import { Database, HardDrive } from 'lucide-svelte';
	import { selectedInstanceId } from '../../stores/instanceStore';

	export let onClick: (serviceId: string, mountId: string | null) => void;
	export let serviceId: string;
	export let projectId: string;
	export let selected: boolean = false;

	let data: GetServiceResponse | null = null;
	let service: GetServiceResponse['service'] | null = null;

	function handleClick(mountId: string | null = null) {
		onClick(serviceId, mountId);
	}

	$: queryService = $selectedInstanceId
		? useService($selectedInstanceId, projectId, serviceId)
		: null;

	$: {
		if ($queryService) {
			if ($queryService.data) {
				data = $queryService.data;
				service = data.service;
			} else if ($queryService.isError) {
				data = null;
				service = null;
			}
		}
	}
</script>

{#if data && service}
	<div class="relative grid gap-0">
		<button
			class="bg-card hover:bg-accent relative flex h-36 w-72 cursor-pointer flex-col justify-between rounded-lg border p-4 {selected
				? 'border-[#853bce]'
				: ''} outline-none"
			on:click={() => handleClick(null)}
			type="button"
			aria-label={`${service.name}`}
			style="z-index: {data.bindMounts.length + 1};"
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
			{#each data.bindMounts as mount, index}
				<button
					class="bg-card hover:bg-accent relative -mt-6 h-16 w-72 cursor-pointer rounded-lg border p-3 pl-4 {selected
						? 'border-[#853bce]'
						: ''}"
					type="button"
					on:click={() => handleClick(mount.id)}
					aria-label="Bind Mount"
					style="z-index: {data.bindMounts.length - index};"
				>
					<div class="mr-auto flex h-full items-end text-gray-600">
						<HardDrive class="h-4 w-4" />
					</div>
				</button>
			{/each}
		{/if}
	</div>
{/if}
