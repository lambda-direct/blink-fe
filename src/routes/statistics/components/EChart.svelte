<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import type { ECharts } from 'echarts';

	export let dates: string[];
	export let series: number[];

	let chart: ECharts;
	let refChart: HTMLDivElement | null = null;

	$: option = {
		xAxis: {
			type: 'category',
			data: dates || []
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				data: series || [],
				type: 'line'
			}
		]
	};

	$: if (dates || series) {
		chart?.setOption(option);
	}

	onMount(() => {
		chart = echarts.init(refChart);
		chart.setOption(option);
	});
</script>

<div bind:this={refChart} style="height: 300px;" />
