import { createQuery } from '@tanstack/svelte-query';
import { getChartStatistics, type Interval } from '../../api/statistics';

export const useChartStatistics = (params: { interval?: Interval } = {}) => {
	let refetchInterval: number;
	if (params.interval === '1d') {
		refetchInterval = 3600000;
	} else {
		refetchInterval = 86400000;
	}
	return createQuery({
		queryKey: ['all-projects', params],
		queryFn: async () => {
			const response = await getChartStatistics(params);
			const { chart, values } = response.data;
			return { chart, values };
		},
		refetchInterval
	});
};
