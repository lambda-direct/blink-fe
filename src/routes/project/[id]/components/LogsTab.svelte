<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import type { Interval } from '../../../../api/statistics';
	import { useServiceLogs } from '../../../../queries/logs';
	import type { LogsResponse } from '../../../../api/logs';
	import Logs from '$lib/components/Logs.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { selectedInstanceId } from '../../../../stores/instanceStore';

	export let projectId: string;
	export let serviceId: string;

	let currentPeriod = '1h' as Interval;
	let isLoading: boolean = true;
	let logs: LogsResponse['logs'] = '';
	let parsedLogs: { timestamp: Date | null; message: string }[] = [];

	const periods = [
		{ value: '1h', label: '1 Hour' },
		{ value: '1d', label: '24 Hour' },
		{ value: '7d', label: 'Week' },
		{ value: '30d', label: 'Month' }
	];

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

	$: if ($queryLogs?.data) {
		logs = $queryLogs.data.logs;
		parsedLogs = logs.split('\n').map((log) => {
			const match = log.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)/);
			return match
				? { timestamp: new Date(match[1]), message: log }
				: { timestamp: null, message: log };
		});
		isLoading = false;
	}
	$: validLogs =
		parsedLogs.length > 0 && parsedLogs.every((log) => log.message && log.message.trim() !== '');
</script>

<div class="flex h-full w-full flex-col overflow-hidden rounded-lg">
	<div class="mb-2 flex items-end justify-between border-b pb-2">
		<h2 class="text-xl font-medium text-neutral-400">
			{#if validLogs}
				Service Logs
			{:else if !isLoading}
				No Logs
			{/if}
		</h2>
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
			<Logs {parsedLogs} type="service" />
		{/if}
	</div>
</div>
