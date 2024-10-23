<script lang="ts">
	import { Progress } from 'bits-ui';
	import Chart from './components/Chart.svelte';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import type { Interval } from '../../api/statistics';
	import { useChartStatistics } from '../../queries/statistics';
	import { onMount } from 'svelte';
	import formatBytes from './utils/formatBytes';
	import ChartSkeleton from './components/ChartSkeleton.svelte';

	let currentPeriod = '1d' as Interval;
	let cpuUsage = [] as number[];
	let diskUsage = [] as number[];
	let timestamps = [] as number[];
	let memoryUsage = [] as number[];
	let totalFileSystem: number = 0;
	let totalMemory: number = 0;
	let isLoading: boolean = true;
	let column: HTMLDivElement;
	let columnWidth = 0;

	const periods = [
		{ value: '1d', label: '24 Hour' },
		{ value: '7d', label: 'Week' },
		{ value: '14d', label: '2 Week' },
		{ value: '30d', label: 'Month' }
	];

	function handleSelectPeriod(option: Selected<string> | undefined) {
		if (!option) return;
		currentPeriod = option.value as Interval;
		isLoading = true;
	}

	function updateColumnWidth() {
		if (column) {
			columnWidth = column.offsetWidth;
		}
	}

	$: selectedPeriod = periods.find((opt) => opt.value === currentPeriod);
	$: queryChart = useChartStatistics({
		interval: currentPeriod
	});
	$: if ($queryChart?.data?.chart) {
		const { chart, values } = $queryChart.data;
		timestamps = chart.map((item) => item.timestamp);
		cpuUsage = chart.map((item) => item.averageCpuLoad || 0);
		memoryUsage = chart.map((item) => item.usedMemory || 0);
		diskUsage = chart.map((item) => item.usedFileSystem || 0);
		totalFileSystem = values.totalFileSystem;
		totalMemory = values.totalMemory;
		isLoading = false;
	}

	onMount(() => {
		updateColumnWidth();
		window.addEventListener('resize', updateColumnWidth);

		return () => {
			window.removeEventListener('resize', updateColumnWidth);
		};
	});
</script>

<div class="flex flex-col rounded-md border border-slate-700 p-4">
	<div class="mb-5 flex justify-between">
		<div>
			<h3 class="mb-1 text-xl font-medium">Statistics</h3>
			<p class="text-sm text-neutral-400">Watch your VPS resource usage</p>
		</div>
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
	<div class="grid grid-cols-2 gap-10">
		<div bind:this={column} class="flex flex-col">
			<h5>CPU Usage</h5>
			<p class="text-sm text-neutral-400">Total: 100%</p>
			<!-- <Progress.Root
				{value}
				max={100}
				class="relative h-[12px] overflow-hidden rounded-full bg-slate-400"
			>
				<div
					class="bg-foreground h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out"
					style={`transform: translateX(-${100 - (100 * (value ?? 0)) / 100}%)`}
				/>
			</Progress.Root> -->
			{#if isLoading}
				<ChartSkeleton />
			{:else}
				{#key `${timestamps.join(',')}-${cpuUsage.join(',')}-${columnWidth}`}
					<Chart {timestamps} data={cpuUsage} chartWidth={columnWidth} type="percent" />
				{/key}
			{/if}
		</div>
		<div class="flex flex-col">
			<h5>Memory Usage</h5>
			<p class="text-sm text-neutral-400">Total: {formatBytes(totalMemory)}</p>
			<!-- <Progress.Root
				{value}
				max={100}
				class="relative h-[12px] overflow-hidden rounded-full bg-slate-400"
			>
				<div
					class="bg-foreground h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out"
					style={`transform: translateX(-${100 - (100 * (value ?? 0)) / 100}%)`}
				/>
			</Progress.Root> -->
			{#if isLoading}
				<ChartSkeleton />
			{:else}
				{#key `${timestamps.join(',')}-${memoryUsage.join(',')}-${columnWidth}`}
					<Chart
						{timestamps}
						data={memoryUsage}
						chartWidth={columnWidth}
						total={totalMemory}
						type="B"
					/>
				{/key}
			{/if}
		</div>
		<div class="flex flex-col">
			<h5>Disk Usage</h5>
			<p class="text-sm text-neutral-400">Total: {formatBytes(totalFileSystem)}</p>
			<!-- <Progress.Root
				{value}
				max={100}
				class="relative h-[12px] overflow-hidden rounded-full bg-slate-400"
			>
				<div
					class="bg-foreground h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out"
					style={`transform: translateX(-${100 - (100 * (value ?? 0)) / 100}%)`}
				/>
			</Progress.Root> -->
			{#if isLoading}
				<ChartSkeleton />
			{:else}
				{#key `${timestamps.join(',')}-${diskUsage.join(',')}-${columnWidth}`}
					<Chart
						{timestamps}
						data={diskUsage}
						chartWidth={columnWidth}
						total={totalFileSystem}
						type="B"
					/>
				{/key}
			{/if}
		</div>
	</div>
</div>
