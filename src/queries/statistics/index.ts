import { createQuery } from '@tanstack/svelte-query';
import {
	getChartStatistics,
	getHttpStats,
	getServiceResourceUsage,
	type Interval
} from '../../api/statistics';

export const getRefetchInterval = (interval?: Interval): number => {
	// if (interval === '1h') {
	// 	return 15000;
	// }
	// if (interval === '1d') {
	// 	return 120000;
	// }
	// if (interval === '7d') {
	//     return 300000;
	// }
	return 3600000;
};

export const useChartStatistics = (instanceId: string, params: { interval?: Interval } = {}) => {
	const refetchInterval = getRefetchInterval(params.interval);
	return createQuery({
		queryKey: ['chart-data', instanceId, params],
		queryFn: async () => {
			const response = await getChartStatistics(instanceId, params);
			const { chart, values } = response.data;
			return { chart, values };
		},
		refetchInterval,
		enabled: !!instanceId,
		retry: false
	});
};

export const useHttpStats = (
	instanceId: string,
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) => {
	const refetchInterval = getRefetchInterval(params.interval);

	return createQuery({
		queryKey: ['http-stats', instanceId, projectId, serviceId, params],
		queryFn: async () => {
			const response = await getHttpStats(instanceId, projectId, serviceId, params);
			const { responseTimeChart, statusCodeCountChart } = response.data;
			return { responseTimeChart, statusCodeCountChart };
		},
		refetchInterval,
		enabled: !!instanceId,
		retry: false
	});
};

export const useServiceResourceUsage = (
	instanceId: string,
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) => {
	const refetchInterval = getRefetchInterval(params.interval);

	return createQuery({
		queryKey: ['service-chart-data', instanceId, projectId, serviceId, params],
		queryFn: async () => {
			const response = await getServiceResourceUsage(instanceId, projectId, serviceId, params);
			const { chart, values } = response.data;
			return { chart, values };
		},
		refetchInterval,
		enabled: !!instanceId,
		retry: false
	});
};
