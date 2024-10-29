<script lang="ts">
	import type { GetServicesResponse } from '../../api/services';
	import getTimeAgo from '../../routes/statistics/utils/getTimeAgo';
	import { Database } from 'lucide-svelte';

	export let onClick: Function | null = null;
	export let service: GetServicesResponse['services'][0];
	export let selected: boolean = false;

	function handleClick() {
		if (onClick) {
			onClick();
		}
	}
</script>

<button
	class="bg-card hover:bg-accent flex h-36 w-72 max-w-screen-lg cursor-pointer flex-col justify-between rounded-lg border p-4 {selected
		? 'border-[#853bce]'
		: ''}"
	on:click={handleClick}
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
		<span>Created {getTimeAgo(service.createdAt, false)}</span>
	</div>
</button>
