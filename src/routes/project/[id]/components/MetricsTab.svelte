<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { onMount } from 'svelte';
	import { periods, type Interval } from '../../../../api/statistics';
	import { useHttpStats, useServiceResourceUsage } from '../../../../queries/statistics';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import Chart from '../../../statistics/components/Chart.svelte';
	import StatusCodeChart from '../../../statistics/components/StatusCodeChart.svelte';
	import Legend from './Legend.svelte';
	import type { ChartColors } from '../+page.svelte';
	import { getRandomColor } from '../../../statistics/utils/getRandomColor';
	import { selectedInstanceId } from '../../../../stores/instanceStore';
	import { formatBytes } from '../../../statistics/utils/formatData';

	export let projectId: string;
	export let serviceId: string;

	let currentPeriod = '1h' as Interval;
	let timestamps = [] as number[];
	let responseTimes: number[] = [];
	let statusCodeCounts: { [statusCode: string]: number }[] = [];
	let isLoading: boolean = true;
	let column: HTMLDivElement;
	let columnWidth = 0;
	let colorsMap: ChartColors = {};
	let selectedStatusCode: string | null = null;

	let cpuUsage = [] as number[];
	let diskUsage = [] as number[];
	let memoryUsage = [] as number[];
	let totalFileSystem: number = 0;
	let totalMemory: number = 0;
	let resourceTimestamps = [] as number[];
	let resourceIsLoading: boolean = true;

	const colors = [
		'#853bce',
		'#e525a9',
		'#ff4c7d',
		'#ff895a',
		'#f9f871',
		'#45fce5',
		'#0067f3',
		'#0093e6',
		'#00a78e',
		'#ffb8ff'
	];

	function handleSelectPeriod(option: Selected<string> | undefined) {
		if (!option) return;
		if (option.value !== currentPeriod) {
			currentPeriod = option.value as Interval;
			colorsMap = {};
		}
	}

	function updateColumnWidth() {
		if (column) {
			columnWidth = column.offsetWidth;
		}
	}

	function handleCodeSelect(event: CustomEvent<string>) {
		const selectedCode = event.detail;
		if (selectedStatusCode === selectedCode) {
			selectedStatusCode = null;
		} else {
			selectedStatusCode = selectedCode;
		}
	}

	function setDefaultStatusCode() {
		if (!selectedStatusCode && statusCodeCounts.some((entry) => '200' in entry)) {
			selectedStatusCode = '200';
		}
		selectedStatusCode;
	}

	$: selectedPeriod = periods.find((opt) => opt.value === currentPeriod);

	$: queryChart = $selectedInstanceId
		? useServiceResourceUsage($selectedInstanceId, projectId, serviceId, {
				interval: currentPeriod
			})
		: null;

	$: {
		if ($queryChart) {
			resourceIsLoading = $queryChart.isFetching;

			if ($queryChart.isError) {
				resourceTimestamps = [];
				cpuUsage = [];
				memoryUsage = [];
				diskUsage = [];
				totalFileSystem = 0;
				totalMemory = 0;
			} else if ($queryChart.data?.chart) {
				const { chart, values } = $queryChart.data;
				resourceTimestamps = chart.map((item) => item.timestamp);
				cpuUsage = chart.map((item) => item.averageCpuLoad);
				memoryUsage = chart.map((item) => item.usedMemory);
				diskUsage = chart.map((item) => item.usedFileSystem);
				totalFileSystem = values.totalFileSystem;
				totalMemory = values.totalMemory;
			}
		}
	}

	$: queryHttpChart = $selectedInstanceId
		? useHttpStats($selectedInstanceId, projectId, serviceId, { interval: currentPeriod })
		: null;

	$: {
		if ($queryHttpChart) {
			isLoading = $queryHttpChart.isFetching;

			if ($queryHttpChart.data) {
				if ($queryHttpChart.data.responseTimeChart) {
					timestamps = $queryHttpChart.data.responseTimeChart.map((item) => item.timestamp);
					responseTimes = $queryHttpChart.data.responseTimeChart.map(
						(item) => item.averageResponseTime
					);
				}

				if ($queryHttpChart.data.statusCodeCountChart) {
					statusCodeCounts = $queryHttpChart.data.statusCodeCountChart.map((entry) => {
						const statusCounts: { [key: string]: number } = {};
						for (const [statusCode, count] of Object.entries(entry.statusCodeCounts)) {
							statusCounts[statusCode] = count;

							if (!(statusCode in colorsMap)) {
								const color =
									Object.keys(colorsMap).length < colors.length
										? colors[Object.keys(colorsMap).length]
										: getRandomColor();
								colorsMap[statusCode] = color;
							}
						}
						return statusCounts;
					});
					setDefaultStatusCode();
				}
			}
		} else {
			isLoading = false;
			timestamps = [];
			responseTimes = [];
			statusCodeCounts = [];
		}
	}

	$: currentStatusCodeCounts = selectedStatusCode
		? statusCodeCounts.map((entry) => {
				const filteredEntry: { [key: string]: number } = {};
				if (selectedStatusCode && entry[selectedStatusCode] !== undefined) {
					filteredEntry[selectedStatusCode] = entry[selectedStatusCode];
				}
				return Object.keys(filteredEntry).length > 0 ? filteredEntry : {};
			})
		: statusCodeCounts;

	onMount(() => {
		updateColumnWidth();
		window.addEventListener('resize', updateColumnWidth);
		if (statusCodeCounts.some((entry) => entry['200'] > 0)) {
			selectedStatusCode = '200';
		}

		return () => {
			window.removeEventListener('resize', updateColumnWidth);
		};
	});
</script>

<div class="flex h-full w-full flex-col">
	<div class="flex justify-end">
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
	<div class="grid grid-cols-1 gap-10 xl:grid-cols-1">
		<div bind:this={column} class="flex flex-col">
			<h5>CPU Usage</h5>
			<p class="text-sm text-neutral-400">Total: 100%</p>
			{#if resourceIsLoading}
				<Skeleton height="300px" />
			{:else if cpuUsage.length > 0}
				{#key `${currentPeriod}-${columnWidth}`}
					<Chart
						timestamps={resourceTimestamps}
						data={cpuUsage}
						chartWidth={columnWidth}
						type="percent"
						interval={currentPeriod}
					/>
				{/key}
			{:else}
				<div class="flex min-h-[300px] flex-grow items-center justify-center rounded-lg border">
					<p class="text-center text-sm text-neutral-400">No Data</p>
				</div>
			{/if}
		</div>
		<div class="flex flex-col">
			<h5>Memory Usage</h5>
			<p class="text-sm text-neutral-400">Total: {formatBytes(totalMemory)}</p>
			{#if resourceIsLoading}
				<Skeleton height="300px" />
			{:else if memoryUsage.length > 0}
				{#key `${currentPeriod}-${columnWidth}`}
					<Chart
						timestamps={resourceTimestamps}
						data={memoryUsage}
						total={totalMemory}
						chartWidth={columnWidth}
						type="B"
						interval={currentPeriod}
					/>
				{/key}
			{:else}
				<div class="flex min-h-[300px] flex-grow items-center justify-center rounded-lg border">
					<p class="text-center text-sm text-neutral-400">No Data</p>
				</div>
			{/if}
		</div>
		<div class="flex flex-col">
			<h5>Disk Usage</h5>
			<p class="text-sm text-neutral-400">Total: {formatBytes(totalFileSystem)}</p>
			{#if resourceIsLoading}
				<Skeleton height="300px" />
			{:else if diskUsage.length > 0}
				{#key `${currentPeriod}-${columnWidth}`}
					<Chart
						timestamps={resourceTimestamps}
						data={diskUsage}
						total={totalFileSystem}
						chartWidth={columnWidth}
						type="B"
						interval={currentPeriod}
					/>
				{/key}
			{:else}
				<div class="flex min-h-[300px] flex-grow items-center justify-center rounded-lg border">
					<p class="text-center text-sm text-neutral-400">No Data</p>
				</div>
			{/if}
		</div>
		<div class="flex flex-col">
			<h5>HTTP Average Response Time</h5>
			{#if isLoading}
				<Skeleton height="300px" />
			{:else if responseTimes.length > 0}
				{#key `${timestamps.join(',')}-${responseTimes.join(',')}-${columnWidth}`}
					<Chart
						{timestamps}
						data={responseTimes}
						chartWidth={columnWidth}
						type="ms"
						interval={currentPeriod}
					/>
				{/key}
			{:else}
				<div class="flex min-h-[300px] flex-grow items-center justify-center rounded-lg border">
					<p class="text-center text-sm text-neutral-400">No Data</p>
				</div>
			{/if}
		</div>
		<div class="mb-5 flex flex-col">
			<h5>HTTP Response Count</h5>
			{#if isLoading}
				<Skeleton height="320px" />
			{:else if statusCodeCounts.length > 0}
				{#key `${timestamps.join(',')}-${currentStatusCodeCounts.join(',')}-${columnWidth}`}
					<div class="flex items-center justify-end">
						<Legend {colorsMap} selected={selectedStatusCode} on:codeSelect={handleCodeSelect} />
					</div>
					<StatusCodeChart
						{timestamps}
						chartWidth={columnWidth}
						statusCodeCounts={currentStatusCodeCounts}
						interval={currentPeriod}
						{colorsMap}
					/>
				{/key}
			{:else}
				<div class="flex min-h-[300px] flex-grow items-center justify-center rounded-lg border">
					<p class="text-center text-sm text-neutral-400">No Data</p>
				</div>
			{/if}
		</div>
	</div>
</div>
