<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { periods, type Interval } from '../../../../api/statistics';
	import { useServiceLogs } from '../../../../queries/logs';
	import type { ServiceLogsResponse } from '../../../../api/logs';
	import Logs from '$lib/components/Logs.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { selectedInstanceId } from '../../../../stores/instanceStore';

	export let projectId: string;
	export let serviceId: string;

	let currentPeriod = '1h' as Interval;
	let isLoading: boolean = true;
	let logs: ServiceLogsResponse['logs'] = '';
	let parsedLogs: { createdAt: number; message: string }[] = [];

	function handleSelectPeriod(option: Selected<string> | undefined) {
		if (!option) return;
		if (option.value !== currentPeriod) {
			currentPeriod = option.value as Interval;
			isLoading = true;
		}
	}

	$: selectedPeriod = periods.find((opt) => opt.value === currentPeriod);
	$: queryLogs = $selectedInstanceId
		? useServiceLogs($selectedInstanceId, projectId, serviceId, { interval: currentPeriod })
		: null;

	$: {
		if ($queryLogs) {
			isLoading = $queryLogs.isFetching;

			if (!$queryLogs.isError && $queryLogs.data) {
				logs = $queryLogs.data.logs;
				parsedLogs = logs.split('\n').map((log) => {
					const match = log.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)\s+(.*)$/);
					if (match) {
						return {
							createdAt: new Date(match[1]).getTime(),
							message: match[2]
						};
					}
					return {
						createdAt: 0,
						message: log
					};
				});
			} else {
				logs = '';
				parsedLogs = [];
			}
		} else {
			isLoading = false;
		}
	}
	$: validLogs =
		parsedLogs.length > 0 && parsedLogs.every((log) => log.message && log.message.trim() !== '');
</script>

<div class="flex h-full w-full flex-col overflow-hidden rounded-lg">
	<div class="mb-2 flex items-end justify-between border-b pb-2">
		<h2 class="text-xl font-medium text-neutral-400">Service Logs</h2>
		<Select.Root selected={selectedPeriod} onSelectedChange={handleSelectPeriod}>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Period" />
			</Select.Trigger>
			<Select.Content>
				{#each periods as item}
					<Select.Item value={item.value}>{item.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
	<div class="h-2/3">
		{#if isLoading}
			<Skeleton />
		{:else if validLogs}
			<Logs logs={parsedLogs} type="service" />
		{:else}
			<div class="flex h-full items-center justify-center rounded-lg border">
				<p class="text-center text-sm text-neutral-400">No Data</p>
			</div>
		{/if}
	</div>
</div>
