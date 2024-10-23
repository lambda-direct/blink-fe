<script lang="ts">
	import { format } from 'date-fns';
	import getTimeAgoString from '../utils/getTimeAgo';
	import calculateIndices from '../utils/calculateIndices';
	import calculateChartStep from '../utils/calculateChartStep';
	import formatBytes from '../utils/formatBytes';

	export let timestamps: number[];
	export let data: number[];
	export let chartWidth: number;
	export let type: 'percent' | 'B' = 'B';
	export let total: number = 0;

	let chartHeight: number = 240;
	let maxChartPoint: number;
	let values: number[] = [];
	let labelIndices: number[];
	let ySteps: number[] = [];
	let xSteps: number[] = [];
	let hoveredPoint: {
		x: number;
		tooltipData: { value: number; timestamp: number; topPosition: number; bottomPosition: number };
	} | null = null;

	let topTooltipEl: HTMLElement;
	let bottomTooltipEl: HTMLElement;

	let X_OFFSET = type === 'B' ? 55 : 40;
	const Y_OFFSET: number = 30;

	const chartColors = {
		default: '#853bce'
	};

	function generatePoints(values: number[]) {
		let startX = X_OFFSET;
		const PERIOD = values.length;
		const STEP = (chartWidth - X_OFFSET - 5) / (PERIOD - 1);
		xSteps = [];

		const points = values.map((value) => {
			const percent = value / maxChartPoint;
			const y = chartHeight - chartHeight * percent;
			const point = `${startX},${y}`;
			xSteps.push(startX);
			startX += STEP;
			return point;
		});

		return points.join(' ');
	}

	function generateFillPoints(values: number[]) {
		let startX = X_OFFSET;
		const PERIOD = values.length;
		const STEP = (chartWidth - X_OFFSET - 5) / (PERIOD - 1);

		const points = values.map((value) => {
			const percent = value / maxChartPoint;
			const y = chartHeight - chartHeight * percent;
			const point = `${startX},${y}`;
			startX += STEP;
			return point;
		});

		const closingLine = `${startX - STEP},${chartHeight - 2} ${X_OFFSET},${chartHeight - 2}`;
		return points.join(' ') + ' ' + closingLine;
	}

	function getDotsPoints(values: number[]) {
		let startX = X_OFFSET;
		const PERIOD = values.length;
		const STEP = (chartWidth - X_OFFSET - 5) / (PERIOD - 1);

		return values.map((value) => {
			const percent = value / maxChartPoint;
			const y = chartHeight - chartHeight * percent;
			const res = { x: startX, y };
			startX += STEP;
			return res;
		});
	}

	function handleMouseMove(event: MouseEvent) {
		const svgRect = (event.currentTarget as SVGElement).getBoundingClientRect();
		const mouseX = event.clientX - svgRect.left;
		const range = (chartWidth - X_OFFSET - 5) / (xSteps.length - 1) / 2;

		let newHoveredPoint = null;
		for (let i = 0; i < xSteps.length; i++) {
			const pointX = xSteps[i];
			if (mouseX >= pointX - range && mouseX < pointX + range) {
				const { topTooltipX, bottomTooltipX } = getTooltipPosition(pointX);
				const tooltipData = {
					value: values[i],
					timestamp: timestamps[i],
					topPosition: topTooltipX,
					bottomPosition: bottomTooltipX
				};
				newHoveredPoint = { x: pointX, tooltipData };
				break;
			}
		}

		if (newHoveredPoint && JSON.stringify(newHoveredPoint) !== JSON.stringify(hoveredPoint)) {
			hoveredPoint = newHoveredPoint;
		} else if (!newHoveredPoint) {
			hoveredPoint = null;
		}
	}

	function getTooltipPosition(x: number) {
		const tooltipWidth = topTooltipEl?.clientWidth;
		const bottomTooltipWidth = bottomTooltipEl?.clientWidth;
		const containerWidth = chartWidth;

		let topTooltipX = x;
		if (x - tooltipWidth / 2 < X_OFFSET) {
			topTooltipX = X_OFFSET + tooltipWidth / 2;
		} else if (x + tooltipWidth / 2 > containerWidth - 5) {
			topTooltipX = containerWidth - 5 - tooltipWidth / 2;
		}

		let bottomTooltipX = x;
		if (x - bottomTooltipWidth / 2 < X_OFFSET) {
			bottomTooltipX = X_OFFSET + bottomTooltipWidth / 2;
		} else if (x + bottomTooltipWidth / 2 > containerWidth - 5) {
			bottomTooltipX = containerWidth - 5 - bottomTooltipWidth / 2;
		}

		topTooltipEl?.style.setProperty('visibility', 'visible');
		bottomTooltipEl?.style.setProperty('visibility', 'visible');

		return {
			topTooltipX,
			bottomTooltipX
		};
	}

	function initializeValues() {
		if (type === 'percent') {
			values = data.map((value) => value * 100);
			maxChartPoint = 100;
			ySteps = [0, 25, 50, 75, 100];
		} else {
			values = data;
			const { maxChartPoint: lineMaxChartPoint, step } = calculateChartStep(total);
			maxChartPoint = lineMaxChartPoint;
			for (let i = 0; i <= maxChartPoint; i += step) {
				ySteps.push(i);
			}
		}
	}

	$: {
		initializeValues();
		labelIndices = calculateIndices(timestamps.length, chartWidth);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div class="chart-container">
	<svg
		width={chartWidth}
		height={chartHeight + Y_OFFSET + 30}
		role="img"
		aria-label="Line chart"
		class="chart-svg"
		on:mousemove={(e) => handleMouseMove(e)}
		on:mouseleave={() => (hoveredPoint = null)}
	>
		<g transform={`translate(0, ${Y_OFFSET})`}>
			<line
				x1={X_OFFSET}
				y1={chartHeight}
				x2={chartWidth - 5}
				y2={chartHeight}
				stroke="white"
				stroke-width="1"
			/>
			{#each ySteps as step, i}
				{#if maxChartPoint > 0}
					{#if i > 0}
						<line
							x1={X_OFFSET}
							y1={chartHeight - (chartHeight * step) / maxChartPoint}
							x2={chartWidth - 5}
							y2={chartHeight - (chartHeight * step) / maxChartPoint}
							stroke="#a3a3a3"
							stroke-dasharray="10"
						/>
					{/if}
					<text
						x={X_OFFSET - 10}
						y={chartHeight - (chartHeight * step) / maxChartPoint + 5}
						font-size={12}
						text-anchor="end"
						fill="#fff"
						>{#if type === 'B'}
							{formatBytes(step)}
						{:else}
							{step.toString()}%
						{/if}
					</text>
				{/if}
			{/each}
			{#each labelIndices as index}
				<line
					x1={X_OFFSET + (index / (timestamps.length - 1)) * (chartWidth - X_OFFSET - 5)}
					y1={chartHeight + 7}
					x2={X_OFFSET + (index / (timestamps.length - 1)) * (chartWidth - X_OFFSET - 5)}
					y2={chartHeight}
					stroke="white"
					stroke-width="1"
				/>
				<text
					x={X_OFFSET + (index / (timestamps.length - 1)) * (chartWidth - X_OFFSET - 5)}
					y={chartHeight + 20}
					text-anchor={index === 0 ? 'start' : index === timestamps.length - 1 ? 'end' : 'middle'}
					font-size="12"
					fill="#fff"
					class="bottom-label"
				>
					{#if timestamps.length === 24}
						{format(new Date(timestamps[index]), 'h:mm a')}
					{:else}
						{format(new Date(timestamps[index]), 'd MMM')}
					{/if}
				</text>
			{/each}
			<defs>
				<linearGradient id={`gradientFill`} x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color={chartColors.default} stop-opacity="0.25" />
					<stop offset="100%" stop-color={chartColors.default} stop-opacity="0" />
				</linearGradient>
			</defs>
			<polygon points={generateFillPoints(values)} fill="url(#gradientFill)" stroke="transparent" />

			<polyline
				fill="none"
				stroke={chartColors.default}
				stroke-width={2}
				points={generatePoints(values)}
			/>
			{#each getDotsPoints(values) as { x, y }}
				{#if hoveredPoint && Math.round(x) === Math.round(hoveredPoint?.x)}
					<line
						x1={hoveredPoint.x}
						y1={0 - 5}
						x2={hoveredPoint.x}
						y2={chartHeight}
						stroke={chartColors.default}
						stroke-width="1"
					/>
					<circle
						cx={x}
						cy={y}
						r={3}
						fill="black"
						stroke={chartColors.default}
						stroke-width="2"
						class="svg-circle"
					/>{/if}
			{/each}
		</g>
	</svg>

	{#if hoveredPoint}
		<div
			class="chart-container__tooltip"
			style="top: {Y_OFFSET - 5}px; left: {hoveredPoint.tooltipData
				.topPosition}px; visibility: hidden;"
			bind:this={topTooltipEl}
		>
			<div class="chart-container__tooltip__item">
				<span>
					{#if hoveredPoint?.tooltipData?.timestamp}
						{#if timestamps.length === 24}
							{format(new Date(hoveredPoint.tooltipData.timestamp), 'EEE, hh:mm a')}
						{:else}
							{format(new Date(hoveredPoint.tooltipData.timestamp), 'EEE, d MMM')}
						{/if}
					{/if}
				</span>
				<span class="chart-container__tooltip__data"
					>{#if type === 'B'}
						{formatBytes(hoveredPoint.tooltipData.value)}
					{:else}
						{hoveredPoint.tooltipData.value.toFixed(2)}%
					{/if}</span
				>
			</div>
		</div>
		<div
			class="chart-container__bottom-tooltip"
			style="top: {chartHeight + Y_OFFSET + 3}px; left: {hoveredPoint.tooltipData
				.bottomPosition}px; visibility: hidden;"
			bind:this={bottomTooltipEl}
		>
			<span>{getTimeAgoString(hoveredPoint.tooltipData.timestamp, timestamps.length !== 24)}</span>
		</div>
	{/if}
</div>

<style>
	.chart-container {
		position: relative;
		width: 100%;
	}

	.chart-container__tooltip {
		position: absolute;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 4px;
		border-radius: 4px;
		background-color: #1f2937;
		color: #a3a3a3;
		pointer-events: none;
		text-align: left;
		font-size: 12px;
		white-space: nowrap;
		transform: translate(-50%, -100%);
	}

	.chart-container__tooltip__data {
		color: #f9fafb;
	}

	.chart-container__tooltip__item {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.chart-container__bottom-tooltip {
		position: absolute;
		z-index: 2;
		border-radius: 4px;
		padding: 4px;
		background-color: #1f2937;
		color: #a3a3a3;
		pointer-events: none;
		text-align: left;
		font-size: 12px;
		white-space: nowrap;
		transform: translateX(-50%);
	}
</style>
