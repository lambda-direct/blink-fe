<script lang="ts">
	import { page } from '$app/stores';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { periods, type Interval } from '../../../../api/statistics';
	import { selectedInstanceId } from '../../../../stores/instanceStore';
	import { useChartStatistics } from '../../../../queries/statistics';
	import ChartSkeleton from '../../../../lib/components/Skeleton.svelte';
	import { onMount } from 'svelte';
	import Chart from '../../../statistics/components/Chart.svelte';
	import { formatBytes } from '../../../statistics/utils/formatData';
	import { useProjectLogs } from '../../../../queries/logs';
	import Logs from '$lib/components/Logs.svelte';
	import ErrorPage from '$lib/components/ErrorPage.svelte';
	import {
		getSelectedObject,
		selectedPeriod,
		setSelectedPeriod
	} from '../../../../stores/periodStore';

	let cpuUsage = [] as number[];
	let diskUsage = [] as number[];
	let timestamps = [] as number[];
	let memoryUsage = [] as number[];
	let totalFileSystem: number = 0;
	let totalMemory: number = 0;
	let isLoading: boolean = true;
	let hasError = false;
	let column: HTMLDivElement;
	let columnWidth = 0;

	let projectId = $page.params.id;
	let logs: { createdAt: number; service: string; message: string }[] = [];
	let isLogsLoading: boolean = false;

	function handleSelectPeriod(option: Selected<string> | undefined) {
		if (!option) return;
		if (option.value !== $selectedPeriod) {
			setSelectedPeriod(option.value as Interval);
		}
	}

	function updateColumnWidth() {
		if (column) {
			columnWidth = column.offsetWidth - 60;
		}
	}

	$: queryChart = $selectedInstanceId
		? useChartStatistics($selectedInstanceId, {
				interval: $selectedPeriod
			})
		: null;

	$: {
		if ($queryChart) {
			isLoading = $queryChart.isFetching;

			if ($queryChart.isError) {
				timestamps = [];
				cpuUsage = [];
				memoryUsage = [];
				diskUsage = [];
				totalFileSystem = 0;
				totalMemory = 0;
				hasError = true;
			} else if ($queryChart.data?.chart) {
				const { chart, values } = $queryChart.data;
				timestamps = chart.map((item) => item.timestamp);
				cpuUsage = chart.map((item) => item.averageCpuLoad);
				memoryUsage = chart.map((item) => item.usedMemory);
				diskUsage = chart.map((item) => item.usedFileSystem);
				totalFileSystem = values.totalFileSystem;
				totalMemory = values.totalMemory;
			}
		}
	}

	$: queryLogs = $selectedInstanceId
		? useProjectLogs($selectedInstanceId, projectId, { interval: $selectedPeriod })
		: null;

	$: {
		if ($queryLogs) {
			isLogsLoading = $queryLogs.isFetching;
			if (!$queryLogs.isError && $queryLogs.data) {
				logs = $queryLogs.data.data
					.flatMap((log) =>
						log.logs.split('\n').map((entry) => {
							const match = entry.match(
								/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)\s+(.*)$/
							);
							if (match) {
								return {
									createdAt: new Date(match[1]).getTime(),
									service: log.service.name,
									message: match[2]
								};
							}
							return {
								createdAt: 0,
								service: log.service.name,
								message: entry
							};
						})
					)
					.filter((entry) => entry.createdAt > 0)
					.sort((a, b) => a.createdAt - b.createdAt);
			} else {
				logs = [];
			}
		}
	}

	$: if (column) {
		updateColumnWidth();
	}

	onMount(() => {
		window.addEventListener('resize', updateColumnWidth);
		updateColumnWidth();
		return () => {
			window.removeEventListener('resize', updateColumnWidth);
		};
	});
</script>

{#if hasError}
	<ErrorPage status={400} message="Project not found" />
{:else}
	<div class="flex h-full min-h-full w-full flex-col overflow-auto p-4 pb-4">
		<div class="mb-5 flex justify-end">
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
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
			<div class="bg-card flex h-96 flex-col rounded-md border p-6">
				<h5 class="mb-[20px]">Logs</h5>
				{#if isLogsLoading}
					<ChartSkeleton height="300px" />
				{:else if logs.length > 0}
					<Logs {logs} type="service" />
				{:else}
					<div class="flex flex-grow items-center justify-center rounded-lg border">
						<p class="text-center text-sm text-neutral-400">No Logs</p>
					</div>
				{/if}
			</div>
			<div bind:this={column} class="bg-card flex h-96 flex-col rounded-md border p-6">
				<h5>CPU Usage</h5>
				<p class="text-sm text-neutral-400">Total: 100%</p>
				{#if isLoading}
					<ChartSkeleton height="300px" />
				{:else if cpuUsage.length > 0}
					{#key `${selectedPeriod}-${columnWidth}`}
						<Chart
							{timestamps}
							data={cpuUsage}
							chartWidth={columnWidth}
							type="percent"
							interval={$selectedPeriod}
						/>
					{/key}
				{:else}
					<div class="flex flex-grow items-center justify-center rounded-lg border">
						<p class="text-center text-sm text-neutral-400">No Data</p>
					</div>
				{/if}
			</div>
			<div class="bg-card flex h-96 flex-col rounded-md border p-6">
				<h5>Memory Usage</h5>
				<p class="text-sm text-neutral-400">Total: {formatBytes(totalMemory)}</p>
				{#if isLoading}
					<ChartSkeleton height="300px" />
				{:else if memoryUsage.length > 0}
					{#key `${selectedPeriod}-${columnWidth}`}
						<Chart
							{timestamps}
							data={memoryUsage}
							chartWidth={columnWidth}
							total={totalMemory}
							type="B"
							interval={$selectedPeriod}
						/>
					{/key}
				{:else}
					<div class="flex flex-grow items-center justify-center rounded-lg border">
						<p class="text-center text-sm text-neutral-400">No Data</p>
					</div>
				{/if}
			</div>
			<div class="bg-card flex h-96 flex-col rounded-md border p-6">
				<h5>Disk Usage</h5>
				<p class="text-sm text-neutral-400">Total: {formatBytes(totalFileSystem)}</p>
				{#if isLoading}
					<ChartSkeleton height="300px" />
				{:else if diskUsage.length > 0}
					{#key `${selectedPeriod}-${columnWidth}`}
						<Chart
							{timestamps}
							data={diskUsage}
							chartWidth={columnWidth}
							total={totalFileSystem}
							type="B"
							interval={$selectedPeriod}
						/>
					{/key}
				{:else}
					<div class="flex flex-grow items-center justify-center rounded-lg border">
						<p class="text-center text-sm text-neutral-400">No Data</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
