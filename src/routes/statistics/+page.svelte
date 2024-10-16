<script lang="ts">
	import { Progress } from 'bits-ui';

	import EChart from './components/EChart.svelte';
	import * as Select from '$lib/components/ui/select';

	import type { Selected } from 'bits-ui';
	import type { Interval } from '../../api/statistics';
	import { useChartStatistics } from '../../queries/statistics';
	import { formatDate } from '../../services/dayjs';

	let value = 13;
	let currentPeriod = '1d' as Interval;
	let cpuUsage = [] as number[];
	let diskUsage = [] as number[];
	let chartDates = [] as string[];
	let memoryUsage = [] as number[];
	const periods = [
		{ value: '1d', label: '24 Hour' },
		{ value: '7d', label: 'Week' },
		{ value: '14d', label: '2 Week' },
		{ value: '30d', label: 'Month' }
	];

	$: selectedPeriod = periods.find((opt) => opt.value === currentPeriod);
	$: queryChart = useChartStatistics({
		interval: currentPeriod
	});
	$: if ($queryChart?.data?.length) {
		chartDates = $queryChart.data.map((item) => {
			if (currentPeriod === '1d') return formatDate(item.timestamp, 'HH:mm');

			return formatDate(item.timestamp, 'YYYY-MM-DD');
		});
		cpuUsage = $queryChart.data.map((item) => {
			return item.cpuUsage || 0;
		});
		memoryUsage = $queryChart.data.map((item) => {
			return item.memoryUsage || 0;
		});
		diskUsage = $queryChart.data.map((item) => {
			return item.memoryUsage || 0;
		});
	}

	function handleSelectPeriod(option: Selected<string> | undefined) {
		if (!option) return;

		currentPeriod = option.value as Interval;
	}
</script>

<div class="flex flex-col rounded-md border border-slate-700 p-4">
	<div class="mb-5 flex justify-between">
		<div>
			<h3 class="mb-1 text-xl font-medium">Statistics</h3>
			<p class="text-sm text-neutral-400">
				Watch the usage of your server in the current app text-neutral-400
			</p>
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
	<div class="grid grid-cols-2 gap-4">
		<div class="flex flex-col">
			<h5>CPU</h5>
			<p class="mb-2 text-sm text-neutral-400">Used: 0.00%</p>
			<Progress.Root
				{value}
				max={100}
				class="relative h-[12px] overflow-hidden rounded-full bg-slate-400"
			>
				<div
					class="h-full w-full flex-1 rounded-full bg-foreground transition-all duration-1000 ease-in-out"
					style={`transform: translateX(-${100 - (100 * (value ?? 0)) / 100}%)`}
				/>
			</Progress.Root>
			<EChart dates={chartDates} series={cpuUsage} />
		</div>
		<div class="flex flex-col">
			<h5>Memory</h5>
			<p class="mb-2 text-sm text-neutral-400">Used: 0.01GB / Limit: 1.92GB</p>
			<Progress.Root
				{value}
				max={100}
				class="relative h-[12px] overflow-hidden rounded-full bg-slate-400"
			>
				<div
					class="h-full w-full flex-1 rounded-full bg-foreground transition-all duration-1000 ease-in-out"
					style={`transform: translateX(-${100 - (100 * (value ?? 0)) / 100}%)`}
				/>
			</Progress.Root>
			<EChart dates={chartDates} series={memoryUsage} />
		</div>
		<div class="flex flex-col">
			<h5>Disk Usage</h5>
			<p class="mb-2 text-sm text-neutral-400">Used: 0.01GB / Limit: 1.92GB</p>
			<Progress.Root
				{value}
				max={100}
				class="relative h-[12px] overflow-hidden rounded-full bg-slate-400"
			>
				<div
					class="h-full w-full flex-1 rounded-full bg-foreground transition-all duration-1000 ease-in-out"
					style={`transform: translateX(-${100 - (100 * (value ?? 0)) / 100}%)`}
				/>
			</Progress.Root>
			<EChart dates={chartDates} series={diskUsage} />
		</div>
	</div>
</div>
