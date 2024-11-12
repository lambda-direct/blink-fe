<script lang="ts">
	import { Code, Network, Cloud, Globe } from 'lucide-svelte';
	import CircleIcon from './CircleIcon.svelte';
	import type { GetServiceResponse } from '../../../../api/services';
	export let service: GetServiceResponse;

	const {
		service: { imageName, commandWithArguments },
		portMappings,
		domains
	} = service;
</script>

<div class="flex flex-col gap-10">
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-6 text-neutral-400">
			<CircleIcon icon={Code} />
			<h2 class="text-xl font-medium">Source</h2>
		</div>
		<div class="ml-16 flex flex-col gap-4 overflow-x-auto text-sm">
			<p class="text-neutral-400">Image Name</p>
			<div class="h-fit min-h-14 rounded-lg border p-5">{imageName}</div>
		</div>
	</div>
	{#if portMappings.length || domains.length}
		<div class="flex flex-col gap-6">
			<div class="flex items-center gap-6 text-neutral-400">
				<CircleIcon icon={Network} />
				<h2 class="text-xl font-medium">Networking</h2>
			</div>
			{#each domains as { name, isTlsEnabled }}<div
					class="ml-16 flex h-fit min-h-14 items-center gap-8 rounded-lg border p-5 text-sm"
				>
					<div class="flex flex-row items-center gap-2 text-neutral-400">
						<Globe class="h-4 w-4" />
						<span>Domain:</span>
						<span class="text-white hover:underline cursor-pointer">{name}</span>
					</div>
					{#if isTlsEnabled !== undefined}
						<div>
							<span class="mr-2 text-neutral-400">TLS:</span>
							<span>{isTlsEnabled ? 'Enabled' : 'Disabled'}</span>
						</div>
					{/if}
				</div>
			{/each}
			{#each portMappings as { protocol, hostAddress, hostPort, containerPort }}
				<div class="ml-16 flex h-fit min-h-14 items-center gap-8 rounded-lg border p-5 text-sm">
					<div>
						<span class="mr-2 text-neutral-400">Protocol:</span>
						<span>{protocol}</span>
					</div>

					<div>
						<span class="mr-2 text-neutral-400">Host:</span>
						<span>{hostAddress} ➔ {hostPort}</span>
					</div>

					<div>
						<span class="mr-2 text-neutral-400">Container Port:</span>
						<span>{containerPort}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-6 text-neutral-400">
			<CircleIcon icon={Cloud} />
			<h2 class="text-xl font-medium">Deploy</h2>
		</div>
		<div class="ml-16 flex flex-col gap-4 text-sm">
			<div class="flex gap-4">
				<p class="text-neutral-400">Restart Policy:</p>
				<p>unless-stopped</p>
			</div>
			{#if commandWithArguments}
				<p class="text-neutral-400">Custom Start Command</p>
				<div class="h-fit min-h-14 rounded-lg border p-5">{commandWithArguments}</div>
			{/if}
		</div>
	</div>
</div>
