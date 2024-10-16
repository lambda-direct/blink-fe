import { createQuery } from '@tanstack/svelte-query';

import { getChartStatistics, type Interval } from '../../api/statistics';

export const useChartStatistics = (params: { interval?: Interval } = {}) => {
	return createQuery({
		queryKey: ['all-projects', params],
		queryFn: async () => {
			const response = await getChartStatistics(params);
			const { chart } = response.data;

			return chart;
		}
	});
};
