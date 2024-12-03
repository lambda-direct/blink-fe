<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { onMount } from 'svelte';
	import type { Interval } from '../../../../api/statistics';
	import { useHttpStats } from '../../../../queries/statistics';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import Chart from '../../../statistics/components/Chart.svelte';
	import StatusCodeChart from '../../../statistics/components/StatusCodeChart.svelte';
	import Legend from './Legend.svelte';
	import type { ChartColors } from '../+page.svelte';
	import { getRandomColor } from '../../../statistics/utils/getRandomColor';
	import { selectedInstanceId } from '../../../../stores/instanceStore';

	export let projectId: string;
	export let serviceId: string;

	let currentPeriod = '1h' as Interval;
	let timestamps = [] as number[];
	let responseTimes: number[] = [];
	let statusCodeCounts: { [statusCode: string]: number }[] = [];
	let isLoading: boolean = true;
	let column: HTMLDivElement;
	let columnWidth = 0;
	let validResponseTimes: boolean = false;
	let validStatusCodes: boolean = false;
	let colorsMap: ChartColors = {};
	let selectedStatusCode: string | null = null;

	const periods = [
		{ value: '1h', label: '1 Hour' },
		{ value: '1d', label: '24 Hour' },
		{ value: '7d', label: 'Week' },
		{ value: '30d', label: 'Month' }
	];

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
			validResponseTimes = false;
			validStatusCodes = false;
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
		? useHttpStats($selectedInstanceId, projectId, serviceId, { interval: currentPeriod })
		: null;

	$: {
		if ($queryChart) {
			isLoading = $queryChart.isFetching;

			if ($queryChart.data) {
				if ($queryChart.data.responseTimeChart) {
					timestamps = $queryChart.data.responseTimeChart.map((item) => item.timestamp);
					responseTimes = $queryChart.data.responseTimeChart.map(
						(item) => item.averageResponseTime
					);
					validResponseTimes = responseTimes.some((item) => item > 0);
				}

				if ($queryChart.data.statusCodeCountChart) {
					statusCodeCounts = $queryChart.data.statusCodeCountChart.map((entry) => {
						const statusCounts: { [key: string]: number } = {};
						for (const [statusCode, count] of Object.entries(entry.statusCodeCounts)) {
							statusCounts[statusCode] = count;
							if (count > 0) validStatusCodes = true;

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
			validResponseTimes = false;
			validStatusCodes = false;
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
	<div class="flex justify-between">
		<h2 class="text-xl font-medium text-neutral-400">
			{#if !validResponseTimes && !validStatusCodes && !isLoading}
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
	<div class="grid grid-cols-1 gap-10 xl:grid-cols-1">
		<div bind:this={column} class="flex flex-col">
			{#if isLoading}
				<Skeleton height="325px" />
			{:else if validResponseTimes}
				<h5>HTTP Average Response Time</h5>
				{#key `${timestamps.join(',')}-${responseTimes.join(',')}-${columnWidth}`}
					<Chart
						{timestamps}
						data={responseTimes}
						chartWidth={columnWidth}
						type="ms"
						interval={currentPeriod}
					/>
				{/key}
			{/if}
		</div>
		<div class="mb-5 flex flex-col">
			{#if isLoading}
				<Skeleton height="325px" />
			{:else if validStatusCodes}
				{#key `${timestamps.join(',')}-${currentStatusCodeCounts.join(',')}-${columnWidth}`}
					<div class="flex items-center justify-between">
						<h5>HTTP Response Count</h5>
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
			{/if}
		</div>
	</div>
</div>
