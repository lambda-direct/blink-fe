import { get, writable } from 'svelte/store';
import type { Selected } from 'bits-ui';
import { periods, type Interval } from '../api/statistics';

const DEFAULT_VALUE: Interval = '1h';

export const selectedPeriod = writable<Interval>(
	typeof window !== 'undefined'
		? (localStorage.getItem('selectedPeriod') as Interval) || DEFAULT_VALUE
		: DEFAULT_VALUE
);

export function setSelectedPeriod(value: Interval) {
	localStorage.setItem('selectedPeriod', value);
	selectedPeriod.set(value);
}

export function getSelectedPeriod(): Interval {
	return get(selectedPeriod);
}

export function getSelectedObject(): Selected<Interval> {
	const value = get(selectedPeriod);
	const label = periods.find((p) => p.value === value)?.label;
	return { value, label };
}
