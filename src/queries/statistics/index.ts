import { createQuery } from '@tanstack/svelte-query';
import { getChartStatistics, getHttpStats, type Interval } from '../../api/statistics';

export const getRefetchInterval = (interval?: Interval): number => {
	if (interval === '1d') {
		return 3600000;
	}
	return 86400000;
};

export const useChartStatistics = (params: { interval?: Interval } = {}) => {
	const refetchInterval = getRefetchInterval(params.interval);
	return createQuery({
		queryKey: ['chart-data', params],
		queryFn: async () => {
			const response = await getChartStatistics(params);
			const { chart, values } = response.data;
			return { chart, values };
		},
		refetchInterval
	});
};

export const useHttpStats = (
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) => {
	const refetchInterval = getRefetchInterval(params.interval);

	return createQuery({
		queryKey: ['http-stats', projectId, serviceId, params],
		queryFn: async () => {
			const response = await getHttpStats(projectId, serviceId, params);
			const { responseTimeChart, statusCodeCountChart } = response.data;
			return { responseTimeChart, statusCodeCountChart };
		},
		refetchInterval
	});
};
