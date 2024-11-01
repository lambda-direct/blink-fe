<script lang="ts">
	import { Progress } from 'bits-ui';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { onMount } from 'svelte';
	import type { Interval } from '../../../../api/statistics';
	import { useHttpStats } from '../../../../queries/statistics';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import Chart from '../../../statistics/components/Chart.svelte';

	export let projectId: string;
	export let serviceId: string;

	let currentPeriod = '1d' as Interval;
	let timestamps = [] as number[];
	let responseTimes: number[] = [];
	let isLoading: boolean = true;
	let column: HTMLDivElement;
	let columnWidth = 0;
	let validResponseTimes = false;

	const periods = [
		{ value: '1d', label: '24 Hour' },
		{ value: '7d', label: 'Week' },
		{ value: '14d', label: '2 Week' },
		{ value: '30d', label: 'Month' }
	];

	function handleSelectPeriod(option: Selected<string> | undefined) {
		if (!option) return;
		if (option.value !== currentPeriod) {
			currentPeriod = option.value as Interval;
			isLoading = true;
		}
	}

	function updateColumnWidth() {
		if (column) {
			columnWidth = column.offsetWidth;
		}
	}

	$: selectedPeriod = periods.find((opt) => opt.value === currentPeriod);
	$: queryChart = useHttpStats(projectId, serviceId, { interval: currentPeriod });
	$: if ($queryChart?.data?.responseTimeChart) {
		timestamps = $queryChart.data.responseTimeChart.map((item) => item.timestamp);
		responseTimes = $queryChart.data.responseTimeChart.map((item) => item.averageResponseTime);
		validResponseTimes = responseTimes.some((item) => item > 0);
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

<div class="flex h-full w-full flex-col">
	<div class="flex justify-between">
		<h2 class="text-xl font-medium text-neutral-400">
			{#if !validResponseTimes && !isLoading}
				No Data
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
	<div class="grid grid-cols-1 gap-10 xl:grid-cols-2">
		<div bind:this={column} class="flex flex-col">
			{#if isLoading}
				<Skeleton />
			{:else if validResponseTimes}
				<h5>HTTP Average Response Time</h5>
				{#key `${timestamps.join(',')}-${responseTimes.join(',')}-${columnWidth}`}
					<Chart {timestamps} data={responseTimes} chartWidth={columnWidth} type="ms" />
				{/key}
			{/if}
		</div>
		<!-- <div class="flex flex-col">
			<h5></h5>
			{#if isLoading}
				<Skeleton />
			{:else}
				{#key `${timestamps.join(',')}-${.join(',')}-${columnWidth}`}
					<Chart
						{timestamps}
						data={}
						chartWidth={columnWidth}
					/>
				{/key}
			{/if}
		</div> -->
	</div>
</div>
