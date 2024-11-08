<script lang="ts">
	import { Code, Network, Cloud } from 'lucide-svelte';
	import CircleIcon from './CircleIcon.svelte';
	import type { GetServiceResponse } from '../../../../api/services';

	export let mounts: GetServiceResponse['bindMounts'];
</script>

<div class="flex flex-col gap-10">
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-6 text-neutral-400">
			<CircleIcon />
			<h2 class="text-xl font-medium">Connection</h2>
		</div>
		{#each mounts as mount}
			{#if mount.sourcePath}
				<div class="ml-16 flex flex-col gap-4 overflow-x-auto text-sm">
					<p class="text-neutral-400">Source Path</p>
					<div class="h-fit min-h-14 rounded-lg border p-5">{mount.sourcePath}</div>
				</div>
			{/if}

			{#if mount.destinationPath}
				<div class="ml-16 flex flex-col gap-4 overflow-x-auto text-sm">
					<p class="text-neutral-400">Destination Path</p>
					<div class="h-fit min-h-14 rounded-lg border p-5">{mount.destinationPath}</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
