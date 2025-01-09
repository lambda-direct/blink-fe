<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import Logs from '$lib/components/Logs.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { periods, type Interval } from '../../api/statistics';
	import { useLogs } from '../../queries/logs';
	import type { LogsResponse } from '../../api/logs';
	import { selectedInstanceId } from '../../stores/instanceStore';
	import { getSelectedObject, selectedPeriod, setSelectedPeriod } from '../../stores/periodStore';

	let isLoading: boolean = false;
	let logs: LogsResponse['logs'] = [];

	function handleSelectPeriod(option: Selected<string> | undefined) {
		if (!option) return;
		if (option.value !== $selectedPeriod) {
			setSelectedPeriod(option.value as Interval);
		}
	}

	$: queryLogs = $selectedInstanceId
		? useLogs($selectedInstanceId, { interval: $selectedPeriod })
		: null;

	$: {
		if ($queryLogs) {
			isLoading = $queryLogs.isFetching;
			if (!$queryLogs.isError && $queryLogs.data) {
				logs = $queryLogs.data.logs;
			} else {
				logs = [];
			}
		} else {
			isLoading = false;
		}
	}

	$: validLogs = logs.length > 0 && logs.every((log) => log.message && log.message.trim() !== '');
</script>

<div class="h-full overflow-hidden pb-4">
	<div
		class="bg-card mx-auto flex h-full w-full max-w-screen-lg flex-col overflow-hidden rounded-lg border p-6 pt-10"
	>
		<div class="mb-2 flex items-end justify-between border-b pb-2">
			<h2 class="text-xl font-medium">Logs</h2>
			<Select.Root selected={getSelectedObject()} onSelectedChange={handleSelectPeriod}>
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
				<Logs {logs} type="general" />
			{:else}
				<div class="flex h-full items-center justify-center rounded-lg border">
					<p class="text-center text-sm text-neutral-400">No Data</p>
				</div>
			{/if}
		</div>
	</div>
</div>
