import type { Interval } from '../../../api/statistics';

export default (interval: Interval, timestamps: number[]): number[] => {
	const indices: number[] = [];
	const selectedIndices: number[] = [];

	const startTimestamp = timestamps[0];
	const endTimestamp = timestamps[timestamps.length - 1];

	const hourIndices = Array.from({ length: 12 }, (_, i) => i);
	const dayIndices = [0, 4, 9, 14, 19, 23];
	const weekIndices = [0, 1, 2, 3, 4, 5, 6];
	const monthIndices = [0, 4, 8, 12, 17, 21, 25, 29];

	let customIndices: number[] = [];
	let unit: 'minutes' | 'hours' | 'days';
	let intervalSize: number;

	if (interval === '1h') {
		unit = 'minutes';
		intervalSize = 5;
		customIndices = hourIndices;
	} else if (interval === '1d') {
		unit = 'hours';
		intervalSize = 1;
		customIndices = dayIndices;
	} else if (interval === '7d') {
		unit = 'days';
		intervalSize = 1;
		customIndices = weekIndices;
	} else if (interval === '30d') {
		unit = 'days';
		intervalSize = 1;
		customIndices = monthIndices;
	} else {
		return [];
	}

	const applyRounding = (value: number, roundUp: boolean, interval: number) => {
		return roundUp
			? Math.ceil(value / interval) * interval
			: Math.floor(value / interval) * interval;
	};

	function roundTimestamp(
		timestamp: number,
		roundUp: boolean,
		unit: 'minutes' | 'hours' | 'days',
		interval: number = 5
	): number {
		const date = new Date(timestamp);

		switch (unit) {
			case 'minutes': {
				const minutes = applyRounding(date.getMinutes(), roundUp, interval);
				date.setMinutes(minutes, 0, 0);
				break;
			}
			case 'hours': {
				let hours = applyRounding(date.getHours(), roundUp, interval);
				if (roundUp && date.getMinutes() !== 0) {
					hours = Math.max(hours, Math.floor(date.getHours() / interval) * interval + interval);
				}
				date.setHours(hours, 0, 0, 0);
				break;
			}
			case 'days': {
				date.setHours(0, 0, 0, 0);
				if (roundUp) {
					date.setDate(date.getDate() + 1);
				}
				break;
			}
		}

		return date.getTime();
	}

	const roundedStart = roundTimestamp(startTimestamp, true, unit, intervalSize);
	const roundedEnd = roundTimestamp(endTimestamp, false, unit, intervalSize);

	let currentTimestamp = roundedStart;
	for (let i = 0; currentTimestamp <= roundedEnd; i++) {
		if (customIndices.includes(i)) {
			selectedIndices.push(currentTimestamp);
		}

		const date = new Date(currentTimestamp);
		if (unit === 'minutes') {
			date.setMinutes(date.getMinutes() + intervalSize);
		} else if (unit === 'hours') {
			date.setHours(date.getHours() + intervalSize);
		} else if (unit === 'days') {
			date.setDate(date.getDate() + intervalSize);
		}

		currentTimestamp = date.getTime();
	}

	for (let i = 0; i < timestamps.length; i++) {
		const timestamp = timestamps[i];
		if (selectedIndices.includes(timestamp)) {
			indices.push(i);
		} else if (unit === 'days' && interval === '30d') {
			if (
				selectedIndices.some(
					(selectedTimestamp) =>
						new Date(timestamp).toDateString() === new Date(selectedTimestamp).toDateString() &&
						Math.abs(timestamp - selectedTimestamp) <= 60 * 60 * 1000
				)
			) {
				indices.push(i);
			}
		}
	}
	return indices;
};



